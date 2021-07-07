/**
 * draw-syncing.js controls server interaction of SVG canvas
 * Uses firebase as the server
 * 
 * Name: nickmarsano
 * Date: 06/22/2021
 */


var primSket;//refernce to svg sketchpage
var currentlyEditing = false;
var ServerSketch;//json format of primSket kept on the firebase
var ecThis;
var color;
var lastServer = [];
var undo_index = 0;
var clear_index = 0;
var edit = 0;

function synchronize(sketch) {
  primSket.loadSketch(sketch);
  primSket.displayLoadedSketch(false);
}

firebaseRef.child('svg').child(userId).set("");

// Listens always for updates to the svg canvas
firebaseRef.child('svg').on('child_changed', function (snapshot) {
  if (!snapshot.val()) return;
  if (snapshot.key == userId) return;
  if (typeof (snapshot.val()) == 'string') {
    let splits = snapshot.val().split(':');
    if (splits[0] == 'erase') {
      let x = splits[1];
      let y = splits[2];
      primSket.erase(x, y);
    }
    else if (splits[0] == 'clear') {
      if (primSket.clear()) primSket.updateDimensions();
    }
    else if (splits[0] == 'undo') {
      primSket.undo();
    }
    else if (splits[0] == 'redo') {
      primSket.redo();
    }
    else if (splits[0] == 'color') {
      let x = splits[1];
      let y = splits[2];
      let c = splits[3];
      primSket.color(x, y, c);
    }
  }
  else {//handle move and draw
    var cereal = primSket.serialize();

    if (snapshot.val().created == 'move') {
      // primSket.startMove({'clientX':snapshot.val().timeStart,'clientY':snapshot.val().timeEnd})
      // primSket.continueLineWithEvent(null,'move',200,200);
      // console.log(primSket.endMove());
      var moved = cereal.find(el => el.idStroke == snapshot.val().idMovedFrom)
      var ind = cereal.indexOf(moved);
      primSket.clearedSketches[0][ind].remove(3)
      cereal = primSket.serialize();
    }
    snapshot.val().idStroke = primSket.currStrokeID;
    cereal.push(snapshot.val());
    synchronize(cereal);
    primSket.currStrokeID += 1;
  }


});

function sketchEdit(e, x, y, c) {

  if (e == 'point') return;

  firepad.firebaseAdapter_.ref_.child('svg').child(userId).transaction(function (current) {
    if (e == 'draw') {
      primSket.currentPath.created = e;
      primSket.currentPath.idCreator = userId;
      primSket.currentPath.undone = 0;
      return primSket.currentPath.serialize();
    }
    else if (e == 'move') {
      primSket.currentPath.created = e;
      primSket.currentPath.idCreator = userId;
      primSket.currentPath.undone = 0;
      return primSket.currentPath.serialize();
    }
    else if (e == 'erase') {
      return 'erase:' + x + ':' + y + ':' + edit++;
    }
    else if (e == 'clear') {
      return 'clear' + ':' + edit++;
    }
    else if (e == 'color') {
      return 'color:' + x + ':' + y + ':' + c + ':' + edit++;
    }
    else if (e == 'undo') {
      return 'undo' + ':' + edit++;
    }
    else if (e == 'redo') {
      return 'redo' + ':' + edit++;
    }
    // else if (e == 'point') {
    //   var thisPath = current.find(el => el.idStroke == primSket.currentPath.idStroke);
    //   if (thisPath && userId == primSket.currentPath.idCreator) {
    //     current[current.indexOf(thisPath)] = primSket.currentPath.serialize();
    //   }
    //   else {
    //     current[0] = 0;
    //     if (current.length > 2) while (current[current.length - 1].undone) current.pop();
    //     primSket.currentPath.idStroke = current.length - 1;// + 1;
    //     primSket.currentPath.idCreator = userId;
    //     primSket.currentPath.created = e;
    //     current.push(primSket.currentPath.serialize());
    //   }
    // }
    return "";
  })
}