var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');
var apiController = require('./controllers/apiController');

var port = process.env.PORT || 3000;

//  use the public folder to fetch data
app.use('/', express.static(__dirname + '/public'));


// run the function inside apicontroller
apiController(app);

//  listen to port localhost:3000
app.listen(port);
