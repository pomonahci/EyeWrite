
var primSket;//refernce to svg sketchpage
var currentlyEditing = false;
var ServerSketch;//json format of primSket kept on the firebase
var ecThis;
var color;
var lastServer = [];
var undo_index = 0;
var clear_index = 0;

function synchronize(sketch) {
  primSket.loadSketch(sketch);
  primSket.displayLoadedSketch(false);
}

// Listens always for updates to the svg canvas
firebaseRef.child('svg').on('value', function (snapshot) {
  if (snapshot.val()) {
    ServerSketch = snapshot.val()['canvas'];
    if (ServerSketch && lastServer) {
      if (ServerSketch.length == lastServer.length && ServerSketch[ServerSketch.length - 1].idCreator != lastServer[lastServer.length - 1].idCreator) {
        lastServer[lastServer.length - 1].idStroke++;
        ServerSketch.push(lastServer[lastServer.length - 1]);
        firepad.firebaseAdapter_.ref_.child('svg').child('canvas').transaction(function (current) { return ServerSketch; });
      }
    }
    lastServer = ServerSketch;
    if (!snapshot.val()['canvas']) ServerSketch = [];
    if (!currentlyEditing) {
      synchronize(ServerSketch.slice(1,ServerSketch.length));
    }
  }
});

function sketchEdit(e) {
  // if (e == 'undo' || e == 'redo') {
  //   firepad.firebaseAdapter_.ref_.child('svg').child("undoIndex").transaction(function (index) {
  //     if(index == null)index=0;
  //     undo_index = index;
  //     if(e=='undo') return index++;
  //     else {
  //       index--;
  //       if (index<0)index=0;
  //       return index;
  //     }
  //   })
  // }

  firepad.firebaseAdapter_.ref_.child('svg').child('canvas').transaction(function (current) {
    //create a log to apache server
    // var save_url = "http://hci.pomona.edu/Drawing?" + "x=" + x + ";y=" + y;
    // var temp_image = new Image();
    // temp_image.src = save_url;
    if (!current) current = [0];
    if (e == 'draw') {
      current[0]=0;
      primSket.currentPath.created = e;
      var thisPath = current.find(el => el.idStroke == primSket.currentPath.idStroke);
      current[current.indexOf(thisPath)] = primSket.currentPath.serialize();
    }
    else if (e == 'move') {
      while(current[current.length-1].undone)current.pop();
      current[0]=0;
      primSket.currentPath.idStroke = current.length;// + 1;
      primSket.currentPath.created = e;
      current.find(el => el.idStroke == primSket.currentPath.idMovedFrom).status = 3;
      current.push(primSket.currentPath.serialize());
    }
    else if (e == 'erase') {
      var o = current.find(el => el.idStroke == ecThis.idStroke);
      o.status = 2;
      var copy = JSON.parse(JSON.stringify(o));
      copy.created = 'erase';
      while(current[current.length-1].undone)current.pop();
      current[0]=0;
      current.push(copy);
    }
    else if (e == 'clear') {
      current = [0];
    }
    else if (e == 'color') {
      current.find(el => el.idStroke == ecThis.idStroke).color = color;
    }
    else if (e == 'undo') {
      if (current[0] < current.length-1) {
        var todo = current[current.length - current[0] - 1]
        todo.undone = 1;
        //undo erase
        if (todo.created == 'erase') {
          current.find(el => el.idStroke == todo.idStroke).status = 1;
        }
        //undo move
        else if (todo.created == 'move') {
          current.find(el => el.idStroke == todo.idMovedFrom).status = 1;
          todo.status = 3;
        }
        //undo draw
        else {
          todo.status = 2;
        }
        current[0]++;
      }
    }
    else if (e == 'redo') {
      if (current[0] > 0) {
        var todo = current[current.length - current[0]];
        todo.undone = 0;
        //redo erase
        if (todo.created == 'erase'){
          current.find(el => el.idStroke == todo.idStroke).status = 2;
        }
        //redo move
        else if (todo.created == 'move'){
          current.find(el => el.idStroke == todo.idMovedFrom).status = 3;
          todo.status = 1;
        }
        //redo draw
        else {
          todo.status=1;
        }
        current[0]--;
      }
    }
    else if (e == 'point') {
      var thisPath = current.find(el => el.idStroke == primSket.currentPath.idStroke);
      if (thisPath && userId == primSket.currentPath.idCreator) {
        current[current.indexOf(thisPath)] = primSket.currentPath.serialize();
      }
      else {
        if(current.length>0)while(current[current.length-1].undone)current.pop();
        primSket.currentPath.idStroke = current.length;// + 1;
        primSket.currentPath.idCreator = userId;
        primSket.currentPath.created = e;
        current.push(primSket.currentPath.serialize());
      }
    }
    return current;
  })
}