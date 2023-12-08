/**
 * imageSelect.js controls the image search task
 * Interprets URL for image and targets, handles server interaction and target control
 * 
 * Name: nickmarsano
 * Date: 06/30/2021
 */

var imageContainer = document.getElementById('imageContainer');
var container = imageContainer.getBoundingClientRect();

// var imageSrc = document.getElementById('imageSearch');
// var rect = imageSrc.getBoundingClientRect();

//example URL: hci.pomona.edu/EyeWrite/eyewrite.html#1kitten012

var imageLabel; // number identify 0-9 for what image is being looked at
// listings of bounding boxes for each image
var index2Label = { '0': 'fday.jpg', '1': 'christ.png', '2': 'horse.jpg', '3': 'warmup.png' } //dictionary linking imageLabel number to literal string for ease of reading
// var index2Label = { '0': 'fdayboxes.jpg', '1': 'christboxes.png', '2': 'horseboxes.jpg' }


var fdayBoxes = { 'football.png': [516 / 1440, 311 / 704, 41 / 1440, 77 / 704], 'candle2.png': [1098 / 1440, 565 / 704, 50 / 1440, 133 / 704], 'cone2.png': [1014 / 1440, 104 / 704, 82 / 1440, 93 / 704], 'shovel.png': [927 / 1440, 511 / 704, 161 / 1440, 58 / 704], 'rabbit.png': [503 / 1440, 26 / 704, 69 / 1440, 104 / 704], 'bone.png': [627 / 1440, 98 / 704, 94 / 1440, 82 / 704] };

var christBoxes = { 'candle.png': [778 / 1440, 104 / 704, 32 / 1440, 86 / 704], 'fish.png': [526 / 1440, 72 / 704, 58 / 1440, 93 / 704], 'sock.png': [894 / 1440, 320 / 704, 106 / 1440, 110 / 704], 'cone.png': [708 / 1440, 584 / 704, 109 / 1440, 46 / 704], 'bell.png': [895 / 1440, 43 / 704, 59 / 1440, 45 / 704], 'shoe.png': [1062 / 1440, 308 / 704, 78 / 1440, 35 / 704] };

var horseBoxes = { 'tulip.png': [941 / 1440, 76 / 704, 102 / 1440, 152 / 704], 'tack.png': [507 / 1440, 388 / 704, 47 / 1440, 46 / 704], 'ladder.png': [1082 / 1440, 247 / 704, 48 / 1440, 23 / 704], 'brush.png': [1116 / 1440, 354 / 704, 22 / 1440, 143 / 704], 'rug.png': [990 / 1440, 458 / 704, 65 / 1440, 82 / 704], 'carrot.png': [748 / 1440, 616 / 704, 45 / 1440, 82 / 704] };

var warmupBoxes = { 'a1.png': [953 / 1420, 281 / 684, 60 / 1420, 57 / 684], 'a2.png': [893 / 1420, 314 / 684, 56 / 1420, 49 / 684], 'a3.png': [852 / 1420, 215 / 684, 64 / 1420, 55 / 684], 'a4.png': [828 / 1420, 95 / 684, 63 / 1420, 56 / 684], 'a5.png': [781 / 1420, 167 / 684, 61 / 1420, 51 / 684], 'a6.png': [704 / 1420, 208 / 684, 64 / 1420, 53 / 684], 'a7.png': [697 / 1420, 122 / 684, 66 / 1420, 57 / 684], 'a8.png': [576 / 1420, 244 / 684, 68 / 1420, 58 / 684] }

var boundArray = { 'fday.jpg': fdayBoxes, 'christ.png': christBoxes, 'horse.jpg': horseBoxes, 'warmup.png': warmupBoxes };
// var boundArray = { 'fdayboxes.jpg': fdayBoxes, 'christboxes.png': christBoxes, 'horseboxes.jpg': horseBoxes };


var bounding; // list of targets for imageLabel taken from boundArray
var misclicks = 0; // number of misclicks while searching for target (will be made global)
var target; // current target that participatns are looking for
var targetHit = false; // boolean value to determine if a bounding box should be drawn locally (only draw once)
var numTargets = 3; // number of targets to find per image
var task = 0; // index of target, will incremenent
var numPpl; // number of participants in this experiement (gotten from URL)
var url; //apache url
var found = 0;
var skipped = 0;
var mySkipVote = false;

function getImage() {
    var imageName = index2Label[imageLabel];
    bounding = boundArray[imageName];
    document.getElementById("imageSearch").src = "./graphics/" + imageName;

    serverContent.push(["Participants", numPpl]);
    serverContent.push(["Image", imageName]);

}

var keys;
function getTarget() {
    // firebaseRef.child('tasks').child(task).child('targetClicked').set("");
    // firebaseRef.child('tasks').child(task).child('incorrectClicks').set("");
    // firebaseRef.child('tasks').child(task).child('skipVotes').set("");

    // firebaseRef.child('tasks').child(task).child('targetClicked').on('child_added', checkTaskComplete);//useless in experiments with more than 1 person
    // firebaseRef.child('tasks').child(task).child('targetClicked').on('child_changed', checkTaskComplete);
    // firebaseRef.child('tasks').child(task).child('incorrectClicks').on('child_changed', updateIncorrectClicks);
    firebaseRef.child('tasks').child(task).on('child_added', firelist);
    firebaseRef.child('tasks').child(task).on('child_changed', firelist);

    if (!bounding) return;
    keys = Object.keys(bounding);
    numTargets = keys.length;

    target = bounding[keys[task]];
    document.getElementById("targetSearch").src = "./graphics/" + keys[task];
    serverContent.push(["Target", keys[task], Date.now()]);

}

document.getElementById("imageSearch").addEventListener("click", onClick);
function onClick(event) {
    if (mySkipVote) return;
    if (targetHit) return
    var x = event.clientX;
    var y = event.clientY;

    if (target[0] * window.innerWidth <= x && target[1] * window.innerHeight <= y && x <= target[0] * window.innerWidth + target[2] * window.innerWidth && y <= target[1] * window.innerHeight + target[3] * window.innerHeight) {
        document.getElementById("skipButton").disabled = true;
        document.getElementById("skipButton").innerHTML = "Help Others Find It!";
        document.getElementById("skipButton").style.left = '0%';
        var box = document.createElement('div');
        var left = target[0] * window.innerWidth - container.left;
        var top = target[1] * window.innerHeight - container.top;
        var width = target[2] * window.innerWidth;
        var height = target[3] * window.innerHeight;
        var styleInput = 'position:absolute;border: 2px solid green;left:' + left + 'px;top:' + top + 'px;width:' + width + 'px;height:' + height + 'px';
        box.setAttribute('style', styleInput)
        box.setAttribute('id', 'foundTarget');
        document.querySelector("#imageContainer").append(box);

        targetHit = true;
        clickContent.push(["Correct Click", keys[task], Date.now(), x/window.innerWidth, y/window.innerHeight]);

        firepad.firebaseAdapter_.ref_.child('tasks').child(task).child('targetClicked').transaction(function (current) {
            if (!current) current = [];
            var users = []
            for (const item of current) {
                users.push(item[0]);
            }
            if (!users.includes(userId)) current.push(userId);
            return current
        })

    }
    else {
        clickContent.push(["Incorrect Click", keys[task], Date.now(), x/window.innerWidth, y/window.innerHeight]);

        misclicks++;
        // update user's misclicks on server
        firepad.firebaseAdapter_.ref_.child('tasks').child(task).child('incorrectClicks').child(userId).transaction(function (current) {
            if (!current) current = 0;
            current = misclicks;
            return current;
        });

        updateIncorrectClicks();
    }
}

function updateIncorrectClicks() {
    // update client-side display with computed total misclicks
    firepad.firebaseAdapter_.ref_.child('tasks').child(task).child('incorrectClicks').transaction(function(current) {
        total = 0;
        for (misclick of Object.values(current)) {
            total += misclick;
        }
        document.getElementById('badclicks').innerHTML = total;
    });
}

var action = '';
function checkTaskComplete() {
    // check if everyone has clicked on this task
    if (found + skipped == numPpl) {
        nextTarget();
    }
}

function nextTarget() {
    serverContent.push(["Target Completed", "", Date.now()]);
    serverContent.push(["Clock", document.getElementById('stopwatch').innerHTML]);

    // clickContent.push("Personal Incorrect Clicks:"+misclicks+",\n");

    clearBoxes();
    firebaseRef.child('tasks').child(task).off();
    
    firebaseRef.child('tasks').once('value', function (snap) {
        // snap.val() is the array of users who have correctly clicked on the target.
        // so when we do task = snap.val().length, we're increasing the task by 1
        task = snap.val().length;
        
        // the rest of the code is in here cause of javascript async handling
        misclicks = 0;
        document.getElementById('badclicks').innerHTML = 0;
        targetHit = false;
        mySkipVote = false;
        document.getElementById("skipButton").innerHTML = "Skip Target";
        document.getElementById("skipButton").style.left = '15%';

        if (numTargets == task) {
            document.getElementById("imageSearch").removeEventListener("click", onClick);
            document.getElementById('targetSearch').style.visibility = 'hidden';
            stopStopwatch();
            document.getElementById("skipButton").innerHTML = "All Targets Found!";
            document.getElementById("skipButton").style.left = '5%';
            return;
        }
        document.getElementById("skipButton").disabled = false;
        action = '';
        skipped = 0;
        found = 0;
        getTarget();
    });
}

function clearBoxes() {
    if (document.getElementById('foundTarget')) document.getElementById('foundTarget').remove();
}

function voteSkipTarget() {
    clickContent.push(["Skip Vote", keys[task], Date.now(), '', '']);

    document.getElementById("skipButton").disabled = true;
    mySkipVote = true;
    firepad.firebaseAdapter_.ref_.child('tasks').child(task).child('skipVotes').transaction(function (current) {
        if (!current) current = [];
        if (!current.includes(userId)) current.push(userId);
        return current
    })
}

function firelist(snapshot) {
    if (snapshot.key == 'incorrectClicks') {
        console.log("snapshot.key is incorrectClicks");
        updateIncorrectClicks();
    } else if (snapshot.key == 'targetClicked') {
        found = Object.keys(snapshot.val()).length;
        checkTaskComplete(snapshot);
    }
    else if (snapshot.key == 'skipVotes') {
        skipped = Object.keys(snapshot.val()).length;
        checkTaskComplete(snapshot);
    }
}


function startExp() {
    startStopwatch();
    serverContent.push(["Experiment Start", Date.now()]);

    firebaseRef.child('tasks').once('value', function (snap) {
        if (snap.val() !== null)
            task = snap.val().length - 1;
    });
    getImage();
    getTarget();
}

//Used to get bounding box parameters manually and then inputting into "boundArray" dictionary above
// var c1 = true;
// var x1;
// var y1;
// document.getElementById("imageSearch").addEventListener("click", whereAmI);
// function whereAmI(event) {
//     if (!c1) {
//         console.log(x1 + '/' + window.innerWidth + ', ' + y1 + '/' + window.innerHeight + ', ' + (event.clientX - x1) + '/' + window.innerWidth + ', ' + (event.clientY - y1) + '/' + window.innerHeight)
//     }
//     x1 = event.clientX;
//     y1 = event.clientY;
//     c1 = !c1;
// }
document.getElementById("imageSearch").style.pointerEvents = "none";
document.getElementById("skipButton").style.pointerEvents = "none";
firebaseRef.child('users').on('value', function (snapshot) {
    var URL = window.location.href;
    imageLabel = URL.search("img");
    imageLabel = URL.substring(imageLabel + 4, imageLabel + 5);
    if (imageLabel == -1) return;
    numPpl = URL.search('par');
    if (numPpl == -1) {
        numPpl = 2;
    }
    else {
        numPpl = URL.substring(numPpl + 4, numPpl + 5);
    }

    if (Object.keys(snapshot.val()).length >= numPpl) {
        startExp();
        firebaseRef.child("users").transaction(function (current) {
            for (const [key, value] of Object.entries(current)) {
                var wh = "("+value.dimensions.w+","+value.dimensions.h+")";
                serverContent.push([key,wh]);
            }
        })
        document.getElementById("imageSearch").style.pointerEvents = "auto";
        document.getElementById("skipButton").style.pointerEvents = "auto";
        firebaseRef.child('users').off('value');
    }
})
