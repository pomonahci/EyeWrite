
var primSket;//refernce to svg sketchpage
var currentlyEditing = false;
var ServerSketch;//json format of primSket kept on the firebase
var ecThis;
var color;

function synchronize(sketch) {
  if (sketch) {
    primSket.loadSketch(sketch);
    primSket.displayLoadedSketch(false);
  }
}

// Listens always for updates to the svg canvas
firebaseRef.child('svg').on('value', function (snapshot) {
  if (snapshot.val()) {

    ServerSketch = snapshot.val();
    if (!currentlyEditing) {
      synchronize(ServerSketch);
    }
  }
  editor = false;
});

var editor = false;
function sketchEdit(e) {
  console.log("edit made: ");
  console.log(e);
  // if (e == 'draw' || e == 'move') {
  //   primSket.currentPath.idCreator = userId;
  //   primSket.currentPath.idStroke = ServerSketch.length + 1;
  //   primSket.currentPath.created = e;
  // }


  var srl = primSket.serialize();
  var srl2 = ServerSketch;
  srl2.push(primSket.currentPath.serialize());
  firepad.firebaseAdapter_.ref_.child('svg').transaction(function (current) {
    //create a log to apache server
    // var save_url = "http://hci.pomona.edu/Drawing?" + "x=" + x + ";y=" + y;
    // var temp_image = new Image();
    // temp_image.src = save_url;

    if (!current) current = [];
    if (e == 'draw') {
      primSket.currentPath.created = e;
      var thisPath = current.find(el => el.idStroke == primSket.currentPath.idStroke);
      current[current.indexOf(thisPath)] = primSket.currentPath.serialize();

    }
    else if (e == 'move') {
      primSket.currentPath.idStroke = current.length + 1;
      current.find(el => el.idStroke == primSket.currentPath.idMovedFrom).status = 3;
      current.push(primSket.currentPath.serialize());
    }
    else if (e == 'erase') {
      var o = current.find(el => el.idStroke == ecThis.idStroke);
      o.status = 2;
      current.push(o);
    }
    else if (e == 'clear') {
      current = [];
    }
    else if (e == 'color') {
      current.find(el => el.idStroke == ecThis.idStroke).color = color;
    }
    else if (e == 'undo') {
      console.log('undo');
    }
    else if (e == 'redo') {
      console.log('redo');
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
    }
    return current;

  })
}