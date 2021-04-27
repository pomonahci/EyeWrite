var path = require('path');               //documentation: https://nodejs.org/api/path.html
var express = require('express');            //connect with express
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser')
app.use(bodyParser.json());       // to support JSON-encoded bodies
const localPort = 3000;                          //local host port
app.use(express.static('scripts'));           //allow Node.js access scripts directory
app.use(express.static(__dirname));


app.get('/', function (req, res) {
  console.log(__dirname);
  res.sendFile(path.join(__dirname, "./index.html"));
});

//run server
http.listen(localPort, function () {
  console.log("server running on port: http://localhost:" + localPort);
});