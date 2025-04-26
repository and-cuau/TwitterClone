const express = require('express');
const app = express();
const PORT = 3000;
const bodyParser = require('body-parser');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./storage.db');
const cors = require('cors');

app.use(cors());

app.use(express.json()); // imprtant for reading req body ! ✅ Modern, built-in way

db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE
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
  follower TEXT
)`);

console.log('Test log');

module.exports = db;

// Root route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.post('/users', (req, res) =>{ // post new user
  console.log('POST /users was called');
  const username = req.body.username;

  console.log('Test: ' + username);

  db.run('INSERT OR IGNORE INTO users (username) VALUES (?)', [username], function(err){ 
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
        return res.send({ id: row.id});
      });
    } else {
      console.log(`New user inserted with ID: ${this.lastID}`);
      return res.send({ id: this.lastID });
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

app.post('/posts', (req, res) => {   // post new post
  console.log('POST /posts was called');

  const { username, text } = req.body;

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

app.post('/reactions', (req, res) => {   // update post with reaction
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

// db.run(`CREATE TABLE IF NOT EXISTS reactions (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   post_id INTEGER,
//   user_id INTEGER,
//   reaction TEXT
// )`);

app.post('/followers', (req, res) => { // post new follower
  // user and follower  
  // res.send('POST /followers was called');
  const { username, follower } = req.body;
  console.log(username + " -- " + follower);

  db.run('INSERT INTO followers (username, follower) VALUES (?, ?)', [username, follower], function(err){
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

// app.get('/followers', (req, res) => { // get follower count
//   // user and follower
//   db.get('SELECT COUNT(*) AS count FROM your_table_name WHERE name = ?', [username], (err, row) => {
//     if (err) {
//       console.error('Error running COUNT query:', err);
//     } else {
//       console.log(`Number of rows: ${row.count}`);
//       res.send(String(row.count));
//     }
//   });
// });

app.get('/followers', (req, res) => {   // get all user's followers
  console.log("GET followers was executed");
  // const { username } = req.body;
  const username = req.query.username;

  // user and follower
  db.all('SELECT * FROM followers WHERE username = ?', [username], (err, rows) => {
    if (err) {
      console.error('Error running COUNT query:', err);
    } else {
      res.send(rows);
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