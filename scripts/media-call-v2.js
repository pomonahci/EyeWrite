/**
 * media-call.js adds voice and video chat functionality to EyeWrite.
 * It is an expansion of voice-chat.js
 * Users peer.js as p2p communication protocol.
 * 
 * Name: chanhakim, nickmarsano
 * Date: 05/27/2021
 */

var mediaCall = function () {
	var mediaRef = firebaseRef.child("media");

	// references to voice chat switch and mute button.
	var voiceChatSwitch = document.getElementById("voiceChatSwitch");
	var voiceAudButton = document.getElementById("aud");

	//references to video conference switch and cam button
	var videoCamButton = document.getElementById("cam");

	/**
	 * Listener for voice chat switch.
	 * Toggle on voice chat when the switch is on. Otherwise, turn off voice chat.
	 */
	voiceChatSwitch.addEventListener("change", function () {
		if (voiceChatSwitch.checked == true) {
			voiceChatSwitch.disabled = true;
			mediaRef.child(userId).update({ audio: false, camera: false, is_ready: true, peer_id: "-1", stream_id: "-1" })
			onJoin();
		} else {
			voiceChatSwitch.disabled = true;
			onLeave();
		}
	});
	voiceAudButton.onclick = toggleAudButton;
	videoCamButton.onclick = toggleCamButton;


	var myPeer;                 // the local client's peer
	var myStream;               // the local client's media stream
	var readyToJoin = false;    // whether the local client is ready to join
	var remoteClients = {};     // collection of remote clients, indexed by user id
	// var audioElts = {};        // collection of (active) audio elements
	var audStatus = {};        // collection of audio status for each audio element

	// var videoElts = {};			//collection of (active) video elements
	var camStatus = {};			//collection of camera status for each video element

	var mediaElts = {};			// collection of active media elements

	var streamContainers = {};

	var streams = {};

	// var userColors = {};      // object for user colors



	// public ICE servers (required by peer.js for free p2p communicatio protocl)
	var config = {
		'iceServers': [
			{ 'urls': 'stun:stun.services.mozilla.com' },
			{ 'urls': 'stun:stun.l.google.com:19302' }
		]
	};

	/**
	 * Listener for new additions to voiceRef.
	 */
	// voiceRef.on("child_added", function (snapshot) {
	mediaRef.on("child_added", function (snapshot) {
		console.log("child added. "+ snapshot.key);
		if (userId != snapshot.key) {
			// when the added child is not the local client
			remoteClients[snapshot.key] = snapshot.val();
		} else {
			// when the added child is the local client
			if (snapshot.child("is_ready")) {
				readyToJoin = true;
			}
		}
	});

	/**
	 * Listener for updates to voiceRef.
	 */
	mediaRef.on("child_changed", function (snapshot) {
		console.log("child changed.");
		if (userId != snapshot.key) {                                   // when the updated child is not the local client
			snapshot.forEach(function (child) {
				remoteClients[snapshot.key][child.key] = child.val();
				audStatus[snapshot.child("stream_id").val()] = snapshot.child("audio").val();
				camStatus[snapshot.child("stream_id").val()] = snapshot.child("camera").val();
				toggleAudioElement(snapshot.child("stream_id").val());
				toggleVideoElement(snapshot.child("stream_id").val());
			});
		} else {                                                        // when the updated child is the local client
			if (snapshot.child("is_ready")) {
				readyToJoin = true;
			}
			audStatus[snapshot.child("stream_id").val()] = snapshot.child("audio").val();
			camStatus[snapshot.child("stream_id").val()] = snapshot.child("camera").val();
			toggleAudioElement(snapshot.child("stream_id").val());
			toggleVideoElement(snapshot.child("stream_id").val());

		}
		if (myPeer && myPeer.id && readyToJoin) { // audio and camera buttons trigger this
			console.log(remoteClients);
			for (uId in remoteClients) {
				if (uId < userId && remoteClients[uId]["is_ready"] && remoteClients[uId]["peer_id"] && remoteClients[uId]["peer_id"] != "-1") callRemotePeer(uId);
			}
		}
	});

	/**
	 * Listener for removals from mediaRef.
	 */
	mediaRef.on("child_removed", function (snapshot) {
		console.log("child removed.");
		// if (userColors[snapshot.key]) {
		// 	delete userColors[snapshot.key];
		// }
		if (remoteClients[snapshot.key]) {
			delete audStatus[snapshot.child("stream_id").val()];
			delete camStatus[snapshot.child("stream_id").val()];
			delete remoteClients[snapshot.key];
		}
		let streamId = snapshot.child("stream_id").val();
		if (mediaElts[streamId]) removeVideoElement(streamId);
		// document.getElementById(snapshot.key).remove();
	});

	/**
	 * Listener for color or name changes from userRef
	 */
	firebaseRef.child("users").on("child_changed", function(snapshot){
		console.log("User Information Changed");
		if (userId != snapshot.key){//if not local client
			if(remoteClients[snapshot.key]){
				var sid = remoteClients[snapshot.key]["stream_id"];
				if(document.getElementById(sid+"container")){
					document.getElementById(sid).setAttribute('style',"box-shadow: 10px 0 0 0 "+snapshot.child("color").val());
					document.getElementById(sid+"username").innerHTML = snapshot.child("name").val();
				}
			}
		}
		else{
			if(myStream){
				if(document.getElementById(myStream.id+"container")){
					document.getElementById(myStream.id).setAttribute('style',"box-shadow: 10px 0 0 0 "+snapshot.child("color").val());
					document.getElementById(myStream.id+'username').innerHTML = snapshot.child("name").val();
				}
			}
		}
	})

	/**
	 * Callback for the join button.
	 */
	function onJoin() {
		startMyStream();
	}

	/**
	 * Toggles the mute button.
	 */
	function toggleAudButton() {
		if (voiceAudButton.innerText == "Unmuted") {
			mediaRef.child(userId).update({ audio: false });
			voiceAudButton.innerText = "Muted";

		} else if (voiceAudButton.innerText == "Muted") {
			mediaRef.child(userId).update({ audio: true });
			voiceAudButton.innerText = "Unmuted";

		} else {
			console.log(" Audio Button Error");
		}
	}

	/**
	 * Toggles the cam button.
	 */
		 function toggleCamButton() {
			if (videoCamButton.innerText == "Hidden") {
				mediaRef.child(userId).update({ camera: true });
				videoCamButton.innerText = "Visible";
			} else if (videoCamButton.innerText == "Visible") {
				mediaRef.child(userId).update({ camera: false });
				videoCamButton.innerText = "Hidden";
			} else {
				console.log("Video Button Error");
			}
		}

	/**
	 * Starts local stream, creates local client's peer, and creates a mute button.
	 */
	function startMyStream() {
		navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(function (stream) {
			myStream = stream;
			console.log(`${userId} turned on media stream: ${myStream.id}`);
			mediaRef.child(userId).update({ is_ready: true, stream_id: myStream.id });

			hasStream = true;
			createMyPeer();
			console.log(`${userId} joined the media chat`);
			// alert("Joining the media chat.");
			document.getElementById("voiceChatSwitch").disabled = false;
			document.getElementById("aud").disabled = false;
			document.getElementById("cam").disabled = false;

			//adding local camera
			addVideoElement(myStream);

		}).catch(function (err) {
			console.error(`${userId} failed to turn on media stream`, err);
			voiceChatSwitch = document.getElementById("voiceChatSwitch");
			voiceChatSwitch.checked = false;
			voiceChatSwitch.disabled = false;
		});
	}
	/**
	 * Ends local stream.
	 */
	function endMyStream() {
		myStream.getTracks().forEach(function (track) {
			track.stop();
		});
		myStream = null;
	}


	function getKeyByStreamId(object, value) {
		return Object.keys(object).find(key => object[key].stream_id === value);
	}

	function addVideoElement(stream){

		console.log("adding video element");
		// getting color of stream's user source
		var id = getKeyByStreamId(remoteClients,stream.id);
		if(!id){
			id = userId;
		}
		var color = "red";
		var name = "Doe";
		firebaseRef.child("users").child(id).on("value", function (snapshot) {
			if (snapshot.child("color").val()) {
			color = snapshot.child("color").val();
			}
			if (snapshot.child("name").val()) {

				name = snapshot.child("name").val();
			}
			//remove the listener
			firebaseRef.child("users").child(snapshot.key).off("value");
			
		});

		if (!mediaElts[stream.id]) {

			var container = document.createElement('div');
			var label = document.createElement('p');
			label.setAttribute('style','position:absolute;color:white;font-size:12px;align-self:center;font-weight:bold;background-color:black;');
			label.innerHTML = name;
			label.id = stream.id + "username";
			container.appendChild(label);
			container.id = stream.id + "container";

			var video = document.createElement("video");
			video.setAttribute("width","175px");
			video.setAttribute("style","box-shadow: 10px 0 0 0 "+color);
			video.autoplay = true;
			video.muted = true;
			if(id!= userId){
				if (!remoteClients[id].camera) container.style.visibility = 'hidden';
			}else container.style.visibility = 'hidden';
			video.load();
			video.addEventListener("load", function () {
				video.play();
			}, true);
			video.id = stream.id;
			video.srcObject = stream;
			mediaElts[video.id] = video;
			if (!camStatus[stream.id]) toggleVideoElement(stream.id);

			container.appendChild(video);
			streamContainers[container.id] = container;

			if(id!=userId){
				video.srcObject.getVideoTracks()[0].enabled = remoteClients[id].camera;
			}
			// document.querySelector("#video-streams").append(video);
			document.querySelector("#video-streams").append(container);
			console.log(`added ${stream.id} to #video-streams`);
		}
	}

	/**
	 * Toggles the audio element with the given streamId.
	 * 
	 * @param {String} streamId 
	 */
	function toggleAudioElement(streamId) {
		console.log("Toggling Audio Element: " + streamId);
		if (mediaElts[streamId]) {
			let stream = mediaElts[streamId].srcObject;
			stream.getAudioTracks().forEach(function (track) {
				track.enabled = audStatus[streamId];
			});
			let vid = mediaElts[stream.id];
			if(getKeyByStreamId(remoteClients,stream.id))
				vid.muted = !audStatus[streamId];
		}
	}

	function toggleVideoElement(streamId) {
		 console.log("Toggling Video Element: " + streamId);
		if (mediaElts[streamId]) {
			let stream = mediaElts[streamId].srcObject;
			stream.getVideoTracks().forEach(function (track) {
				track.enabled = camStatus[streamId];
			});
			if (document.getElementById(streamId)){
				if(camStatus[streamId]){
					document.getElementById(streamId+"container").style.visibility = 'visible';
				}
				else {
					document.getElementById(streamId+"container").style.visibility = 'hidden';
				}
			}
		}

	}


	function removeVideoElement(streamId) {
		let video = mediaElts[streamId];
		let container = streamContainers[streamId+"container"];
		if (video != "-1") {
			video.srcObject.getTracks().forEach(function (track) {
				track.stop();
			});
			container.remove();
			delete mediaElts[streamId];
			delete streamContainers[streamId+"container"];
			console.log(`removed ${streamId} from video`);
		}
	}

	/**
	 * Creates the local client's peer.
	 */
	function createMyPeer() {

		myPeer = new Peer({ config: config, debug: 1 });

		// callbacks for opening connection and error
		myPeer.on('open', function (id) {
			mediaRef.child(userId).update({ peer_id: id, is_ready: readyToJoin });
			if (readyToJoin) mediaRef.child(userId).update({ stream_id: myStream.id });
		});

		myPeer.on('error', function (error) {
			console.error(error);
		});

		// handling incoming data connection
		myPeer.on('connection', function (conn) {
			conn.on('data', function (data) {
				var tmp = data.split(" ");
				console.log(`${tmp[0]} -> ${userId}: ${tmp.slice(1).join(" ")}`);
				switch (tmp[1]) {
					case "new-connection":
						remoteClients[tmp[0]]["conn"] = conn;
						break;

				}
			});
			conn.on('open', function () {
				conn.send(`${userId} new-connection`);
			});
		});

		// handling incoming audio connection
		myPeer.on('call', function (call) {
			// Answer the call
			call.answer(myStream);
			call.on('stream', function (stream) {
				addVideoElement(stream);
			});
			console.log(`${userId} answered a call`);
		});
	}

	/**
	 * Calls a remote client given the remote client's peer id.
	 * 
	 * @param {String} id 
	 */
	function callRemotePeer(id) {
		if (!remoteClients[id]["conn"]) {
			remoteClients[id]["conn"] = true;

			console.log(`${userId} started a call`);
			let peerId = remoteClients[id]["peer_id"];
			let conn = myPeer.connect(peerId);

			conn.on('data', function (data) {
				var tmp = data.split(" ");
				console.log(`${tmp[0]} -> ${userId}: ${tmp.slice(1).join(" ")}`);
				switch (tmp[1]) {
					case "new-connection":
						remoteClients[tmp[0]]["conn"] = conn;
						break;
				}
			});

			conn.on('open', function () {
				conn.send(`${userId} new-connection`);
			});

			let call = myPeer.call(peerId, myStream);
			call.on('stream', function (stream) {
				addVideoElement(stream);
			});		}
	}

	/**
	 * Callback for when the user clicks the leave button.
	 */
	function onLeave() {
		console.log(`${userId} left the chat`);
		(async function () { return await myPeer.destroy(); })();
		myPeer = null;
		readyToJoin = false;
		endMyStream();
		for (uId in remoteClients) {
			if (mediaElts[remoteClients[uId]["stream_id"]]) removeVideoElement(remoteClients[uId]["stream_id"]);
		}
		mediaRef.child(userId).set(null);

		document.getElementById("aud").disabled = true;
		document.getElementById("aud").innerText = "Muted";
		document.getElementById("cam").disabled = true;
		document.getElementById("cam").innerText = "Hidden";
		document.getElementById("voiceChatSwitch").disabled = false;
	}


	window.addEventListener("beforeunload", function () {
		if (document.getElementById('voiceChatSwitch').checked) {
			onLeave();
			document.getElementById('voiceChatSwitch').checked = false;
		}
		mediaRef.child(userId).set(null);
		mediaRef.child(userId).remove();
	});

}();