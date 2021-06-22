// var resetRevId = true;

var primSket;
var pathexample;


var svgSYNC = true;//Responsible for initializing the svg on page startup
// var postSync = false;
function synchronize(snapshot) {
  // firepad.firebaseAdapter_.revision_++;
  // postSync = true;
  // resetRevId = false;
  if (snapshot.val()) {
    // if (svgSYNC) {
    //   console.log("Initializing");
    //   svgSYNC = false;
    //   primSket.loadSketch(snapshot.val());
    //   // primSket.getPaths().push(Path.deserialize(snapshot.val().o,primSket.draw,primSket.pencilTexture));
    //   primSket.displayLoadedSketch(false);
    // }
    // else 
    // if (userId != snapshot.val()[snapshot.val().length - 1].idCreator) {
      console.log("Remote Update");
      primSket.loadSketch(snapshot.val());
      primSket.displayLoadedSketch(false);
    // }
  }
  // console.log(firepad.firebaseAdapter_.revision_);
}

// Listens once on startup to see if 'svg' is a child (if the document is blank or not)
// firebaseRef.once("value", function (snapshot) {
//   if (snapshot.val().svg) {
//     svgSYNC = !postSync;
//   }
// })

// Listens always for updates to the svg canvas
firebaseRef.child('svg').on('value', function (snapshot) {
  if(!editor) synchronize(snapshot);
  editor = false;
});

function getKeyByRevNum(object, value) {
  return Object.keys(object).find(key => object[key].stream_id === value);
}
var editor = false;
function sketchEdit(e) {
  // if (resetRevId && firepad.firebaseAdapter_.revision_ == 1) {
  //   firepad.firebaseAdapter_.revision_ = 0;
  // }
  console.log("edit made");
  editor = true;
  // console.log(firepad.firebaseAdapter_.revision_);
  if(primSket.currentPath) primSket.currentPath.idCreator = userId;
  var srl = primSket.serialize()
  firepad.firebaseAdapter_.ref_.child('svg').transaction(function (current) {
    return srl;
  })
}