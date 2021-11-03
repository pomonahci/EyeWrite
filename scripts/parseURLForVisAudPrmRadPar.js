/**
 * parseURLForVisAudPrm.js triggers when FirePad is ready and turns on visualizations and audio call as need be
 * This is designed for EyeDraw and will also parse for the drawing prompt
 * 
 * Name: nickmarsano
 * Date: 07/01/2021
 */


function parseURLFor() {
    var URL = window.location.href;
    var html = URL.search("eyewrite.html#")
    var p1 = URL.substring(23,html);
    var p2 = URL.substring(html+14,URL.length);
    fileName = p1+p2;

    if (URL.search("EyeDraw") != -1) experiment = "EyeDraw";
    else if (URL.search("ImageSearch") != -1) experiment = "ImageSearch";
    else if (URL.search("EyeWrite") != -1) experiment = "EyeWrite";

    var visualization = URL.search("vis");
    visualization = URL.substring(visualization + 4, visualization + 5);
    var audio = URL.search("aud");
    if (audio == -1 && experiment == 'EyeDraw') {
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

    var prompt = URL.search("prm");
    prompt = URL.substring(prompt + 4, URL.length);
    document.getElementById('drawingPrompt').innerHTML = prompt;
    serverContent.push(["Prompt",prompt]);

    collaborators = URL.search("par");
    collaborators = URL.substring(collaborators+4,collaborators+5);

    var radius = URL.search("rad");
    radius = URL.substring(radius + 4, radius + 5);
    document.getElementById("sentenceSlider").value = radius;
}

function triggerVis(vis) {
    if (vis == 1) {//HollowMouse
        serverContent.push(["Visualization","Hollow Circle"]);
        document.getElementById("vis-shape").value = 'hollow';
        document.getElementById("vis-shape").dispatchEvent(new Event('change'));
        // document.getElementById("mouseSendSwitch").click();
        // document.getElementById("mouseVisSwitch").click();
        document.getElementById("gazeSendSwitch").click();
        document.getElementById("gazeVisSwitch").click();
    }
    else if (vis == 2) {//HeatMapMouse
        serverContent.push(["Visualization","HeatMap"]);
        document.getElementById("vis-shape").value = 'heatmap';
        document.getElementById("vis-shape").dispatchEvent(new Event('change'));
        // document.getElementById("mouseSendSwitch").click();
        // document.getElementById("mouseVisSwitch").click();
        document.getElementById("gazeSendSwitch").click();
        document.getElementById("gazeVisSwitch").click();
    }
    else{
        serverContent.push(["Visualization","None"]);
    }
}

function triggerAud(aud) {
    if (aud == 1) {
        serverContent.push(["Audio","On"]);
        var mediaRef = firebaseRef.child("media");
        joinButStat = true;
        mediaRef.child(userId).update({ audio: true, camera: false, is_ready: true, peer_id: "-1", stream_id: "-1" })
        onJoin();
        joinButton.innerHTML = "LEAVE";
        mediaRef.child(userId).update({ audio: true });
        voiceAudButton.innerText = "Unmuted";
    }
    else {
        serverContent.push(["Audio","Off"]);
        console.log("No Audio Call.");
    }
}
