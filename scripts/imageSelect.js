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
var index2Label = { '0': 'fday.jpg', '1': 'christ.png', '2': 'horse.jpg', '3': 'warmup.png', '4': 'halloween.jpeg'} //dictionary linking imageLabel number to literal string for ease of reading
// var index2Label = { '0': 'fdayboxes.jpg', '1': 'christboxes.png', '2': 'horseboxes.jpg' }


var fdayBoxes = { 'football.png': [516 / 1440, 311 / 704, 41 / 1440, 77 / 704], 'candle2.png': [1098 / 1440, 565 / 704, 50 / 1440, 133 / 704], 'cone2.png': [1014 / 1440, 104 / 704, 82 / 1440, 93 / 704], 'shovel.png': [927 / 1440, 511 / 704, 161 / 1440, 58 / 704], 'rabbit.png': [503 / 1440, 26 / 704, 69 / 1440, 104 / 704], 'bone.png': [627 / 1440, 98 / 704, 94 / 1440, 82 / 704] };

var christBoxes = { 'candle.png': [778 / 1440, 104 / 704, 32 / 1440, 86 / 704], 'fish.png': [526 / 1440, 72 / 704, 58 / 1440, 93 / 704], 'sock.png': [894 / 1440, 320 / 704, 106 / 1440, 110 / 704], 'cone.png': [708 / 1440, 584 / 704, 109 / 1440, 46 / 704], 'bell.png': [895 / 1440, 43 / 704, 59 / 1440, 45 / 704], 'shoe.png': [1062 / 1440, 308 / 704, 78 / 1440, 35 / 704] };

var horseBoxes = { 'tulip.png': [941 / 1440, 76 / 704, 102 / 1440, 152 / 704], 'tack.png': [507 / 1440, 388 / 704, 47 / 1440, 46 / 704], 'ladder.png': [1082 / 1440, 247 / 704, 48 / 1440, 23 / 704], 'brush.png': [1116 / 1440, 354 / 704, 22 / 1440, 143 / 704], 'rug.png': [990 / 1440, 458 / 704, 65 / 1440, 82 / 704], 'carrot.png': [748 / 1440, 616 / 704, 45 / 1440, 82 / 704] };

var warmupBoxes = { 'a1.png': [953 / 1420, 281 / 684, 60 / 1420, 57 / 684], 'a2.png': [893 / 1420, 314 / 684, 56 / 1420, 49 / 684], 'a3.png': [852 / 1420, 215 / 684, 64 / 1420, 55 / 684], 'a4.png': [828 / 1420, 95 / 684, 63 / 1420, 56 / 684], 'a5.png': [781 / 1420, 167 / 684, 61 / 1420, 51 / 684], 'a6.png': [704 / 1420, 208 / 684, 64 / 1420, 53 / 684], 'a7.png': [697 / 1420, 122 / 684, 66 / 1420, 57 / 684], 'a8.png': [576 / 1420, 244 / 684, 68 / 1420, 58 / 684] };

var halloweenBoxes = {'big_crown.jpeg': [719 / 1280, 490 / 1150, 120 / 1714, 90 / 1150],
'flag_one.jpg': [(77 / 1200), (153 / 1150), (173 / 1200), (136 / 1150)]

}; //724:514+210, 1714:1200+514, 644=724-80, 724-5 = 719. 105+15=120
//[0]: (original+509)/1280, [2]: (original+15)/(1200+514)
//var halloweenBoxes = {'crowns.jpeg': [(225 / 1440), (654 / 1150), (105 / 1200), (19 / 1150)]};
var halloweennBoxes = {
    'flag_one.jpg': [(77 / 1200), (153 / 1150), (173 / 1200), (136 / 1150)],
    'flag_two.jpeg': [(317 / 1200), (238 / 1150), (140 / 1200), (151 / 1150)],
    'teepee.jpeg': [(310 / 1200), (210 / 1150), (130 / 1200), (80 / 1150)],
    'crown.jpeg': [(210 / 1200), (654 / 1150), (105 / 1200), (19 / 1150)],
    'hat.jpeg': [(218 / 1200), (370 / 1150), (67 / 1200), (434 / 1150)],
    'ghost.jpeg': [(77 / 1200), (961 / 1150), (108 / 1200), (87 / 1150)],
    'bone.jpeg': [(265 / 1200), (952 / 1150), (102 / 1200), (88 / 1150)],
    'cacti.jpeg': [(315 / 1200), (1024 / 1150), (130 / 1200), (69 / 1150)],
    'gum.jpeg': [(442 / 1200), (734 / 1150), (44 / 1200), (102 / 1150)],
    'apple.jpeg': [(458 / 1200), (505 / 1150), (37 / 1200), (50 / 1150)],
    'big_crown.jpeg': [(550 / 1200), (490 / 1150), (178 / 1200), (90 / 1150)],
    'heart.jpeg': [(628 / 1200), (1067 / 1150), (50 / 1200), (45 / 1150)],
    'rabbit.jpeg': [(823 / 1200), (1053 / 1150), (82 / 1200), (91 / 1150)],
    'fish.jpeg': [(605 / 1200), (133 / 1150), (179 / 1200), (93 / 1150)],
    'fang.jpeg': [(900 / 1200), (93 / 1150), (68 / 1200), (103 / 1150)],
    'flashlight.jpeg': [(927 / 1200), (254 / 1150), (98 / 1200), (101 / 1150)],
    'flag_three.jpeg': [(982 / 1200), (156 / 1150), (114 / 1200), (121 / 1150)],
    'worm.jpeg': [(971 / 1200), (196 / 1150), (140 / 1200), (140 / 1150)],
    'bowl.jpeg': [(1063 / 1200), (116 / 1150), (51 / 1200), (73 / 1150)],
    'snake.jpeg': [(1130 / 1200), (54 / 1150), (37 / 1200), (377 / 1150)],
    'pencil.jpeg': [(1024 / 1200), (318 / 1150), (23 / 1200), (119 / 1150)],
    'pear.jpeg': [(943 / 1200), (550 / 1150), (47 / 1200), (78 / 1150)],
    'lips.jpeg': [(1040 / 1200), (1001 / 1150), (71 / 1200), (53 / 1150)]
  };

  var memorialBoxes = {
    'Pencil.png': [(80 / 1200), (795 / 1170), (41 / 1200), (143 / 1170)],
    'Bird_one.png': [(46 / 1200), (1028 / 1170), (134 / 1200), (67 / 1170)],
    'Heart.png': [(50 / 1200), (971 / 1170), (127 / 1200), (71 / 1170)],
    'Ice_cream_one.png': [(213 / 1200), (980 / 1170), (50 / 1200), (75 / 1170)],
    'Hearts.png': [(137 / 1200), (572 / 1170), (118 / 1200), (60 / 1170)],
    'Tadpole.png': [(307 / 1200), (487 / 1170), (84 / 1200), (63 / 1170)],
    'Candle_one.png': [(357 / 1200), (710 / 1170), (65 / 1200), (206 / 1170)],
    'Loop.png': [(500 / 1200), (716 / 1170), (115 / 1200), (38 / 1170)],
    'Ice_cone.png': [(499 / 1200), (484 / 1170), (80 / 1200), (93 / 1170)],
    'Bird_two.png': [(485 / 1200), (2 / 1170), (193 / 1200), (121 / 1170)],
    'Bird_three.png': [(534 / 1200), (112 / 1170), (99 / 1200), (192 / 1170)],
    'Dragonfly.png': [(704 / 1200), (111 / 1170), (-459 / 1200), (153 / 1170)], // Adjusted due to negative width (wraparound)
    'Watering_can.png': [(808 / 1200), (41 / 1170), (129 / 1200), (155 / 1170)],
    'Angel.png': [(940 / 1200), (183 / 1170), (102 / 1200), (126 / 1170)],
    'Other_water_can_thing.png': [(1027 / 1200), (80 / 1170), (66 / 1200), (96 / 1170)],
    'Shovel.png': [(1096 / 1200), (166 / 1170), (60 / 1200), (199 / 1170)],
    'Cup.png': [(818 / 1200), (511 / 1170), (90 / 1200), (91 / 1170)],
    'Worm.png': [(968 / 1200), (632 / 1170), (56 / 1200), (114 / 1170)],
    'Paint_brush.png': [(1115 / 1200), (496 / 1170), (50 / 1200), (208 / 1170)],
    'Butterfly.png': [(1039 / 1200), (731 / 1170), (140 / 1200), (142 / 1170)],
    'Candle_two.png': [(763 / 1200), (782 / 1170), (148 / 1200), (77 / 1170)],
    'Frog.png': [(912 / 1200), (800 / 1170), (95 / 1200), (113 / 1170)],
    'Glove.png': [(920 / 1200), (936 / 1170), (127 / 1200), (130 / 1170)],
    'Turtle.png': [(1038 / 1200), (1024 / 1170), (114 / 1200), (134 / 1170)],
    'Knife.png': [(1033 / 1200), (868 / 1170), (81 / 1200), (110 / 1170)],
  };

var boundArray = { 'fday.jpg': fdayBoxes, 'christ.png': christBoxes, 'horse.jpg': horseBoxes, 'warmup.png': warmupBoxes, 'halloween.jpeg': halloweenBoxes };


  
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
    console.log(bounding)
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
    console.log("keys",keys)
    numTargets = keys.length;
    console.log("task",task)
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
    console.log("target",target)
    console.log("target0",target[0])
    console.log("target1",target[1])
    console.log("target2",target[2])
    console.log("target3",target[3])
    console.log("windown inner width",window.innerWidth)
    console.log("windown inner height",window.innerHeight)
    console.log("x",x)
    console.log("y",y)
    console.log(target[0] * window.innerWidth)
    console.log(target[1] * window.innerHeight)
    console.log( target[0] * window.innerWidth + target[2] * window.innerWidth)
    console.log(target[1] * window.innerHeight + target[3] * window.innerHeight)
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
