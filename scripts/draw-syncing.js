// var resetRevId = true;

var primSket;//refernce to svg sketchpage
var currentlyEditing = false;
var ServerSketch;//json format of primSket kept on the firebase

// var strokeCount = 0;

function synchronize(sketch) {
  if (sketch) {
    console.log("Remote Update");
    primSket.loadSketch(sketch);
    primSket.displayLoadedSketch(false);
  }
}

// Listens always for updates to the svg canvas
firebaseRef.child('svg').on('value', function (snapshot) {
  if (snapshot.val()) {
    ServerSketch = snapshot.val();
    if (!currentlyEditing && !editor) {
      synchronize(ServerSketch);
    }
  }
  // if (!editor) synchronize(snapshot);
  editor = false;
  // strokeCount++;
});

var editor = false;
function sketchEdit(e) {
  console.log("edit made: ");
  console.log(e);
  synchronize(ServerSketch);
  editor = true;
  if (e == 'draw' || e == 'move') {
    primSket.currentPath.idCreator = userId;
    primSket.currentPath.idStroke = ServerSketch.length + 1;
    primSket.created = e;
  }


  var srl = primSket.serialize();
  var srl2 = ServerSketch;
  srl2.push(primSket.currentPath.serialize());
  console.log(srl2);
  firepad.firebaseAdapter_.ref_.child('svg').transaction(function (current) {
    //create a log to apache server
    // var save_url = "http://hci.pomona.edu/Drawing?" + "x=" + x + ";y=" + y;
    // var temp_image = new Image();
    // temp_image.src = save_url;
    return srl2;
  })
}