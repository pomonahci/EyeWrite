var path = require('path');               //documentation: https://nodejs.org/api/path.html
var express = require('express');            //connect with express
var app = express();
var http = require('http').Server(app);
var request = require('request');
var ss = require('socket.io-stream');
var Readable = require('stream').Readable;
var fs = require('fs');
const io = require('socket.io')(http);    //import socket.io and socket.io-streams
var bodyParser = require('body-parser')
app.use(bodyParser.json());       // to support JSON-encoded bodies
const localPort = 3000;                          //local host port
var PORT = 33333;       // UDP Port
var HOST = '127.0.0.1'; //
app.use(express.static('scripts'));           //allow Node.js access scripts directory
app.use(express.static(__dirname));
var dgram = require('dgram');
var server = dgram.createSocket('udp4');

app.get('/', function (req, res) {
  console.log(__dirname);
  res.sendFile(path.join(__dirname, "./index.html"));
});

//run server
http.listen(localPort, function () {
  console.log("server running on port: " + localPort);
});
