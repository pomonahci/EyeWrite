const mouse = io.connect("http://localhost:3000/mouse");
const users = io.connect("http://localhost:3000/users");

const throttle = 120;
var start = (new Date).getTime();

users.on("connect", () => {
  users.emit("userID", "user: " + window.userId + " has connected");

  document.addEventListener("mousemove", handleMouseMove);
});

users.on("disconnect", () => {
  users.emit("userIDDisconnect", "user: " + window.userId + " has disconnected");
});


function handleMouseMove(event) {
  event = event || window.event;

  let now = (new Date).getTime();

  if (now - start >= throttle) {
    logMouseMovement(event);
  } else {
    return;
  }
  start = now;

};

var logMouseMovement = function (mouseEvent) {
  let currentTime = (new Date).getTime();

  let mouseMove = {};
  mouseMove.user = window.userId;
  mouseMove.x = mouseEvent.clientX;
  mouseMove.y = mouseEvent.clientY;
  mouseMove.epoch = currentTime + 47000;

  window.mousePosRef.set(mouseMove.x + ',' + mouseMove.y);

  mouse.emit("mouse move", JSON.stringify(mouseMove));
};

