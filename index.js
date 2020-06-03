var path     = require('path');               //documentation: https://nodejs.org/api/path.html
var express  = require('express');            //connect with express
var app      = express();
var http     = require('http').Server(app);
var request  = require('request');
var ss       = require('socket.io-stream');
var Readable = require('stream').Readable;
var fs = require('fs');
const io     = require('socket.io')(http);    //import socket.io and socket.io-streams
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
const localPort   = 3000;                          //local host port
var PORT = 33333;       // UDP Port
var HOST = '127.0.0.1'; //
app.use(express.static('scripts'));           //allow Node.js access scripts directory
app.use(express.static(__dirname));
var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var disconnected = false;

var gazeLog = fs.createWriteStream("./userGazeLog.txt");

const encodeGetParams = p =>
  Object.entries(p).map(kv => kv.map(encodeURIComponent).join("=")).join("&");

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

io.of('/data').on('connection', socket => {//broadcast for socket connection
  console.log("connection to client complete.");//console feedback for user
  if(disconnected) {
    server = dgram.createSocket('udp4');
  }
  server.on('message', function (message, remote) {
    var toSend = parseMessage(message);
    var s = new Readable();
    s._read = function() {};
    var stream = ss.createStream();
    //push the gaze data to the readable stream
    s.push(toSend);
    s.pipe(stream);
    ss(socket).emit('gaze', stream); //broadcast the stream
  });

  server.bind(PORT, HOST);
  //log a disconnect from the socket
  socket.on('disconnect', () => {
    disconnected = true;
    console.log("disconnected, closing udp server");
    server.close();
  });

  socket.on('gazeLog', function(data) {
    //console.log(data);
    var dataString = JSON.stringify(data);
    dataString = dataString + "\n";
    gazeLog.write(dataString);
  });
});

io.of('/gazeLog').on('connection', socket => {
  console.log("gaze log connection complete");

})

var previousTimestamp = 0;

function parseMessage(message){
  var messageObj = JSON.parse(message);
  if(messageObj.timestamp>previousTimestamp){
    previousTimestamp = messageObj.timestamp;
    return messageObj.x + "," + messageObj.y;
  } else {
    return null;
  }
}

//send a request with response result with express
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, './index.html'));
})

app.post('/log', function(req, res) {
 console.log(req.body);
 if(req.body.hasOwnProperty('line')) {
   gazeLog.write(JSON.stringify(req.body));
   gazeLog.write("\n");
   console.log("logged gaze");
 }
});

//run server
http.listen(localPort, function () {
  console.log("server running on port: "+ localPort);
});
