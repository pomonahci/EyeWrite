//choose image to show
//that image will have certian bounding boxes associated with it
//those bounding boxes will have left x and top y + width and height values associated with each all stored in an array
//bounding boxes will be stored in a dictionary with a label of what they are bounding
//those dictionaries will be the values of dictionaries and the keys will be the image labels

var imageContainer = document.getElementById('imageContainer');
var container = imageContainer.getBoundingClientRect();

var imageSrc = document.getElementById('imageSearch');
var rect = imageSrc.getBoundingClientRect();

//example URL: hci.pomona.edu/EyeWrite/eyewrite.html#1kitten01234567

var imageLabel;
var boundArray = { 'kitten': { 'entireKitten': [rect.left, rect.top, 500, 500], 'topleft': [rect.left, rect.top, 100, 100] } };
var bounding;
var misclicks = 0;
var target;
var targetHit = false;
var numTargets;
var taskList;
var completed = 0;
var task = 0;
var numPpl;
var taskComplete = false;

function getImage() {
    var URL = window.location.href;
    numTargets = URL[URL.length - 1];
    taskList = URL.substring(URL.length - numTargets - 1, URL.length - 1);
    imageLabel = URL.substring(URL.length - numTargets - 1 - 6, URL.length - numTargets - 1);//6 is due to length of 'kitten'
    numPpl = URL.substring(URL.length - numTargets - 1 - 6 - 1, URL.length - numTargets - 1 - 6);
    bounding = boundArray[imageLabel];
}

function getTarget() {
    var keys = Object.keys(bounding);
    target = bounding[keys[taskList[task]]];
    console.log(keys[taskList[task]]);
}

document.addEventListener("click", onClick);
function onClick(event) {
    var x = event.clientX;
    var y = event.clientY;

    if (target[0] <= x && target[1] <= y && x <= target[0] + target[2] && y <= target[1] + target[3]) {
        firepad.firebaseAdapter_.ref_.child('tasks').child(task).child('targetClicked').transaction(function (current) {
            if (!current) current = [];
            var users = []
            for (const item of current) {
                users.push(item[0]);
            }
            if (!users.includes(userId)) current.push([userId, misclicks]);
            completed = current.length;
            return current
        })
        if (!targetHit) {
            var box = document.createElement('div');
            var left = target[0] - container.left;
            var top = target[1] - container.top;
            var width = target[2];
            var height = target[3];
            var styleInput = 'position:absolute;border: 2px solid green;left:' + left + 'px;top:' + top + 'px;width:' + width + 'px;height:' + height + 'px';
            box.setAttribute('style', styleInput)
            box.setAttribute('id', 'foundTarget');
            document.querySelector("#imageContainer").append(box);
        }
        targetHit = true;
        if (taskComplete) {
            nextTarget();
        }
    }
    else {
        misclicks++;
    }
}
firebaseRef.child('tasks').child(task).on('child_added', checkTaskComplete);//useless in experiments with more than 1 person
firebaseRef.child('tasks').child(task).on('child_changed', checkTaskComplete);

function checkTaskComplete(snapshot) {
    if (snapshot.val().length == numPpl) {
        taskComplete = true;
    }
}

function nextTarget() {
    clearBoxes();
    task++;
    targetHit = false;
    if(numTargets == task){
        console.log('All Tasks Complete');
        document.removeEventListener("click",onClick);
        return;
    }
    getTarget();
}

function clearBoxes() {
    document.getElementById('foundTarget').remove();
}

function startExp() {
    getImage();
    getTarget();
}