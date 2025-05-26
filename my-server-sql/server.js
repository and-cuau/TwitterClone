const express = require('express');
const app = express();
const PORT = 3000;

const bodyParser = require('body-parser');
const util = require('util');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logAction = require('./logaction');

// SECRET to sign tokens (keep this hidden!)
const SECRET = 'my_super_secret_key';

// When user logs in:
function generateToken(user) {
    return jwt.sign(
        { userId: user.id, role: user.role },
        SECRET,
        { expiresIn: '1h' }
    );
}
// Middleware to protect routes:
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1].trim();

    // console.log("this is the token at auth:" + token);

    // const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET, (err, user) => {
      console.log("before 403");
        if (err) return res.sendStatus(403);
        req.user = user;
        console.log("next called");
        next();
    });
}

function authorizeAdmin(req, res, next){
  if (req.user.role !== 'admin') {
    return res.sendStatus(403);
  }
  next();
}


const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./storage.db');
const cors = require('cors');

app.use(cors());

app.use(express.json()); // imprtant for reading req body ! Modern, built-in way

app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.db = db; // now req.db is available in routes
  next();
});

db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL
)`);

// Create table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    username TEXT NOT NULL,
    text TEXT NOT NULL
)`);

db.run(`CREATE TABLE IF NOT EXISTS reactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER,
  user_id INTEGER,
  reaction TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS followers (
  user_id INTEGER,
  username TEXT,
  follower_id INTEGER,
  follower TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  target_id INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT
)`);

console.log('Test log');

module.exports = db;

// Promisify db methods
db.get = util.promisify(db.get);


const originalRun = db.run;

db.run = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    originalRun.call(this, sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
};

// Root route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.post('/users',  async (req, res) =>{ // post new user  (sign up)
  console.log('POST /users was called');
  const username = req.body.username;
  const password = req.body.password;
  const hash = await bcrypt.hash(password, 10);
  console.log("hash: " + hash);
  const role = req.body.role;

  console.log('Test: ' + username);

  db.run('INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)', [username, hash, role], function(err){ 
    if (this.changes === 0) {
      db.get('SELECT id FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
          console.error('Error retrieving existing user:', err);
          return res.status(500).send('Database error');
        }
        return res.send({msg: "Username is already taken", id: row.id}); // not sure what i use row.id sent back for
      });
    } else {
      console.log(`New user inserted with ID: ${this.lastID}`);

      return res.send({ id: this.lastID});
    }
  });
});


app.post('/users/login', async (req, res) =>{ // check for user
  console.log('POST /users/login was called');
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  console.log('Test: ' + username);

  try {
  const row = await db.get('SELECT * FROM users WHERE username = ?', [username]);

  console.log("row: ");
  console.log(row);

  if (!row) return res.status(404).json({ error: 'User not found' });

  console.log(row.password);
  console.log(password);

  const isMatch = await bcrypt.compare(password, row.password); // This works fine here

  if (isMatch) {

    const userobj = {id: row.id, role: "user"};
    const token = generateToken(userobj);

    const safeUserInfo = {
      id: row.id,
      username: row.username,
      role: row.role,
    };  // add row.role ?
    
    const data = {userInfo: safeUserInfo, token: token}

    console.log("Successful log-in")
    console.log(data);
    return res.send(data);

  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
} catch (err){
  console.log("server error confirmed");
  res.status(500).json({ error: 'Server error' });
}
});

app.post('/users/admin/login', async (req, res) =>{ // check for user (admin)
  console.log('POST /users/admin/login was called');
  const username = req.body.username;
  const password = req.body.password;
  console.log('Test: ' + username);

  try {
    // Assume you fetched the user and their hashed password from DB
    const row = await db.get('SELECT * FROM users WHERE username = ? AND role = "admin"', [username]);

    if (!row) return res.status(404).json({ error: 'Admin not found' });

    const isMatch = await bcrypt.compare(password, row.password); // This works fine here

    if (isMatch) {
      const userobj = {id: row.id, role: "admin"};
      const token = generateToken(userobj);
      
      const safeUserInfo = {
        id: row.id,
        username: row.username,
        role: row.role
      };  // added row.role. front end doesnt use it for the moment

      const data = {userInfo: safeUserInfo, token: token}

      return res.send(data);
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }


});

app.get('/posts', (req, res) => {  // get all commmunity posts except for user's
  console.log('GET /posts was called');

  const user_id = req.query.user_id;

  db.all('SELECT * FROM posts WHERE user_id != ?', [user_id], (err, rows) => {
    if (err) {
      throw err;
    }
    res.send(rows);
  });
});

app.get('/posts/user', (req, res) => {  //  get all user's posts
  console.log('GET /posts/user was called');
  const username = req.query.username;

  console.log(username);

  db.all('SELECT * FROM posts WHERE username = ?', [username], (err, rows) => {
    if (err) {
      throw err;
    }
    res.send(rows);
  });
});

app.post( // post new post
  '/posts',
  authenticateToken,
  logAction('POST_CREATED', (req) => req.postId),
  async (req, res) => {
    const { user_id, username, text } = req.body;
    const result = await db.run(
      'INSERT INTO posts (user_id, username, text) VALUES (?, ?, ?)',
      [user_id, username, text]
    );

    const postId = result.lastID;
    req.postId = postId; // logAction will read this after res finishes

    res.json({ message: 'Post created', postId });
  }
);


app.post('/reactions', authenticateToken, (req, res) => { // update post with reaction
  console.log('POST /reactions was called');

  post_id = req.body.message_id;
  user_id = req.body.user_id;
  reaction = req.body.reaction;

  console.log("TEST: " + post_id + " " + user_id);

  db.run('INSERT INTO reactions (post_id, user_id, reaction) VALUES (?, ?, ?)', [post_id, user_id, reaction], function(err){
    if (err){
      console.error('Error inserting data:', err);
      return;
    }
    console.log(`New reaction inserted with ID: ${this.lastID}`)
  });

  db.all('SELECT * FROM reactions', [], (err, rows) => {
    if (err) {
      throw err;
    }
    console.log(rows);
  });
  res.send('Hello, World!');
});

app.post('/followers', authenticateToken, (req, res) => { // post new follower
  // user and follower  
  // res.send('POST /followers was called');
  const { username, follower , follower_id} = req.body;
  console.log(username + " -- " + follower);

  db.run('INSERT INTO followers (username, follower, follower_id) VALUES (?, ?, ?)', [username, follower, follower_id], function(err){
    if (err){
      console.error('Error inserting data:', err);
      return;
    }
    console.log(`New follower inserted with ID: ${this.lastID}`)
  });
  db.all('SELECT * FROM followers', [], (err, rows) => {
    if (err) {
      throw err;
    }
     console.log(rows);
  });
});


app.get('/followers', authenticateToken, (req, res) => {   // get all user's followers
  console.log("GET followers was executed");
  // const { username } = req.body;
  const username = req.query.username;

  folandcount = {};

  // user and follower
  db.all('SELECT * FROM followers WHERE username = ?', [username], (err, rows) => {
    if (err) {
      console.error('Error running SELECT query:', err);
      return res.status(500).send('Database error');
    } else {
      folandcount.followers = rows;

      // Second query: get count
      db.all('SELECT COUNT(*) AS count FROM followers WHERE username = ?', [username], (err2, row2) => {
        if (err2) {
          console.error('Error running COUNT query:', err2);
          return res.status(500).send('Database error');
        } else {
          folandcount.count = row2[0].count;

          // Now send AFTER both queries are done
          return res.send(folandcount);
        }
      });
    }
  });

});

app.get('/users', (req, res) => { // gets all users 
  console.log("GET users was executed");
  const id = req.query.id;
  db.all('SELECT * FROM users WHERE role = "user" AND id !=  ?', [id], (err, rows) => {
    if (err) {
      console.error(err.message);
      return;
    }
    console.log(rows);
    res.send(rows);
  });
  console.log("hey this line was executed!");
});

app.delete('/posts', authenticateToken, authorizeAdmin, (req, res) => { // deletes post
  console.log("DELETE posts was executed");
  const post_id = req.query.post_id;
   db.run("DELETE FROM posts where id = ?", [post_id], (err, rows) => {
     if (err) {
       console.error(err.message);
       return;
     }
     console.log(rows);
     res.send(rows);
   });
  console.log("hey this line was executed!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});