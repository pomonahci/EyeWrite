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
	var audioElts = {};        // collection of (active) audio elements
	var audStatus = {};        // collection of audio status for each audio element

	var videoElts = {};			//collection of (active) video elements
	var camStatus = {};			//collection of camera status for each video element

	var userColors = {};      // object for user colors



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
		}
		// adding User's color to list to use as video border later
		// var id = snapshot.child("stream_id").val();
		// console.log("coloradding: "+snapshot.key);//snapshshot.key = userId for the user being changed!
		// firebaseRef.child("users").child(snapshot.key).on("value", function (snapshot) {
		// 	if (snapshot.child("color").val()) {
		// 	  userColors[id]= snapshot.child("color").val();
		// 	  //remove the listener
		// 	  firebaseRef.child("users").child(snapshot.key).off("value");
		// 	}
		//   });

		if (myPeer && myPeer.id && readyToJoin) { // audio and camera buttons trigger this
			console.log(remoteClients);
			for (uId in remoteClients) {
				if (uId < userId && remoteClients[uId]["is_ready"] && remoteClients[uId]["peer_id"] && remoteClients[uId]["peer_id"] != "-1") callRemotePeer(uId);
			}
		}
	});

	/**
	 * Listener for removals from voiceRef.
	 */
	mediaRef.on("child_removed", function (snapshot) {
		console.log("child removed.");
		if (userColors[snapshot.key]) {
			delete userColors[snapshot.key];
		}
		if (remoteClients[snapshot.key]) {
			delete audStatus[snapshot.child("stream_id").val()];
			delete camStatus[snapshot.child("stream_id").val()];
			delete remoteClients[snapshot.key];
		}
		let streamId = snapshot.child("stream_id").val();
		if (audioElts[streamId]) removeAudioElement(streamId);
		if (videoElts[streamId]) removeVideoElement(streamId);
		// document.getElementById(snapshot.key).remove();
	});

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
		if (voiceAudButton.innerText == "On") {
			mediaRef.child(userId).update({ audio: false });
			voiceAudButton.innerText = "Off";

		} else if (voiceAudButton.innerText == "Off") {
			mediaRef.child(userId).update({ audio: true });
			voiceAudButton.innerText = "On";

		} else {
			console.log(" Audio Button Error");
		}
	}

	/**
	 * Toggles the cam button.
	 */
		 function toggleCamButton() {
			if (videoCamButton.innerText == "Off") {
				mediaRef.child(userId).update({ camera: true });
				videoCamButton.innerText = "On";
				// document.getElementById("my-camera").srcObject=myStream;
			} else if (videoCamButton.innerText == "On") {
				mediaRef.child(userId).update({ camera: false });
				videoCamButton.innerText = "Off";
				// document.getElementById("my-camera").srcObject=null;
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

	/**
	 * Adds a stream to #audio-streams
	 * https://github.com/Bohmaster/real-time-audio-chat
	 * 
	 * @param {mediaStream} stream 
	 */
	function addAudioElement(stream) {
		console.log("adding audio element");
		if (!audioElts[stream.id]) {
			var audio = document.createElement("audio");
			audio.autoplay = true;
			audio.load();
			audio.addEventListener("load", function () {
				audio.play();
			}, true);
			audio.id = stream.id;
			audio.srcObject = stream;
			audioElts[audio.id] = audio;
			if (!audStatus[stream.id]) toggleAudioElement(stream.id);
			document.querySelector("#audio-streams").append(audio);
			console.log(`added ${stream.id} to #audio-streams`);
		}
	}

	function getKeyByValue(object, value) {
		return Object.keys(object).find(key => object[key].stream_id === value);
	  }

	function addVideoElement(stream){
		console.log("adding video element");
		console.log(userId);
		var id = getKeyByValue(remoteClients,stream.id);
		firebaseRef.child("users").child(id).on("value", function (snapshot) {
			if (snapshot.child("color").val()) {
			  userColors[id]= snapshot.child("color").val();
			  //remove the listener
			  firebaseRef.child("users").child(snapshot.key).off("value");
			}
		  });
		if (!videoElts[stream.id]) {
			var video = document.createElement("video");
			video.setAttribute("width","175px");
			video.setAttribute("style","box-shadow: 0 0 0 5pt "+userColors[stream.id]);//need to use streamid to query the actual userif (user if takes local id)
			video.autoplay = true;
			video.muted = true;
			video.load();
			video.addEventListener("load", function () {
				video.play();
			}, true);
			video.id = stream.id;
			video.srcObject = stream;
			videoElts[video.id] = video;
			if (!camStatus[stream.id]) toggleVideoElement(stream.id);
			document.querySelector("#video-streams").append(video);
			console.log(`added ${stream.id} to #video-streams`);
		}
	}

	/**
	 * Toggles the audio element with the given streamId.
	 * 
	 * @param {String} streamId 
	 */
	function toggleAudioElement(streamId) {
		console.log("Toggling Audio Element" + streamId);

		// var vid = document.getElementById(streamId);
		// if (audioElts[streamId]) {
		// 	vid.setAttribute("muted","false");
		// }
		// else{
		// 	vid.setAttribute("muted","true");
			
		// }

		if (audioElts[streamId]) {
			let stream = audioElts[streamId].srcObject;
			stream.getAudioTracks().forEach(function (track) {
				track.enabled = audStatus[streamId];
			});
		}
	}

	function toggleVideoElement(streamId) {
		 console.log("Toggling Video Element" + streamId);
		if (videoElts[streamId]) {
			let stream = videoElts[streamId].srcObject;
			stream.getVideoTracks().forEach(function (track) {
				track.enabled = camStatus[streamId];
			});
		}
	}

	/**
	 * Removes the audio element with the given streamId.
	 * 
	 * @param {String} streamId 
	 */
	function removeAudioElement(streamId) {
		let audio = audioElts[streamId];
		if (audio != "-1") {
			audio.srcObject.getTracks().forEach(function (track) {
				track.stop();
			});
			audio.remove();
			delete audioElts[streamId];
			console.log(`removed ${streamId} from audio`);
		}
	}

	function removeVideoElement(streamId) {
		let video = videoElts[streamId];
		if (video != "-1") {
			video.srcObject.getTracks().forEach(function (track) {
				track.stop();
			});
			video.remove();
			delete videoElts[streamId];
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
				// addAudioElement(stream);
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
				// addAudioElement(stream);
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
			if (audioElts[remoteClients[uId]["stream_id"]]) removeAudioElement(remoteClients[uId]["stream_id"]);
			if (videoElts[remoteClients[uId]["stream_id"]]) removeVideoElement(remoteClients[uId]["stream_id"]);
		}
		mediaRef.child(userId).set(null);
		// alert("Leaving the media call.");
		// document.getElementById("my-camera").srcObject=null;
		document.getElementById("aud").disabled = true;
		document.getElementById("aud").innerText = "Off";
		document.getElementById("cam").disabled = true;
		document.getElementById("cam").innerText = "Off";
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

