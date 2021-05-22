var express = require('express');
var app = express();
var fs = require("fs");
var mysql = require('mysql2');
// const rootPass = require('./secrets');
const port = process.env.PORT || 3000;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
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
    let sql = "CREATE TABLE IF NOT EXISTS `businesses` ( `business_id` int NOT NULL AUTO_INCREMENT COMMENT 'primary key', `business_name` varchar(255) NOT NULL, `business_categories` varchar(255) NOT NULL, `business_description` text, `business_image_url` varchar(255) DEFAULT NULL, PRIMARY KEY (`business_id`) )";
    con.query(sql, function (err, result) {
      if (err) console.error(err);
    });
    sql = "CREATE TABLE IF NOT EXISTS `employees` ( `employee_id` int unsigned NOT NULL AUTO_INCREMENT, `first_name` varchar(63) NOT NULL, `last_name` varchar(63) NOT NULL, `email` varchar(127) NOT NULL, `password` varchar(255) NOT NULL, `profile_image_url` varchar(255) DEFAULT NULL, `business_id` int DEFAULT NULL, PRIMARY KEY (`employee_id`), UNIQUE KEY `email` (`email`), KEY `business_id` (`business_id`), FOREIGN KEY (`business_id`) REFERENCES `businesses` (`business_id`) )";
    con.query(sql, function (err, result) {
      if (err) console.error(err);
    });
    sql = "CREATE TABLE IF NOT EXISTS `posts` ( `post_id` int NOT NULL AUTO_INCREMENT COMMENT 'primary key', `post_time` datetime DEFAULT CURRENT_TIMESTAMP, `post_type` enum('Sell','Buy') NOT NULL, `price` decimal(20,2) DEFAULT NULL, `post_amount` varchar(255) DEFAULT NULL, `post_description` text, `post_image_url` varchar(255) DEFAULT NULL, `post_location` varchar(255) DEFAULT NULL, `employee_id` int unsigned NOT NULL, `post_name` varchar(255) NOT NULL, PRIMARY KEY (`post_id`), KEY `employee_id` (`employee_id`), FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) )"
    con.query(sql, function (err, result) {
      if (err) console.error(err);
    });


app.get('/', (req, res) => {
  res.write("<h2 style='text-align:center;'>Welcome to the Veteran API!</h2><br><br><br>");
  res.write(DOCUMENTATION_STR);
  res.end();
});

/*-------START OF BUSINESSES API-------*/

//get all businesses
app.get('/businesses', (req, res) => {
  var sql = "SELECT * FROM businesses";
  con.query(sql, function (err, result) {
    if (err) console.error(err);
    res.json(result)
    res.end()
  });
})

//get one businesses by id
app.get('/businesses/:id', (req, res) => {
  let url = req.url;
  let arr = url.split("/");
  let id = arr[arr.length - 1];
  var sql = "SELECT * FROM businesses WHERE business_id = ?";
  con.query(sql, [id], function (err, result) {
    if (err) console.error(err);
    res.json(result);
  });
})

//create a business
app.post('/businesses/new', (req, res) => {
  let name = req.body.name;
  let categories = req.body.categories;
  let description = req.body.description;
  let imageURL = req.body.imageURL;
  console.log(name, categories, description);
  var sql = "INSERT INTO businesses (business_name, business_categories, business_description, business_image_url) VALUES (?, ?, ?, ?)";
  con.query(sql, [name, categories, description, imageURL], function (err, result) {
    if (err) console.error(err);
    res.send("Created new business!");
  });
})

//update business
app.put('/businesses/:id', (req, res) => {
  let url = req.url;
  let arr = url.split("/");
  let id = arr[arr.length - 1];
  let name = req.body.name;
  let categories = req.body.categories;
  let description = req.body.description;
  let imageURL = req.body.imageURL;
  var sql = "UPDATE businesses SET business_name = ?, business_categories = ?, business_categories = ?, business_image_url = ? WHERE business_id = ?";
  con.query(sql, [name, categories, description, imageURL, id], function (err, result) {
    if (err) console.error(err);
    res.send("Edited business!");
  });
})

//delete business
app.delete('/businesses/:id', (req, res) => {
  let url = req.url;
  let arr = url.split("/");
  let id = arr[arr.length - 1];
  var sql = "DELETE FROM businesses WHERE business_id = ?";
  con.query(sql, id, function (err, result) {
    if (err) console.error(err);
    res.send("Deleted business!");
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
  let employeeID = req.body.employeeID;

  var sql = "INSERT INTO posts (post_type, price, post_amount, post_description, post_image_url, post_location, post_name, employee_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  con.query(sql, [type, price, amount, description, imageURL, location, name, employeeID], function (err, result) {
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

  var sql = "UPDATE posts SET post_type = ?, price = ?, post_amount = ?, post_description = ?, post_image = ?, post_location = ?, post_name = ?";
  con.query(sql, [type, price, amount, description, imageURL, location, name], function (err, result) {
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

/*-------START OF EMPLOYEES API-------*/

//get all employees
app.get('/employees', (req, res) => {
  var sql = "SELECT * FROM employees";
  con.query(sql, function (err, result) {
    if (err) console.error(err);
    res.json(result);
  });
})

//get one employee by id
app.get('/employees/:id', (req, res) => {
  let url = req.url;
  let arr = url.split("/");
  let id = arr[arr.length - 1];
  var sql = "SELECT * FROM employees WHERE employee_id = ?";
  con.query(sql, [id], function (err, result) {
    if (err) console.error(err);
    res.json(result);
  });
})

//create an employee
app.post('/employees/new', (req, res) => {
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let email = req.body.email;
  let password = req.body.password;
  let imageURL = req.body.imageURL;
  let businessID = req.body.businessID;

  var sql = "INSERT INTO employees (first_name, last_name, email, password, profile_image_url, business_id) VALUES (?, ?, ?, ?, ?, ?)";
  con.query(sql, [firstName, lastName, email, password, imageURL, businessID], function (err, result) {
    if (err) console.error(err);
    res.send("Created new employee!");
  });
})

//update an employee
app.post('/employees/new', (req, res) => {
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let email = req.body.email;
  let password = req.body.password;
  let imageURL = req.body.imageURL;
  let businessID = req.body.businessID;

  var sql = "INSERT INTO employees (first_name, last_name, email, password, profile_image_url, business_id) VALUES (?, ?, ?, ?, ?, ?)";
  con.query(sql, [firstName, lastName, email, password, imageURL, businessID], function (err, result) {
    if (err) console.error(err);
    res.send("Updated employee!");
  });
})

//delete employee
app.delete('/employees/:id', (req, res) => {
  let url = req.url;
  let arr = url.split("/");
  let id = arr[arr.length - 1];
  var sql = "DELETE FROM posts WHERE employee_id = ?";
  con.query(sql, id, function (err, result) {
    if (err) console.error(err);
    res.send("Deleted employee!");
  });
})

 
const DOCUMENTATION_STR = `DOCUMENTATION FOR THE VETERAN APP API

BELOW ARE THE THREE TABLES AND THE URLS THAT REQUESTS NEED TO BE SENT TO IN ORDER TO INTERACT WITH THE DATABASE:

TO POST INFO, YOU NEED TO SEND AN OBJECT WITH KEY-VALUE PAIRS IN THE "DATA" FIELD OF THE JSON OBJECT YOU SEND!!!!
----------------------------------------------------------------------------------------------

EMPLOYEES API:

TO GET ALL EMPLOYEES
GET https://vet-codeathon.herokuapp.com/employees/

------------------------------------------------------------------------------------------------

TO GET AN EMPLOYEE BY ID
GET https://vet-codeathon.herokuapp.com/employees/<id>

---------------------------------------------------------------------------------------------------

TO MAKE A NEW EMPLOYEE
POST https://vet-codeathon.herokuapp.com/employees/new

^^^NEEDS THESE ATTRIBUTES IN BODY:
{
    firstName:
    lastName:
    email:
    password:
    imageURL <OPTIONAL>:
    businessID <OPTIONAL>:
}

-------------------------------------------------------------------------------

TO UPDATE AN EMPLOYEE
PUT https://vet-codeathon.herokuapp.com/employees/<id>

^^^NEEDS THESE ATTRIBUTES IN BODY:
{
    firstName:
    lastName:
    email : !!!THIS IS UNIQUE, ONE ACCOUNT PER EMAIL, THE DATABASE REJECT DUPLICATES!!!
    password:
    imageURL <OPTIONAL>:
    businessID <OPTIONAL>:
}

----------------------------------------------------------

TO DELETE AN EMPLOYEE
DELETE https://vet-codeathon.herokuapp.com/employees/<id>

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

BUSINESSES API:

TO GET ALL BUSINESSES
GET https://vet-codeathon.herokuapp.com/businesses

--------------------------------------------------------------------------------------

TO GET A BUSINESS BY ID
GET https://vet-codeathon.herokuapp.com/businesses/<id>

--------------------------------------------------------------------------------------------

TO MAKE A NEW BUSINESS
POST https://vet-codeathon.herokuapp.com/businesses/new

^^^THIS NEEDS THESE ATTRIBUTES IN BODY:
{
    name:
    categories:
    description <OPTIONAL>:
    imageURL <OPTIONAL>:
}

---------------------------------------------------------------------

TO UPDATE A BUSINESS
PUT https://vet-codeathon.herokuapp.com/businesses/<id>

^^^NEEDS THESE ATTRIBUTES IN BODY:
{
    name:
    categories:
    description <OPTIONAL>:
    imageURL <OPTIONAL>:
}

-----------------------------------------------------------------------------------

TO DELETE A BUSINESS
DELETE https://vet-codeathon.herokuapp.com/businesses/<id>

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


POSTS API:

TO GET ALL POSTS
GET https://vet-codeathon.herokuapp.com/posts

------------------------------------------------------------------------------------------------

TO GET A POST BY ID
GET https://vet-codeathon.herokuapp.com/posts/<id>

---------------------------------------------------------------------------------------------------

TO MAKE A NEW POST
POST https://vet-codeathon.herokuapp.com/posts/new

^^^NEEDS THESE ATTRIBUTES IN BODY:
{
    type: !!! HAS TO BE "BUY" OR "SELL" !!!
    price <OPTIONAL>:
    amount <OPTIONAL>:
    description <OPTIONAL>:
    imageURL <OPTIONAL>:
    location <OPTIONAL>:
    employeeID:
    name: 
}

-------------------------------------------------------------------------------

TO UPDATE A POST
PUT https://vet-codeathon.herokuapp.com/posts/<id>

^^^NEEDS THESE ATTRIBUTES IN BODY:
{
    type: !!! HAS TO BE "BUY" OR "SELL" !!!
    price <OPTIONAL>:
    amount <OPTIONAL>:
    description <OPTIONAL>:
    imageURL <OPTIONAL>:
    location <OPTIONAL>:
    name: 
}

----------------------------------------------------------

TO DELETE A POST
DELETE https://vet-codeathon.herokuapp.com/posts/<id>

 `

