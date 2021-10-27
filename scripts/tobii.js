/**
 * Code from CHI2019_EyeWrite
 * */
var ss = require('socket.io-stream'); //import socket stream
var socket;
window.connect = function(ref, id) {
  console.log("in window.connect");
  window.reference = ref;
  window.userID = id;
  socket = io.connect('http://localhost:3000/data'); //connect to /data
  socket.on('connect', function() {
    ss(socket).on('gaze', function(stream) {
      stream.on('data', function(data) {
        //add list of ints to the data String
        dataString = '';
        dataString += data;
        //parse the string for the x and y percentages
        var strings = dataString.split(',');
        // var x = parseFloat(strings[0]);
        // var y = parseFloat(strings[1]) - (window.outerHeight - window.innerHeight);
        //adjust percentages to positions on the screen
        //change the location of the visual notifier
        var event = new CustomEvent("gazeData", {
          detail: { X: parseFloat(strings[0]), Y: parseFloat(strings[1] - (window.outerHeight - window.innerHeight)) }
        });
        document.dispatchEvent(event);
      })
    })
  });
};

window.onunload = function() {
  console.log("disconnecting socket");
  socket.disconnect();
}

function writeGazeLog(data) {
  const currentTime = (new Date).getTime();
  data.user = window.userID;
  data.epoch = currentTime;
  socket.emit('gazeLog', data);
}

window.sendGaze = function(circle) {
  var gaze = new Gaze(circle, null, null)
  window.reference.child("users").child(window.userID).child("gaze").set(gaze);
}

window.sendVis = function(vis) {
  socket.emit('gazeLog', "task: " + vis);
}

window.sendLine = function(line, subline, x, lineData) {
  var currentTime = (new Date).getTime();
  var dataObj = {};
  dataObj.epoch = currentTime;
  dataObj.line = line;
  dataObj.subline = subline;
  dataObj.x = x;
  dataObj.lineData = lineData;
  socket.emit('gazeLog', dataObj);
  var gaze = new Gaze(line, subline, x);
  window.reference.child("users").child(window.userID).child("gaze").set(gaze);
}

class Mouse {
  // selection that would move if you pressed an arrow key.
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  fromJSON(obj) {
    return new Mouse(obj.x, obj.y);
  }
}

class Gaze {
  constructor(line, subline, x) {
    if (subline === null && x === null) {
      this.circle = line;
    } else {
      this.x = x;
      this.line = line;
      this.subline = subline;
    }
  }

  fromJSON(obj) {
    if (obj.hasOwnProperty('circle')) {
      return new Gaze(obj.circle);
    } else {
      return new Gaze(obj.line, obj.subline, obj.x);
    }
  }
}
