var express = require('express');
var app = express();
var fs = require("fs");
var mysql = require('mysql2');
const rootPass = require('./secrets.js');
const port = process.env.PORT || 3000;

app.use(express.static(__dirname))
app.use(
  express.urlencoded({
  extended: true
  })
)
app.use(express.json());

//create server
app.listen(8080, '0.0.0.0', () =>
  console.log(`Vet API listening on port ${port}!`),
);

//create database connection
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: rootPass,
    database: "veteran_db"
  });
  
//confirm connection  
con.connect(function(err) {
    if (err) console.error(err);
    console.log("Connected!");
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
    res.send(result);
  });
})

//get one group by id
app.get('/teams/:id', (req, res) => {
  let url = req.url;
  let arr = url.split("/");
  let id = arr[arr.length - 1];
  var sql = "SELECT * FROM teams WHERE team_id = ?";
  con.query(sql, [id], function (err, result) {
    if (err) console.error(err);
    res.send(result);
  });
})

//create a group
app.post('/teams/new', (req, res) => {
  let name = req.body.name;
  let categories = req.body.categories;
  let description = req.body.description;
  console.log(name, categories, description);
  var sql = "INSERT INTO teams (team_name, team_categories, team_description) VALUES (?, ?, ?)";
  con.query(sql, [name, categories, description], function (err, result) {
    if (err) console.error(err);
    res.send("Created new team!");
  });
})

//update group
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

//delete group
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
    res.send(result);
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
    res.send(result);
  });
})

//create a post
app.post('/posts/new', (req, res) => {
  let time = req.body.time;
  let type = req.body.type;
  let price = req.body.price;
  let amount = req.body.amount;
  let description = req.body.description;
  let imageURL = req.body.imageURL;
  let location = req.body.location;
  let name = req.body.name;
  let userID = req.body.userID;

  var sql = "INSERT INTO posts (post_time, post_type, price, post_amount, post_description, post_image_url, post_location, post_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  con.query(sql, [time, type, price, amount, description, imageURL, location, name, userID], function (err, result) {
    if (err) console.error(err);
    res.send("Created new post!");
  });
})

//update post
app.put('/posts/:id', (req, res) => {
  let time = req.body.time;
  let type = req.body.type;
  let price = req.body.price;
  let amount = req.body.amount;
  let description = req.body.description;
  let imageURL = req.body.imageURL;
  let location = req.body.location;
  let name = req.body.name;

  var sql = "INSERT INTO posts (post_time, post_type, price, post_amount, post_description, post_image_url, post_location, post_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  con.query(sql, [time, type, price, amount, description, imageURL, location, name], function (err, result) {
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
    res.send(result);
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
    res.send(result);
  });
})

//create a user
app.post('/users/new', (req, res) => {
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let email = req.body.email;
  let password = req.body.password;
  let profileURL = req.body.profileURL;
  let teamID = req.body.teamID;

  var sql = "INSERT INTO users (first_name, last_name, email, password, profile_image_url, team_id) VALUES (?, ?, ?, ?, ?, ?)";
  con.query(sql, [firstName, lastName, email, password, profileURL, teamID], function (err, result) {
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
  let profileURL = req.body.profileURL;
  let teamID = req.body.teamID;

  var sql = "INSERT INTO users (first_name, last_name, email, password, profile_image_url, team_id) VALUES (?, ?, ?, ?, ?, ?)";
  con.query(sql, [firstName, lastName, email, password, profileURL, teamID], function (err, result) {
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

