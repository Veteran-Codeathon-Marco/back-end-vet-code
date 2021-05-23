var express = require('express');
var app = express();
var fs = require("fs");
var mysql = require('mysql2');
var path = require('path');
var bcrypt = require("bcrypt-nodejs")
// const rootPass = require('./secrets');
const port = process.env.PORT || 3000;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
app.use(express.static(__dirname))
app.use(express.static(__dirname + '/public/documentation.html'))
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
  

  //MAKE USERS TABLE
    let sql = "CREATE TABLE IF NOT EXISTS `users` ( `user_id` int unsigned NOT NULL AUTO_INCREMENT, `first_name` varchar(63) NOT NULL, `last_name` varchar(63) NOT NULL, `email` varchar(127) NOT NULL, `password` varchar(255) NOT NULL, `profile_image_url` varchar(255) DEFAULT NULL, PRIMARY KEY (`user_id`), UNIQUE KEY `email` (`email`) )";
    con.query(sql, function (err, result) {
      if (err) console.error(err);
    });

    //MAKE BUSINESSES TABLE
    sql = "CREATE TABLE IF NOT EXISTS `businesses` ( `business_id` int NOT NULL AUTO_INCREMENT COMMENT 'primary key', `business_name` varchar(255) NOT NULL, `business_categories` varchar(255) NOT NULL, `business_description` text, `business_image_url` varchar(255) DEFAULT NULL, `address` varchar(255) DEFAULT NULL, `phone_number` varchar(255) DEFAULT NULL, PRIMARY KEY (`business_id`) )";
    con.query(sql, function (err, result) {
      if (err) console.error(err);
    });

    //MAKE EMPLOYEES TABLE
    sql = "CREATE TABLE IF NOT EXISTS `employees` ( `employee_id` int unsigned NOT NULL AUTO_INCREMENT, `first_name` varchar(63) NOT NULL, `last_name` varchar(63) NOT NULL, `email` varchar(127) NOT NULL, `password` varchar(255) NOT NULL, `profile_image_url` varchar(255) DEFAULT NULL, `business_id` int NOT NULL, PRIMARY KEY (`employee_id`), UNIQUE KEY `email` (`email`), KEY `business_id` (`business_id`), FOREIGN KEY (`business_id`) REFERENCES `businesses` (`business_id`) )";
    con.query(sql, function (err, result) {
      if (err) console.error(err);
    });
 
    //MAKE POSTS TABLES
    sql = "CREATE TABLE IF NOT EXISTS `posts` ( `post_id` int NOT NULL AUTO_INCREMENT COMMENT 'primary key', `post_time` datetime DEFAULT CURRENT_TIMESTAMP, `post_type` enum('Sell','Buy') NOT NULL, `price` decimal(20,2) DEFAULT NULL, `post_amount` varchar(255) DEFAULT NULL, `post_description` text, `post_image_url` varchar(255) DEFAULT NULL, `post_location` varchar(255) DEFAULT NULL, `employee_id` int unsigned NOT NULL, `post_name` varchar(255) NOT NULL, PRIMARY KEY (`post_id`), KEY `employee_id` (`employee_id`), FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) )"
    con.query(sql, function (err, result) {
      if (err) console.error(err);
    });


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/documentation.html', (err) => {
    if (err) console.error(err)
    console.log('sent the docs')
  })
});

/*-------START OF USERS API-------*/

//get all users
app.get('/users', (req, res) => {
  var sql = "SELECT * FROM users";
  con.query(sql, function (err, result) {
    if (err) console.error(err);
    res.json(result)
    res.end()
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
  let password = bcrypt.hashSync(req.body.password);
  let imageURL = req.body.imageURL;

  var sql = "INSERT INTO users (first_name, last_name, email, password, profile_image_url) VALUES (?, ?, ?, ?, ?)";
  con.query(sql, [firstName, lastName, email, password, imageURL], function (err, result) {
    if (err) console.error(err);
    res.send("Created new user!");
  });
})

//update a user
app.put('/users/id', (req, res) => {
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let email = req.body.email;
  let password = bcrypt.hashSync(req.body.password);
  let imageURL = req.body.imageURL;
  let url = req.url;
  let arr = url.split("/");
  let id = arr[arr.length - 1];

  var sql = "UPDATE users SET first_name = ?, last_name = ?, email = ?, password = ?, image_url = ? WHERE user_id = ?";
  con.query(sql, [firstName, lastName, email, password, imageURL, id], function (err, result) {
    if (err) console.error(err);
    res.send("Updated user!");
  });
})

//delete user
app.delete('/users/:id', (req, res) => {
  let url = req.url;
  let arr = url.split("/");
  let id = arr[arr.length - 1];
  var sql = "DELETE FROM users WHERE user_id = ?";
  con.query(sql, id, function (err, result) {
    if (err) console.error(err);
    res.send("Deleted user!");
  });
})

//authenticate user password
app.post('/users/auth/:id', (req, res) => {
  let attempt = req.body.password;
  let url = req.url;
  let arr = url.split("/");
  let id = arr[arr.length - 1];
  var sql = "SELECT * FROM users WHERE user_id = ?";
  con.query(sql, id, function(err, result){
    if (err) console.error(err)
    res.json({"a": true})
    // res.json({"match": bcrypt.compareSync(attempt, result.password)});
  })  
})


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
  let address = req.body.address;
  let phoneNumber = req.body.phoneNumber;

  var sql = "INSERT INTO businesses (business_name, business_categories, business_description, business_image_url, address, phone_number) VALUES (?, ?, ?, ?, ?, ?)";
  con.query(sql, [name, categories, description, imageURL, address, phoneNumber], function (err, result) {
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
  let address = req.body.address;
  let phoneNumber = req.body.phoneNumber;

  var sql = "UPDATE businesses SET business_name = ?, business_categories = ?, business_categories = ?, business_image_url = ?, address = ?, phone_number = ? WHERE business_id = ?";
  con.query(sql, [name, categories, description, imageURL, address, phoneNumber, id], function (err, result) {
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
  let password = bcrypt.hashSync(req.body.password);
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
  let password = bcrypt.hashSync(req.body.password);
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

//authenticate employee password
app.post('/employees/auth/:id', (req, res) => {
  let attempt = req.body.password;
  let url = req.url;
  let arr = url.split("/");
  let id = arr[arr.length - 1];
  var sql = "SELECT * FROM employees WHERE employee_id = ?";
  con.query(sql, id, function(err, result){
    if (err) console.error(err)
    res.json({"match": bcrypt.compareSync(attempt, result.password)});
  })  
})

 
const DOCUMENTATION_STR = `<p>Welcome to the Veteran API!<br><br><br><br>DOCUMENTATION FOR THE VETERAN APP API<br><br>BELOW ARE THE FOUR TABLES AND THE URLS THAT REQUESTS NEED TO BE SENT TO IN ORDER TO INTERACT WITH THE DATABASE:<br><br>TO POST INFO, YOU NEED TO SEND AN OBJECT WITH KEY-VALUE PAIRS IN THE &quot;DATA&quot; FIELD OF THE JSON OBJECT YOU SEND!!!!<br>----------------------------------------------------------------------------------------------<br><br>USERS API:<br><br>TO GET ALL USERS<br>GET https://vet-codeathon.herokuapp.com/users/<br><br>------------------------------------------------------------------------------------------------<br><br>TO GET A USER BY ID<br>GET https://vet-codeathon.herokuapp.com/users/{id}<br><br>---------------------------------------------------------------------------------------------------<br><br>TO MAKE A NEW USER<br>POST https://vet-codeathon.herokuapp.com/users/new<br><br>^^^NEEDS THESE ATTRIBUTES IN BODY:<br>{<br>&nbsp; &nbsp; firstName:<br>&nbsp; &nbsp; lastName:<br>&nbsp; &nbsp; email: !!!THIS IS UNIQUE, ONE ACCOUNT PER EMAIL, THE DATABASE REJECT DUPLICATES!!!<br>&nbsp; &nbsp; password:<br>&nbsp; &nbsp; imageURL &lt;OPTIONAL&gt;:<br>}<br><br>-------------------------------------------------------------------------------<br><br>TO UPDATE A USER<br>PUT https://vet-codeathon.herokuapp.com/users/{id}<br><br>^^^NEEDS THESE ATTRIBUTES IN BODY:<br>{<br>&nbsp; &nbsp; firstName:<br>&nbsp; &nbsp; lastName:<br>&nbsp; &nbsp; email : !!!THIS IS UNIQUE, ONE ACCOUNT PER EMAIL, THE DATABASE REJECT DUPLICATES!!!<br>&nbsp; &nbsp; password:<br>&nbsp; &nbsp; imageURL &lt;OPTIONAL&gt;:<br>}<br><br>----------------------------------------------------------<br><br>TO DELETE A USER<br>DELETE https://vet-codeathon.herokuapp.com/users/{id}<br><br>///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////<br><br>EMPLOYEES API:<br><br>TO GET ALL EMPLOYEES<br>GET https://vet-codeathon.herokuapp.com/employees/<br><br>------------------------------------------------------------------------------------------------<br><br>TO GET AN EMPLOYEE BY ID<br>GET https://vet-codeathon.herokuapp.com/employees/{id}<br><br>---------------------------------------------------------------------------------------------------<br><br>TO MAKE A NEW EMPLOYEE<br>POST https://vet-codeathon.herokuapp.com/employees/new<br><br>^^^NEEDS THESE ATTRIBUTES IN BODY:<br>{<br>&nbsp; &nbsp; firstName:<br>&nbsp; &nbsp; lastName:<br>&nbsp; &nbsp; email: !!!THIS IS UNIQUE, ONE ACCOUNT PER EMAIL, THE DATABASE REJECT DUPLICATES!!!<br>&nbsp; &nbsp; password:<br>&nbsp; &nbsp; imageURL &lt;OPTIONAL&gt;:<br>&nbsp; &nbsp; businessID &lt;OPTIONAL&gt;:<br>}<br><br>-------------------------------------------------------------------------------<br><br>TO UPDATE AN EMPLOYEE<br>PUT https://vet-codeathon.herokuapp.com/employees/{id}<br><br>^^^NEEDS THESE ATTRIBUTES IN BODY:<br>{<br>&nbsp; &nbsp; firstName:<br>&nbsp; &nbsp; lastName:<br>&nbsp; &nbsp; email : !!!THIS IS UNIQUE, ONE ACCOUNT PER EMAIL, THE DATABASE REJECT DUPLICATES!!!<br>&nbsp; &nbsp; password:<br>&nbsp; &nbsp; imageURL &lt;OPTIONAL&gt;:<br>&nbsp; &nbsp; businessID &lt;OPTIONAL&gt;:<br>}<br><br>----------------------------------------------------------<br><br>TO DELETE AN EMPLOYEE<br>DELETE https://vet-codeathon.herokuapp.com/employees/{id}<br><br>///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////<br><br>BUSINESSES API:<br><br>TO GET ALL BUSINESSES<br>GET https://vet-codeathon.herokuapp.com/businesses<br><br>--------------------------------------------------------------------------------------<br><br>TO GET A BUSINESS BY ID<br>GET https://vet-codeathon.herokuapp.com/businesses/{id}<br><br>--------------------------------------------------------------------------------------------<br><br>TO MAKE A NEW BUSINESS<br>POST https://vet-codeathon.herokuapp.com/businesses/new<br><br>^^^THIS NEEDS THESE ATTRIBUTES IN BODY:<br>{<br>&nbsp; &nbsp; name:<br>&nbsp; &nbsp; categories:<br>&nbsp; &nbsp; description &lt;OPTIONAL&gt;:<br>&nbsp; &nbsp; imageURL &lt;OPTIONAL&gt;:<br>&nbsp; &nbsp; address &lt;OPTIONAL&gt;:<br>&nbsp; &nbsp; phoneNumber &lt;OPTIONAL&gt;:<br>}<br><br>---------------------------------------------------------------------<br><br>TO UPDATE A BUSINESS<br>PUT https://vet-codeathon.herokuapp.com/businesses/{id}<br><br>^^^NEEDS THESE ATTRIBUTES IN BODY:<br>{<br>&nbsp; &nbsp; name:<br>&nbsp; &nbsp; categories:<br>&nbsp; &nbsp; description &lt;OPTIONAL&gt;:<br>&nbsp; &nbsp; imageURL &lt;OPTIONAL&gt;:<br>&nbsp; &nbsp; address &lt;OPTIONAL&gt;:<br>&nbsp; &nbsp; phoneNumber &lt;OPTIONAL&gt;:<br>}<br><br>-----------------------------------------------------------------------------------<br><br>TO DELETE A BUSINESS<br>DELETE https://vet-codeathon.herokuapp.com/businesses/{id}<br><br>////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////<br><br><br>POSTS API:<br><br>TO GET ALL POSTS<br>GET https://vet-codeathon.herokuapp.com/posts<br><br>------------------------------------------------------------------------------------------------<br><br>TO GET A POST BY ID<br>GET https://vet-codeathon.herokuapp.com/posts/{id}<br><br>---------------------------------------------------------------------------------------------------<br><br>TO MAKE A NEW POST<br>POST https://vet-codeathon.herokuapp.com/posts/new<br><br>^^^NEEDS THESE ATTRIBUTES IN BODY:<br>{<br>&nbsp; &nbsp; type: !!! HAS TO BE &quot;BUY&quot; OR &quot;SELL&quot; !!!<br>&nbsp; &nbsp; price &lt;OPTIONAL&gt;:<br>&nbsp; &nbsp; amount &lt;OPTIONAL&gt;:<br>&nbsp; &nbsp; description &lt;OPTIONAL&gt;:<br>&nbsp; &nbsp; imageURL &lt;OPTIONAL&gt;:<br>&nbsp; &nbsp; location &lt;OPTIONAL&gt;:<br>&nbsp; &nbsp; employeeID:<br>&nbsp; &nbsp; name:<br>}<br><br>-------------------------------------------------------------------------------<br><br>TO UPDATE A POST<br>PUT https://vet-codeathon.herokuapp.com/posts/{id}<br><br>^^^NEEDS THESE ATTRIBUTES IN BODY:<br>{<br>&nbsp; &nbsp; type: !!! HAS TO BE &quot;BUY&quot; OR &quot;SELL&quot; !!!<br>&nbsp; &nbsp; price &lt;OPTIONAL&gt;:<br>&nbsp; &nbsp; amount &lt;OPTIONAL&gt;:<br>&nbsp; &nbsp; description &lt;OPTIONAL&gt;:<br>&nbsp; &nbsp; imageURL &lt;OPTIONAL&gt;:<br>&nbsp; &nbsp; location &lt;OPTIONAL&gt;:<br>&nbsp; &nbsp; name:<br>}<br><br>----------------------------------------------------------<br><br>TO DELETE A POST<br>DELETE https://vet-codeathon.herokuapp.com/posts/{id}<br><br><br><br><br><br></p>
 `

