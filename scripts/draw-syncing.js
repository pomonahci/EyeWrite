
var primSket;//refernce to svg sketchpage
var currentlyEditing = false;
var ServerSketch;//json format of primSket kept on the firebase
var ecThis;
var color;
var lastServer = [];
var undone = [];

function synchronize(sketch) {
  primSket.loadSketch(sketch);
  primSket.displayLoadedSketch(false);
}

// Listens always for updates to the svg canvas
firebaseRef.child('svg').on('value', function (snapshot) {
  ServerSketch = snapshot.val();
  if (ServerSketch && lastServer) {
    if (ServerSketch.length == lastServer.length && ServerSketch[ServerSketch.length - 1].idCreator != lastServer[lastServer.length - 1].idCreator) {
      lastServer[lastServer.length - 1].idStroke++;
      ServerSketch.push(lastServer[lastServer.length - 1]);
      firepad.firebaseAdapter_.ref_.child('svg').transaction(function (current) { return ServerSketch; });
    }
  }
  lastServer = ServerSketch;
  if (!snapshot.val()) ServerSketch = [];
  if (!currentlyEditing) {
    synchronize(ServerSketch);
  }
});

function sketchEdit(e) {
  var x = 0;
  firepad.firebaseAdapter_.ref_.child('svg').transaction(function (current) {
    //create a log to apache server
    // var save_url = "http://hci.pomona.edu/Drawing?" + "x=" + x + ";y=" + y;
    // var temp_image = new Image();
    // temp_image.src = save_url;
    console.log(x); x++;
    if (!current) current = [];
    if (e == 'draw') {
      primSket.currentPath.created = e;
      var thisPath = current.find(el => el.idStroke == primSket.currentPath.idStroke);
      current[current.indexOf(thisPath)] = primSket.currentPath.serialize();
      undone = [];
    }
    else if (e == 'move') {
      primSket.currentPath.idStroke = current.length + 1;
      primSket.currentPath.created = e;
      current.find(el => el.idStroke == primSket.currentPath.idMovedFrom).status = 3;
      current.push(primSket.currentPath.serialize());
      undone = [];
    }
    else if (e == 'erase') {
      var o = current.find(el => el.idStroke == ecThis.idStroke);
      o.status = 2;
      var copy = JSON.parse(JSON.stringify(o));
      copy.created = 'erase';
      current.push(o);
      undone = [];
    }
    else if (e == 'clear') {
      undone = current;
      current = [];
    }
    else if (e == 'color') {
      current.find(el => el.idStroke == ecThis.idStroke).color = color;
    }
    else if (e == 'undo') {
      undone.push(current.pop());
      if (undone[undone.length - 1].created == 'move') {
        current.find(el => el.idStroke == undone[undone.length - 1].idMovedFrom).status = 1;
      }
      else if (undone[undone.length - 1].created == 'erase') {
        current.find(el => el.idStroke == undone[undone.length - 1].idStroke).status = 1;
      }
    }
    else if (e == 'redo') {
      if (undone) {
        current.push(undone.pop());
        if (current[current.length - 1].created == 'move') {
          current.find(el => el.idStroke == current[current.length - 1].idMovedFrom).status = 3;
        }
        else if (undone[undone.length - 1].created == 'erase') {
          current.find(el => el.idStroke == current[current.length - 1].idStroke).status = 2;
        }
        else if(current.length == 0){
          current = undone;
          undone = [];
        }
      }
    }
    else if (e == 'point') {
      var thisPath = current.find(el => el.idStroke == primSket.currentPath.idStroke);
      if (thisPath && userId == primSket.currentPath.idCreator) {
        current[current.indexOf(thisPath)] = primSket.currentPath.serialize();
      }
      else {
        primSket.currentPath.idStroke = current.length + 1;
        primSket.currentPath.idCreator = userId;
        primSket.currentPath.created = e;
        current.push(primSket.currentPath.serialize());
      }
      undone = [];
    }

    return current;

  })
}