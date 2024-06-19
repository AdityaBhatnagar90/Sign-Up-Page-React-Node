const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg');
const port = 4000;

// Postgres connection
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'users',
  password: '12345678',
  port: 5432
});
client.connect();

// Express and Requests
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Function to calculate lock expiration time (12 hours from now)
function calculateLockExpiration() {
  const lockUntil = new Date();
  lockUntil.setHours(lockUntil.getHours() + 12); // Lock for 12 hours
  return lockUntil;
}

// Login Check
app.post('/login', (req, res) => {
  const { userid, password } = req.body;

  client.query('SELECT * FROM userinfo WHERE userid=$1', [userid], (err, dbres) => {
    if (err) {
      console.error('Error executing query', err.stack);
      return res.status(500).send('Internal Server Error');
    }

    if (dbres.rows.length === 0) {
      return res.status(401).send('User not found');
    }

    const user = dbres.rows[0];
    const attempts = user.attempts || 0;
    const locktill = user.locktill;

    // Check if the account is locked
    if (locktill && locktill > new Date()) {
      const lockedUntilTime = new Date(locktill).toLocaleString();
      return res.status(403).send(`Account locked until ${lockedUntilTime}`);
    }

    // Check if password is incorrect
    if (password !== user.pass) {
      const newAttempts = attempts + 1;

      // If newAttempts reaches 5, lock the account for 12 hours
      if (newAttempts >= 5) {
        const lockUntil = calculateLockExpiration();
        client.query('UPDATE userinfo SET attempts=$1, locktill=$2 WHERE userid=$3', [newAttempts, lockUntil, userid], (updateErr, updateRes) => {
          if (updateErr) {
            console.error('Error updating attempts and locktill', updateErr.stack);
            return res.status(500).send('Internal Server Error');
          }
          return res.status(403).send(`Account locked until ${lockUntil.toLocaleString()}`);
        });
      } else {
        // Update attempts counter only
        client.query('UPDATE userinfo SET attempts=$1 WHERE userid=$2', [newAttempts, userid], (updateErr, updateRes) => {
          if (updateErr) {
            console.error('Error updating attempts', updateErr.stack);
            return res.status(500).send('Internal Server Error');
          }
          return res.status(401).send('Incorrect password');
        });
      }
    } else {
      // If password is correct, reset attempts and locktill
      client.query('UPDATE userinfo SET attempts=0, locktill=NULL WHERE userid=$1', [userid], (updateErr, updateRes) => {
        if (updateErr) {
          console.error('Error resetting attempts and locktill', updateErr.stack);
          return res.status(500).send('Internal Server Error');
        }
        return res.status(200).send('Login successful');
      });
    }
  });
});

// New User registration
app.post('/register', (req, res) => {
  const { userid, password } = req.body;

  // Check if userid already exists
  client.query('SELECT * FROM userinfo WHERE userid=$1', [userid], (err, dbres) => {
    if (err) {
      console.error('Error executing query', err.stack);
      return res.status(500).send('Internal Server Error');
    }

    if (dbres.rows.length > 0) {
      return res.status(400).send('User ID already exists');
    }

    // Insert new user
    client.query('INSERT INTO userinfo (userid, pass) VALUES ($1, $2)', [userid, password], (insertErr, insertRes) => {
      if (insertErr) {
        console.error('Error executing query', insertErr.stack);
        return res.status(500).send('Internal Server Error');
      }

      console.log('User registered successfully');
      const loginPageLink = '<a href="http://localhost:3000/">Click here to go to login page</a>';
      res.status(200).send(`Registration successful. ${loginPageLink}`);
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log('Server running on port', port);
});
