/**
 * draw-syncing.js controls server interaction of SVG canvas
 * Uses firebase as the server
 * 
 * Name: nickmarsano
 * Date: 07/6/2021
 */


var primSket;//refernce to svg sketchpage
var currentlyEditing = false;//used in original draw-syncing
// var ServerSketch;//json format of primSket kept on the firebase//used in original draw-syncing
var edit = 0;
// var ecThis; //used in original draw-syncing
var todos = [];
var pathEX;


// function synchronize(sketch) {
//   primSket.undoIndex = 0;
//   primSket.clearUndoIndex = 0;
//   primSket.loadSketch(sketch);
//   primSket.displayLoadedSketch(false);

// }

// function completeTodos() {
//   var cereal = primSket.serialize();
//   for (const x of todos) {
//     if (x.created == 'draw') {
//       primSket.currentPath = pathEX.deserialize(x, primSket.draw, primSket.pencilTexture);;
//       primSket.finishPath();
//       primSket.currStrokeID += 1;
//     }
//     else {
//       cereal.push(x);
//       synchronize(cereal);
//     }
//   }
//   todos = [];
// }

firebaseRef.child('svg').child(userId).set("");

// Listens always for updates to the svg canvas
firebaseRef.child('svg').on('child_changed', function (snapshot) {
  if (!snapshot.val()) return;
  if (snapshot.key == userId || snapshot.val() == "") return;
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
      let targetPath = 0;
      for (let i = primSket.getPaths().length - 1; i > -1; i--) {
        if (!primSket.getPaths()[i].undone && snapshot.key == primSket.getPaths()[i].idCreator) {
          targetPath = primSket.getPaths()[i];
          targetPath.undone = true;
          break;
        }
      }
      if (targetPath === 0) {
        if (primSket.clearedSketches.length < 2) return;
        else {
          primSket.undo();
          primSket.clearedSketches.pop();
          primSket.clearUndoIndex--;
        }
      }
      primSket.undo(targetPath);
    }
    else if (splits[0] == 'redo') {
      let targetPath = 0;
      for (let i = 0; i < primSket.getPaths().length; i++) {
        if (primSket.getPaths()[i].undone && snapshot.key == primSket.getPaths()[i].idCreator) {
          targetPath = primSket.getPaths()[i];
          targetPath.undone = false;
          break;
        }
      }
      if (targetPath === 0) {
        if (primSket.clearUndoIndex > 0) primSket.redo();
        else return;
      }
      primSket.redo(targetPath);
    }
    else if (splits[0] == 'color') {
      let x = splits[1];
      let y = splits[2];
      let c = splits[3];
      primSket.color(x, y, c);
    }
  }
  else {//handle move and draw
    // if (snapshot.val().created == 'draw') {//draw
    //   var stroke = pathEX.deserialize(snapshot.val(), primSket.draw, primSket.pencilTexture);
    //   let paths = primSket.getPaths().slice(0, primSket.getPaths().length - primSket.undoIndex);
    //   primSket.updatePaths(paths, stroke);
    //   stroke.addToGroupSmoothed(primSket.sketchGroup);
    //   primSket.currStrokeID += 1;
    // }
    // else
    if (snapshot.val().created == 'move') {//move
      let selected = primSket.select(snapshot.val().xcof, snapshot.val().ycof);
      // makes (unrendered) copy of target path for future undo and adds to stack 
      let paths = selected[0];
      let targetPath = selected[1];
      let newTargetPath;
      newTargetPath = pathEX.deserialize(snapshot.val(), primSket.draw, primSket.pencilTexture);
      newTargetPath.addToGroupSmoothed(primSket.sketchGroup); // necessary, otherwise copied path off position
      newTargetPath.movedFrom = targetPath
      targetPath.remove(3);
      primSket.currStrokeID += 1;
      primSket.updatePaths(paths, newTargetPath);
    }
    else {//middraw point and draw

      var cereal = primSket.serialize();
      var preexist = cereal.find(el => el.idStroke == snapshot.val().idStroke)
      var ind = cereal.indexOf(preexist);
      console.log(ind)
      if (ind == -1) {
        var stroke = pathEX.deserialize(snapshot.val(), primSket.draw, primSket.pencilTexture);
        let paths = primSket.getPaths().slice(0, primSket.getPaths().length - primSket.undoIndex);
        primSket.updatePaths(paths, stroke);
        stroke.addToGroupSmoothed(primSket.sketchGroup);
        primSket.currStrokeID += 1;
        console.log('new path')
        console.log(primSket.clearedSketches[primSket.clearedSketches.length - primSket.clearUndoIndex - 1])

      }
      else {
        console.log(primSket.clearedSketches[primSket.clearedSketches.length - primSket.clearUndoIndex - 1])
        primSket.clearedSketches[primSket.clearedSketches.length - primSket.clearUndoIndex - 1].splice(ind, 1);
        console.log(primSket.clearedSketches[primSket.clearedSketches.length - primSket.clearUndoIndex - 1])
        var stroke = pathEX.deserialize(snapshot.val(), primSket.draw, primSket.pencilTexture);
        let paths = primSket.getPaths().slice(0, primSket.getPaths().length - primSket.undoIndex);
        primSket.updatePaths(paths, stroke);
        stroke.addToGroupSmoothed(primSket.sketchGroup);
        console.log('old path')
        console.log(primSket.clearedSketches[primSket.clearedSketches.length - primSket.clearUndoIndex - 1])

      }
    }
  }


});
var xcof;
var ycof;
function sketchEdit(e, x, y, c) {
  if (e == 'store') {// || e=='point') {
    xcof = x.clientX;
    ycof = x.clientY;
    return
  }

  firepad.firebaseAdapter_.ref_.child('svg').child(userId).transaction(function (current) {
    if (e == 'draw') {
      primSket.currentPath.created = e;
      // primSket.currentPath.idStroke = primSket.currentPath.idStroke + userId
      primSket.currentPath.idCreator = userId;
      var ret = primSket.currentPath.serialize();
      clickContent.push(['Draw', Date.now(), ret.color, ret.width, ret.idCreator, ret.idStroke, ret.status, ret.idMovedFrom, ret.created, ret.timeStart, ret.timeEnd, ret.undone, ret.coords]);
      return ret
    }
    else if (e == 'move') {
      primSket.currentPath.created = e;
      primSket.currentPath.idStroke = primSket.currentPath.idStroke + userId
      primSket.currentPath.idCreator = userId;
      var ret = primSket.currentPath.serialize();
      ret.xcof = xcof;
      ret.ycof = ycof;
      clickContent.push(['Move', Date.now(), ret.color, ret.width, ret.idCreator, ret.idStroke, ret.status, ret.idMovedFrom, ret.created, ret.timeStart, ret.timeEnd, ret.undone, ret.coords]);
      return ret;
    }
    else if (e == 'erase') {
      clickContent.push(['Erase', Date.now(), "", "","", "","", "","", "","", "", x/window.innerWidth, y/window.innerHeight]);
      return 'erase:' + x + ':' + y + ':' + edit++;
    }
    else if (e == 'clear') {
      clickContent.push(['Clear', Date.now(), "", "", ""]);
      return 'clear' + ':' + edit++;
    }
    else if (e == 'color') {
      clickContent.push(['Color', Date.now(), c, "","", "","", "","", "","", "",x/window.innerWidth, y/window.innerHeight]);
      return 'color:' + x + ':' + y + ':' + c + ':' + edit++;
    }
    else if (e == 'undo') {
      let targetPath = 0;
      for (let i = primSket.getPaths().length - 1; i > -1; i--) {
        if (!primSket.getPaths()[i].undone && userId == primSket.getPaths()[i].idCreator) {
          targetPath = primSket.getPaths()[i];
          targetPath.undone = true;
          break;
        }
      }
      if (targetPath === 0) {
        if (primSket.clearedSketches.length < 2) return "";
        else {
          primSket.undo();
          primSket.clearedSketches.pop();
          primSket.clearUndoIndex--;
        }
      }
      primSket.undo(targetPath);
      clickContent.push(['Undo', Date.now(), "", "", ""]);
      return 'undo' + ':' + edit++;
    }
    else if (e == 'redo') {
      let targetPath = 0;
      for (let i = 0; i < primSket.getPaths().length; i++) {
        if (primSket.getPaths()[i].undone && userId == primSket.getPaths()[i].idCreator) {
          targetPath = primSket.getPaths()[i];
          targetPath.undone = false;
          break;
        }
      }
      if (targetPath === 0) {
        if (primSket.clearUndoIndex > 0) primSket.redo();
        else return;
      }
      primSket.redo(targetPath);
      clickContent.push(['Redo', Date.now(), "", "", ""]);
      return 'redo' + ':' + edit++;
    }
    else if (e == 'point') {
      primSket.currentPath.created = e;
      if (String(primSket.currentPath.idStroke).length < 9) primSket.currentPath.idStroke = primSket.currentPath.idStroke + userId
      primSket.currentPath.idCreator = userId;
      var toRet = primSket.currentPath.serialize();
      toRet.x = x;
      toRet.y = y;
      return toRet;
    }
    return "";
  })
  // completeTodos();
  currentlyEditing = false;
}
var URL = window.location.href;
var collaborators = URL.search("par");
collaborators = URL.substring(collaborators + 4, collaborators + 5);
document.getElementById("root").style.pointerEvents = "none";
firebaseRef.child('users').on('value', function (snapshot) {
  if (Object.keys(snapshot.val()).length == collaborators) {
    startTimer();
    firebaseRef.child("users").transaction(function (current) {
      for (const [key, value] of Object.entries(current)) {
        var wh = "(" + value.dimensions.w + ":" + value.dimensions.h + ")";
        serverContent.push([key, wh]);
      }
    })
    serverContent.push(["Experiment Start", Date.now()]);
    serverContent.push(["Participants", collaborators]);
    document.getElementById("root").style.pointerEvents = "auto";
    firebaseRef.child('users').off('value');
  }
})