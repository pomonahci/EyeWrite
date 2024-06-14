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
var index2Label = { '0': 'fday.jpg', '1': 'christ.png', '2': 'horse.jpg', '3': 'warmup.png', '4': 'halloween.jpeg', '5': 'memorial.jpeg'} //dictionary linking imageLabel number to literal string for ease of reading
// var index2Label = { '0': 'fdayboxes.jpg', '1': 'christboxes.png', '2': 'horseboxes.jpg' }


var fdayBoxes = { 'football.png': [516 / 1440, 311 / 704, 41 / 1440, 77 / 704], 'candle2.png': [1098 / 1440, 565 / 704, 50 / 1440, 133 / 704], 'cone2.png': [1014 / 1440, 104 / 704, 82 / 1440, 93 / 704], 'shovel.png': [927 / 1440, 511 / 704, 161 / 1440, 58 / 704], 'rabbit.png': [503 / 1440, 26 / 704, 69 / 1440, 104 / 704], 'bone.png': [627 / 1440, 98 / 704, 94 / 1440, 82 / 704] };

var christBoxes = { 'candle.png': [778 / 1440, 104 / 704, 32 / 1440, 86 / 704], 'fish.png': [526 / 1440, 72 / 704, 58 / 1440, 93 / 704], 'sock.png': [894 / 1440, 320 / 704, 106 / 1440, 110 / 704], 'cone.png': [708 / 1440, 584 / 704, 109 / 1440, 46 / 704], 'bell.png': [895 / 1440, 43 / 704, 59 / 1440, 45 / 704], 'shoe.png': [1062 / 1440, 308 / 704, 78 / 1440, 35 / 704] };

var horseBoxes = { 'tulip.png': [941 / 1440, 76 / 704, 102 / 1440, 152 / 704], 'tack.png': [507 / 1440, 388 / 704, 47 / 1440, 46 / 704], 'ladder.png': [1082 / 1440, 247 / 704, 48 / 1440, 23 / 704], 'brush.png': [1116 / 1440, 354 / 704, 22 / 1440, 143 / 704], 'rug.png': [990 / 1440, 458 / 704, 65 / 1440, 82 / 704], 'carrot.png': [748 / 1440, 616 / 704, 45 / 1440, 82 / 704] };

var warmupBoxes = { 'a1.png': [953 / 1420, 281 / 684, 60 / 1420, 57 / 684], 'a2.png': [893 / 1420, 314 / 684, 56 / 1420, 49 / 684], 'a3.png': [852 / 1420, 215 / 684, 64 / 1420, 55 / 684], 'a4.png': [828 / 1420, 95 / 684, 63 / 1420, 56 / 684], 'a5.png': [781 / 1420, 167 / 684, 61 / 1420, 51 / 684], 'a6.png': [704 / 1420, 208 / 684, 64 / 1420, 53 / 684], 'a7.png': [697 / 1420, 122 / 684, 66 / 1420, 57 / 684], 'a8.png': [576 / 1420, 244 / 684, 68 / 1420, 58 / 684] };

var halloweenBoxes = {
    'flag_two.jpg': [1188 / 2560, 281 / 1279, 142 / 2560, 151 / 1279],
    'lips.jpeg': [1960 / 2560, 1120 / 1279, 60 / 2560, 53 / 1279],
    'gum.jpeg': [1315 / 2560, 820 / 1279, 50 / 2560, 110 / 1279],
    'cacti.jpeg': [1170 / 2560, 1141 / 1279, 145 / 2560, 72 / 1279],
    'snake_two.jpeg': [2055 / 2560, 60 / 1279, 37 / 2560, 340 / 1279],
    'worm.jpg': [1880 / 2560, 219 / 1279, 145 / 2560, 150 / 1279],
    'teepee.jpeg': [1176 / 2560, 240 / 1279, 134 / 2560, 80 / 1279],
    'flashlight.jpg': [1830 / 2560, 285 / 1279, 98 / 2560, 109 / 1279],
    'big_crown.jpg': [1430 / 2560, 556 / 1279, 178 / 2560, 90 / 1279],
    'flag_one.jpg': [935 / 2560, 178 / 1279, 173 / 2560, 145 / 1279],
    'rabbit.jpeg': [1730 / 2560, 1176 / 1279, 77 / 2560, 91 / 1279],
    'crown.jpg': [1071 / 2560, 630 / 1279, 109 / 2560, 78 / 1279],
    'hat.jpeg': [1077 / 2560, 817 / 1279, 75 / 2560, 85 / 1279],
    'pencil.jpg': [1935 / 2560, 350 / 1279, 23 / 2560, 150 / 1279],
    'bowl.jpg': [1975 / 2560, 130 / 1279, 51 / 2560, 76 / 1279],
    'fang.jpeg': [1805 / 2560, 110 / 1279, 70 / 2560, 106 / 1279],
    'flag_three.jpg': [1890 / 2560, 176 / 1279, 118 / 2560, 129 / 1279],
    'fish.jpg': [1490 / 2560, 149 / 1279, 179 / 2560, 93 / 1279],
    'apple.jpg': [1330 / 2560, 570 / 1279, 37 / 2560, 50 / 1279],
    'bone.jpg': [1111 / 2560, 1060 / 1279, 120 / 2560, 95 / 1279],
    'candle.jpg': [1680 / 2560, 735 / 1279, 41 / 2560, 130 / 1279],
    'snake.jpeg': [2020 / 2560, 580 / 1279, 50 / 2560, 377 / 1279],
    'heart.jpeg': [1518 / 2560, 1190 / 1279, 50 / 2560, 48 / 1279],
    'pear.jpg': [1850 / 2560, 618 / 1279, 47 / 2560, 78 / 1279],
    'ghost.jpeg': [932 / 2560, 1075 / 1279, 108 / 2560, 87 / 1279],
    };

    
var memorialBoxes = {
    'bird_one.jpeg': [1360 / 2560, 2 / 1279, 200 / 2560, 140 / 1279],
    'shovel.jpeg': [2003 / 2560, 186 / 1279, 60 / 2560, 190 / 1279],
    'paint_brush.jpg': [2025 / 2560, 537 / 1279, 50 / 2560, 230 / 1279],
    'candle_one.jpg': [1218 / 2560, 776 / 1279, 75 / 2560, 210 / 1279],
    'butterfly.jpeg': [1950 / 2560, 800 / 1279, 140 / 2560, 150 / 1279],
    'hearts.jpg': [990 / 2560, 625 / 1279, 120 / 2560, 65 / 1279],
    'glove.jpeg': [1814 / 2560, 1030 / 1279, 135 / 2560, 130 / 1279],
    'watering_can.jpeg': [1699 / 2560, 52 / 1279, 135 / 2560, 160 / 1279],
    'other_water_can_thing.jpeg': [1930 / 2560, 88 / 1279, 70 / 2560, 110 / 1279],
    'ice_cream_one.jpeg': [1375 / 2560, 530 / 1279, 83 / 2560, 110 / 1279],
    'candle_two.jpg': [1650 / 2560, 860 / 1279, 160 / 2560, 77 / 1279],
    'bird_two.jpg': [1410 / 2560, 123 / 1279, 110 / 2560, 210 / 1279],
    'cup.jpg': [1712 / 2560, 563 / 1279, 90 / 2560, 91 / 1279],
    'bird_three.jpg': [891 / 2560, 1116 / 1279, 150 / 2560, 100 / 1279],
    'dragonfly.jpeg': [1590 / 2560, 126 / 1279, 140 / 2560, 153 / 1279],
    'heart.jpg': [930 / 2560, 1057 / 1279, 75 / 2560, 75 / 1279],
    'tadpole.jpeg': [1165 / 2560, 534 / 1279, 84 / 2560, 63 / 1279],
    'loop.jpg': [1377 / 2560, 780 / 1279, 115 / 2560, 38 / 1279],
    'turtle.jpg': [1942 / 2560, 1115 / 1279, 114 / 2560, 140 / 1279],
    'ice_cone.jpeg': [1059 / 2560, 1065 / 1279, 70 / 2560, 80 / 1279],
    'glove.jpeg': [1814 / 2560, 1030 / 1279, 135 / 2560, 130 / 1279],
    'angel.jpeg': [1830 / 2560, 198 / 1279, 120 / 2560, 140 / 1279],
    'knife.jpeg': [1932 / 2560, 950 / 1279, 100 / 2560, 110 / 1279],
    'worm_memorial.jpeg': [1860 / 2560, 640 / 1279, 90 / 2560, 165 / 1279],
    'pencil_memorial.jpg': [928 / 2560, 869 / 1279, 20 / 1200, 143 / 1170],
    };
    

var boundArray = { 'fday.jpg': fdayBoxes, 'christ.png': christBoxes, 'horse.jpg': horseBoxes, 'warmup.png': warmupBoxes, 'halloween.jpeg': halloweenBoxes, "memorial.jpeg":memorialBoxes };


  
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
    console.log("x:",x, "y:",y)
    console.log('target:',
        target[0] * window.innerWidth, 
        target[1] * window.innerHeight, 
        target[0] * window.innerWidth + target[2] * window.innerWidth, 
        target[1] * window.innerHeight + target[3] * window.innerHeight
    )
    var left = target[0] * window.innerWidth - container.left;
    var top = target[1] * window.innerHeight - container.top;
    var width = target[2] * window.innerWidth;
    var height = target[3] * window.innerHeight;

    
    if (target[0] * window.innerWidth <= x && target[1] * window.innerHeight <= y && x <= target[0] * window.innerWidth + target[2] * window.innerWidth && y <= target[1] * window.innerHeight + target[3] * window.innerHeight) {
        document.getElementById("skipButton").disabled = true;
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
        var wrongMessage = document.createElement('p');
        wrongMessage.textContent = userId + ' got it wrong :(';
        document.querySelector("#clickStatus").append(wrongMessage);
        setTimeout(function() {
            wrongMessage.remove();
        }, 3000);

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
    // check if somene skipped or found the target to move on
    console.log('complete')
    nextTarget();
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
        document.getElementById("skipButton").innerHTML = "Target Absent";
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
