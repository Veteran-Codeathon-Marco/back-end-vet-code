var express = require('express');
var app = express();
var fs = require("fs");
var mysql = require('mysql2');
// const rootPass = require('./secrets');
const port = process.env.PORT || 3000;

app.use(express.static(__dirname))
app.use(
  express.urlencoded({
  extended: true
  })
)

if (process.env.NODE_ENV !== 'production') { require('dotenv').config() }

app.use(express.json());

//create server
app.listen(port, () =>
  console.log(`Vet API listening on port ${port}!`),
);

//create database connection
var con = mysql.createPool({
    host: "us-cdbr-east-03.cleardb.com",
    user: "b9e533a14b394b",
    password: '0d3e9617',
    database: "heroku_5eadd1519f813b4",
  });
  // mysql://b9e533a14b394b:0d3e9617@us-cdbr-east-03.cleardb.com/heroku_5eadd1519f813b4?reconnect=true
  
//confirm connection  
    let sql = "CREATE TABLE IF NOT EXISTS `posts` ( `post_id` int NOT NULL AUTO_INCREMENT COMMENT 'primary key', `post_time` datetime DEFAULT CURRENT_TIMESTAMP, `post_type` enum('Sell','Buy') NOT NULL, `price` decimal(20,2) DEFAULT NULL, `post_amount` varchar(255) DEFAULT NULL, `post_description` text, `post_image_url` varchar(255) DEFAULT NULL, `post_location` varchar(255) DEFAULT NULL, `user_id` int unsigned NOT NULL, `post_name` varchar(255) NOT NULL, PRIMARY KEY (`post_id`), KEY `user_id` (`user_id`), FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) )"
    con.query(sql, function (err, result) {
      if (err) console.error(err);
    });
    sql = "CREATE TABLE IF NOT EXISTS `teams` ( `team_id` int NOT NULL AUTO_INCREMENT COMMENT 'primary key', `team_name` varchar(255) NOT NULL, `team_categories` varchar(255) NOT NULL, `team_description` text, `team_image_url` varchar(255) DEFAULT NULL, PRIMARY KEY (`team_id`) )";
    con.query(sql, function (err, result) {
      if (err) console.error(err);
    });
    sql = "CREATE TABLE IF NOT EXISTS `users` ( `user_id` int unsigned NOT NULL AUTO_INCREMENT, `first_name` varchar(63) NOT NULL, `last_name` varchar(63) NOT NULL, `email` varchar(127) NOT NULL, `password` varchar(255) NOT NULL, `profile_image_url` varchar(255) DEFAULT NULL, `team_id` int DEFAULT NULL, PRIMARY KEY (`user_id`), UNIQUE KEY `email` (`email`), KEY `team_id` (`team_id`), FOREIGN KEY (`team_id`) REFERENCES `teams` (`team_id`) )";
    con.query(sql, function (err, result) {
      if (err) console.error(err);
    });


app.get('/', (req, res) => {
  res.write("Hello!");
  res.end();
});
/*-------START OF TEAMS API-------*/

//get all teams
app.get('/teams', (req, res) => {
  var sql = "SELECT * FROM teams";
  con.query(sql, function (err, result) {
    if (err) console.error(err);
    res.json(result)
    res.end()
  });
})

//get one team by id
app.get('/teams/:id', (req, res) => {
  let url = req.url;
  let arr = url.split("/");
  let id = arr[arr.length - 1];
  var sql = "SELECT * FROM teams WHERE team_id = ?";
  con.query(sql, [id], function (err, result) {
    if (err) console.error(err);
    res.json(result);
  });
})

//create a team
app.post('/teams/new', (req, res) => {
  let name = req.body.name;
  let categories = req.body.categories;
  let description = req.body.description;
  let imageURL = req.body.imageURL;
  console.log(name, categories, description);
  var sql = "INSERT INTO teams (team_name, team_categories, team_description, team_image_url) VALUES (?, ?, ?, ?)";
  con.query(sql, [name, categories, description, imageURL], function (err, result) {
    if (err) console.error(err);
    res.send("Created new team!");
  });
})

//update team
app.put('/teams/:id', (req, res) => {
  let url = req.url;
  let arr = url.split("/");
  let id = arr[arr.length - 1];
  let name = req.body.name;
  let categories = req.body.categories;
  let description = req.body.description;
  var sql = "REPLACE INTO teams (team_id), team_name, team_categories, team_description) VALUES (?, ?, ?, ?)";
  con.query(sql, [id, name, categories, description], function (err, result) {
    if (err) console.error(err);
    res.send("Edited team!");
  });
})

//delete team
app.delete('/teams/:id', (req, res) => {
  let url = req.url;
  let arr = url.split("/");
  let id = arr[arr.length - 1];
  var sql = "DELETE FROM teams WHERE team_id = ?";
  con.query(sql, id, function (err, result) {
    if (err) console.error(err);
    res.send("Deleted team!");
  });
})

/*-------START OF POSTS API-------*/

//get all posts
app.get('/posts', (req, res) => {
  var sql = "SELECT * FROM posts";
  con.query(sql, function (err, result) {
    if (err) console.error(err);
    res.json(result);
  });
})

//get one post by id
app.get('/posts/:id', (req, res) => {
  let url = req.url;
  let arr = url.split("/");
  let id = arr[arr.length - 1];
  var sql = "SELECT * FROM posts WHERE post_id = ?";
  con.query(sql, [id], function (err, result) {
    if (err) console.error(err);
    res.json(result);
  });
})

//create a post
app.post('/posts/new', (req, res) => {
  let type = req.body.type;
  let price = req.body.price;
  let amount = req.body.amount;
  let description = req.body.description;
  let imageURL = req.body.imageURL;
  let location = req.body.location;
  let name = req.body.name;
  let userID = req.body.userID;

  var sql = "INSERT INTO posts (post_time, post_type, price, post_amount, post_description, post_image_url, post_location, post_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  con.query(sql, [type, price, amount, description, imageURL, location, name, userID], function (err, result) {
    if (err) console.error(err);
    res.send("Created new post!");
  });
})

//update post
app.put('/posts/:id', (req, res) => {
  let type = req.body.type;
  let price = req.body.price;
  let amount = req.body.amount;
  let description = req.body.description;
  let imageURL = req.body.imageURL;
  let location = req.body.location;
  let name = req.body.name;
  let userID = req.body.userID;

  var sql = "INSERT INTO posts (post_type, price, post_amount, post_description, post_image_url, post_location, post_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  con.query(sql, [type, price, amount, description, imageURL, location, name, userID], function (err, result) {
    if (err) console.error(err);
    res.send("Edited post!");
  });
})

//delete post
app.delete('/posts/:id', (req, res) => {
  let url = req.url;
  let arr = url.split("/");
  let id = arr[arr.length - 1];
  var sql = "DELETE FROM posts WHERE post_id = ?";
  con.query(sql, id, function (err, result) {
    if (err) console.error(err);
    res.send("Deleted post!");
  });
})

/*-------START OF USERS API-------*/

//get all users
app.get('/users', (req, res) => {
  var sql = "SELECT * FROM users";
  con.query(sql, function (err, result) {
    if (err) console.error(err);
    res.json(result);
  });
})

//get one user by id
app.get('/users/:id', (req, res) => {
  let url = req.url;
  let arr = url.split("/");
  let id = arr[arr.length - 1];
  var sql = "SELECT * FROM users WHERE user_id = ?";
  con.query(sql, [id], function (err, result) {
    if (err) console.error(err);
    res.json(result);
  });
})

//create a user
app.post('/users/new', (req, res) => {
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let email = req.body.email;
  let password = req.body.password;
  let imageURL = req.body.imageURL;
  let teamID = req.body.teamID;

  var sql = "INSERT INTO users (first_name, last_name, email, password, profile_image_url, team_id) VALUES (?, ?, ?, ?, ?, ?)";
  con.query(sql, [firstName, lastName, email, password, imageURL, teamID], function (err, result) {
    if (err) console.error(err);
    res.send("Created new user!");
  });
})

//update a user
app.post('/users/new', (req, res) => {
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let email = req.body.email;
  let password = req.body.password;
  let imageURL = req.body.imageURL;
  let teamID = req.body.teamID;

  var sql = "INSERT INTO users (first_name, last_name, email, password, profile_image_url, team_id) VALUES (?, ?, ?, ?, ?, ?)";
  con.query(sql, [firstName, lastName, email, password, imageURL, teamID], function (err, result) {
    if (err) console.error(err);
    res.send("Updated user!");
  });
})

//delete user
app.delete('/users/:id', (req, res) => {
  let url = req.url;
  let arr = url.split("/");
  let id = arr[arr.length - 1];
  var sql = "DELETE FROM posts WHERE user_id = ?";
  con.query(sql, id, function (err, result) {
    if (err) console.error(err);
    res.send("Deleted user!");
  });
})

