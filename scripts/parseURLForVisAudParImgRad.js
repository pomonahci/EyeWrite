/**
 * parseURLForVisAudParImgRad.js triggers when FirePad is ready and turns on visualizations and audio call as need be
 * as well as setting some other parameters
 * 
 * Name: nickmarsano
 * Date: 07/01/2021
 */

// whether the gaze colors should be unique
var unique = 2;
// whether the overlap should be deterministic or not
var deterministic = 0;

function parseURLFor() {
    var URL = window.location.href;
    var html = URL.search("eyewrite.html#")
    var p1 = URL.substring(23,html);
    var p2 = URL.substring(html+14,URL.length);
    fileName = p1+p2;

    // this is the experiment name
    if (URL.search("EyeDraw") != -1) experiment = "EyeDraw";
    else if (URL.search("ImageSearch") != -1) experiment = "ImageSearch";
    else if (URL.search("EyeWrite") != -1) experiment = "EyeWrite";

    var visualization = URL.search("vis");
    visualization = URL.substring(visualization + 4, visualization + 8);
    var audio = URL.search("aud");
    if (experiment == 'EyeDraw') {
        audio = 1;
    }
    else if (audio == -1) {
        audio = 0
    }
    else {
        audio = URL.substring(audio + 4, audio + 5);
    }
    if (visualization == -1) visualization = 1;

    triggerVis(visualization);
    triggerAud(audio);


    var imageLabel = URL.search("img");
    imageLabel = URL.substring(imageLabel + 4, imageLabel + 5);

    // this is the number of people in the experiment
    var numPpl = URL.search('par');
    if (numPpl == -1) {
        numPpl = 2;
    }
    else {
        numPpl = URL.substring(numPpl + 4, numPpl + 5);
    }
    var communicationCondition = URL.search("gaze");
    condition = URL.substring(communicationCondition + 5, communicationCondition + 6);
    unique = condition == "V" ? 2 : 1;
    

    // var radius = URL.search("rad");
    // radius = URL.substring(radius + 4, radius + 6);

    // set gze radius to 10 by default
    document.getElementById("sentenceSlider").value = 10;
}

function triggerVis(vis) {
    if(vis[0]==0){//none
        // document.getElementById("mouseSendSwitch").click();
        // document.getElementById("mouseVisSwitch").click();
        serverContent.push(["Visualization","None"]);
        return;
    }
    else {//gaze
        document.getElementById("gazeSendSwitch").click();
        document.getElementById("gazeVisSwitch").click();
    }

    if(vis[1]==0){//hollow
        serverContent.push(["Visualization","Hollow Circle"]);
        document.getElementById("vis-shape").value = 'hollow';
        document.getElementById("vis-shape").dispatchEvent(new Event('change'));
    }
    else if(vis[1] == 1) {//solid
        serverContent.push(["Visualization","Solid"]);
        document.getElementById("vis-shape").value = 'solid';
        document.getElementById("vis-shape").dispatchEvent(new Event('change'));
    }
    else if(vis[1] == 2){//heatmap
        serverContent.push(["Visualization","Heatmap"]);
        document.getElementById("vis-shape").value = 'heatmap';
        document.getElementById("vis-shape").dispatchEvent(new Event('change'));
    }

    if(vis[2]==0){//same colors
        serverContent.push(["Colors","Identical"]);
        unique = 0;
    }
    else if(vis[2]==1) {//unique
        serverContent.push(["Colors","Unique"]);
        unique = 1;
    }
    else if(vis[2]==2) {//transparent
        serverContent.push(["Colors", "Transparent"]);
        unique = 2;
    }

    if(vis[3]==0){//no change in overlap
        serverContent.push(["Overlap","None"]);
        deterministic = 0;
    }
    else if(vis[3]==1){//deterministic change in overlap
        serverContent.push(["Overlap","Deterministic"]);
        deterministic = 1;
    }
    else{//color combo change in overlap
        serverContent.push(["Overlap","Combination"]);
        deterministic = 2;
    }}

function triggerAud(aud) {
    if (aud == 1) {
        // serverContent.splice(4,0,["Audio","On"]);
        var mediaRef = firebaseRef.child("media");
        joinButStat = true;
        mediaRef.child(userId).update({ audio: false, camera: false, is_ready: true, peer_id: "-1", stream_id: "-1" })
        onJoin();
        joinButton.innerHTML = "LEAVE";
        mediaRef.child(userId).update({ audio: true });
        voiceAudButton.innerText = "Unmuted";
    }
    else {
        // serverContent.splice(4,0,["Audio","Off"]);
        console.log("No Audio Call.");
    }
}
