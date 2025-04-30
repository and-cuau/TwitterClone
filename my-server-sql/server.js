const express = require('express');
const app = express();
const PORT = 3000;
const bodyParser = require('body-parser');



const jwt = require('jsonwebtoken');

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
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./storage.db');
const cors = require('cors');

app.use(cors());

app.use(express.json()); // imprtant for reading req body ! ✅ Modern, built-in way

app.use(express.urlencoded({ extended: true }));

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

console.log('Test log');

module.exports = db;

// Root route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.post('/users', (req, res) =>{ // post new user  (sign up)
  console.log('POST /users was called');
  const username = req.body.username;
  const password = req.body.password;
  const role = req.body.role;

  console.log('Test: ' + username);

  db.run('INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)', [username, password, role], function(err){ 
    if (err){
      console.error('Error inserting data:', err);
      return;
    }
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

app.get('/users/exists', (req, res) =>{ // check for user
  console.log('GET /users/exists was called');
  const username = req.query.username;
  const password = req.query.password;

  console.log('Test: ' + username);

  db.get('SELECT * FROM users WHERE username = ? AND role = "user"', [username], function(err, row){ 
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Database error' });
    } else if (row) {
      if (row.password == password){
        const userobj = {id: row.id, role: "user"};
        const token = generateToken(userobj);

        const safeUserInfo = {
          id: row.id,
          username: row.username,
        };  // add row.role ?

        const data = {userInfo: safeUserInfo, token: token}
        console.log(data);
        return res.send(data);

      } else{
        return res.status(404).json({ username: "Invalid username or password (debug: username exists but password is incorrect)", id: "0"});
      }
    }
    else{
      return res.status(404).json({ username: "Invalid username or password (debug: username does not exist)", id:"0" });
    }
  });
});


app.get('/users/admin/exists', (req, res) =>{ // check for user
  console.log('GET /users/exists was called');
  const username = req.query.username;
  const password = req.query.password;
  console.log('Test: ' + username);

db.get('SELECT * FROM users WHERE username = ? AND role = "admin"', [username], function(err, row){ 
  if (err) {
    console.error(err.message);
    return res.status(500).json({ error: 'Database error' });
  } else if (row) {
    if (row.password == password){
      const userobj = {id: row.id, role: "user"};
      const token = generateToken(userobj);

      const safeUserInfo = {
        id: row.id,
        username: row.username,
      };  // add row.role ?

      const data = {userInfo: safeUserInfo, token: token}
      console.log(data);
      return res.send(data);

    } else{
      return res.status(404).json({ username: "Invalid username or password (debug: username exists but password is incorrect)", id: "0"});
    }
  }
  else{
    return res.status(404).json({ username: "Invalid username or password (debug: username does not exist)", id:"0" });
  }
});
});

app.get('/posts', (req, res) => {  // get all commmunity posts
  // console.log('GET /posts was called');

  db.all('SELECT * FROM posts', [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.send(rows);
  });
});

app.get('/posts/user', (req, res) => {  //  get all user's posts
  // console.log('GET /posts/user was called');
  const username = req.query.username;

  console.log(username);

  db.all('SELECT * FROM posts WHERE username = ?', [username], (err, rows) => {
    if (err) {
      throw err;
    }
    res.send(rows);
  });
});

app.post('/posts', authenticateToken, (req, res) => {   // post new post
  console.log('POST /posts was called');
  const { username, text } = req.body;

  // console.log(req.user);

  db.run('INSERT INTO posts (username, text) VALUES (?, ?)', [username, text], function(err){
    if (err){
      console.error('Error inserting data:', err);
      return;
    }
    console.log(`New post inserted with ID: ${this.lastID}`)
  });

  db.all('SELECT * FROM posts', [], (err, rows) => {
    if (err) {
      throw err;
    }
    console.log(rows);
  });
  res.send('Hello, World!');
});

app.post('/reactions', authenticateToken, (req, res) => {   // update post with reaction
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
  db.all("SELECT * FROM users", [], (err, rows) => {
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