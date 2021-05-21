var express = require('express');
var app = express();
var fs = require("fs");
var mysql = require('mysql2');

app.use(express.static(__dirname))
app.use(
  express.urlencoded({
  extended: true
  })
)
app.use(express.json());

//create server
app.listen(8080, () =>
  console.log('Example app listening on port 8080!'),
);

//create database connection
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Redsox031391",
    database: "veteran_db",
    insecureAuth : true,
  });
  
//confirm connection  
con.connect(function(err) {
    if (err) console.error(err);
    console.log("Connected!");
});

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
  var sql = "SELECT * FROM teams WHERE id = ?";
  con.query(sql, [id], function (err, result) {
    if (err) console.error(err);
    res.send(result);
  });
})

//create a group
app.post('/teams/createTeam', (req, res) => {
  let name = req.body.name;
  let categories = req.body.categories;
  let description = req.body.description;
  console.log(name, categories, description);
  var sql = "INSERT INTO teams (team_name, team_categories, team_description) VALUES (?, ?, ?)";
  con.query(sql, [name, categories, description], function (err, result) {
    if (err) console.error(err);
    res.send("Created new group!");
  });
})

//update group
app.put('/teams/editTeam/:id', (req, res) => {
  let url = req.url;
  let arr = url.split("/");
  let id = arr[arr.length - 1];
  let name = req.body.name;
  let categories = req.body.categories;
  let description = req.body.description;
  var sql = "REPLACE INTO teams (id, team_name, team_categories, team_description) VALUES (?, ?, ?, ?)";
  con.query(sql, [id, name, categories, description], function (err, result) {
    if (err) console.error(err);
    res.send("Edited group!");
  });
})

//delete group
app.delete('/teams/deleteTeam/:id', (req, res) => {
  let url = req.url;
  let arr = url.split("/");
  let id = arr[arr.length - 1];
  var sql = "DELETE FROM teams WHERE id = ?";
  con.query(sql, id, function (err, result) {
    if (err) console.error(err);
    res.send("Deleted group!");
  });
})