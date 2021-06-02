/**
 * voice-chat.js adds voice chat functionality to EyeWrite.
 * Users peer.js as p2p communication protocol.
 * 
 * Name: chanhakim
 * Date: 05/27/2021
 */

var voiceChat = function () {
	var voiceRef = firebaseRef.child("voice");		// reference to user voice info

	// references to voice chat switch and mute button.
	var voiceChatSwitch = document.getElementById("voiceChatSwitch");
	var voiceMuteButton = document.getElementById("mute");

	/**
	 * Listener for voice chat switch.
	 * Toggle on voice chat when the switch is on. Otherwise, turn off voice chat.
	 */
	voiceChatSwitch.addEventListener("change", function () {
		if (voiceChatSwitch.checked == true) {
			voiceChatSwitch.disabled = true;
			voiceRef.child(userId).update({ is_muted: false, is_ready: true, peer_id: "-1", stream_id: "-1" })
			onJoin();
		} else {
			voiceChatSwitch.disabled = true;
			onLeave();
		}
	});
	voiceMuteButton.onclick = toggleMuteButton;


	var myPeer;                 // the local client's peer
	var myStream;               // the local client's media stream
	var readyToJoin = false;    // whether the local client is ready to join
	var remoteClients = {};     // collection of remote clients, indexed by user id
	var audioElts = {};        // collection of (active) audio elements
	var muteStatus = {};        // collection of mute status for each audio element


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
	voiceRef.on("child_added", function (snapshot) {
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
	voiceRef.on("child_changed", function (snapshot) {
		if (userId != snapshot.key) {                                   // when the updated child is not the local client
			snapshot.forEach(function (child) {
				remoteClients[snapshot.key][child.key] = child.val();
				muteStatus[snapshot.child("stream_id").val()] = snapshot.child("is_muted").val();
				toggleAudioElement(snapshot.child("stream_id").val());
			});

		} else {                                                        // when the updated child is the local client
			if (snapshot.child("is_ready")) {
				readyToJoin = true;
			}
		}

		if (myPeer && myPeer.id && readyToJoin) {
			for (uId in remoteClients) {
				if (uId < userId && remoteClients[uId]["is_ready"] && remoteClients[uId]["peer_id"] && remoteClients[uId]["peer_id"] != "-1") callRemotePeer(uId);
			}
		}
	});

	/**
	 * Listener for removals from voiceRef.
	 */
	voiceRef.on("child_removed", function (snapshot) {
		if (remoteClients[snapshot.key]) {
			delete muteStatus[snapshot.child("stream_id").val()];
			delete remoteClients[snapshot.key];
		}
		let streamId = snapshot.child("stream_id").val();
		if (audioElts[streamId]) removeAudioElement(streamId);
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
	function toggleMuteButton() {
		if (voiceMuteButton.innerText == "Mute") {
			// alert('muting')
			voiceRef.child(userId).update({ is_muted: true });
			voiceMuteButton.innerText = "Unmute";
			// for (uId in remoteClients) {
			//   if (remoteClients[uId]["conn"]) remoteClients[uId]["conn"].send(`${userId} mute ${myStream.id}`);
			// }
		} else if (voiceMuteButton.innerText == "Unmute") {
			// alert('unmuting')
			voiceRef.child(userId).update({ is_muted: false });
			voiceMuteButton.innerText = "Mute";
			// for (uId in remoteClients) {
			//   if (remoteClients[uId]["conn"]) remoteClients[uId]["conn"].send(`${userId} unmute ${myStream.id}`);
			// }
		} else {
			console.log("Error");
		}
	}

	/**
	 * Starts local stream, creates local client's peer, and creates a mute button.
	 */
	function startMyStream() {
		navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then(function (stream) {
			myStream = stream;
			console.log(`${userId} turned on audio stream: ${myStream.id}`);
			voiceRef.child(userId).update({ is_ready: true, stream_id: myStream.id });
			hasStream = true;
			createMyPeer();
			console.log(`${userId} joined the chat`);
			alert("Joining the voice chat.");
			document.getElementById("voiceChatSwitch").disabled = false;
			document.getElementById("mute").disabled = false;
			// createMuteButton();
		}).catch(function (err) {
			console.error(`${userId} failed to turn on audio stream`, err);
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
			if (muteStatus[stream.id]) toggleAudioElement(stream.id);
			document.querySelector("#audio-streams").append(audio);
			console.log(`added ${stream.id} to #audio-streams`);
		}
	}

	/**
	 * Toggles the audio element with the given streamId.
	 * 
	 * @param {String} streamId 
	 */
	function toggleAudioElement(streamId) {
		// console.log(streamId);
		if (audioElts[streamId]) {
			let stream = audioElts[streamId].srcObject;
			stream.getAudioTracks().forEach(function (track) {
				track.enabled = !muteStatus[streamId];
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

	/**
	 * Creates the local client's peer.
	 */
	function createMyPeer() {

		myPeer = new Peer({ config: config, debug: 1 });

		// callbacks for opening connection and error
		myPeer.on('open', function (id) {
			voiceRef.child(userId).update({ peer_id: id, is_ready: readyToJoin });
			if (readyToJoin) voiceRef.child(userId).update({ stream_id: myStream.id });
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
					// case "mute":
					//   toggleAudioElement(tmp[2]);
					//   console.log(`muted ${tmp[0]}`);
					//   break;
					// case "unmute":
					//   toggleAudioElement(tmp[2]);
					//   console.log(`unmuted ${tmp[0]}`);
					//   break;
				}
			});
			conn.on('open', function () {
				conn.send(`${userId} new-connection`);
				// console.log(`sent: new-connection from ${userId}`);
			});
		});

		// handling incoming audio connection
		myPeer.on('call', function (call) {
			// Answer the call
			call.answer(myStream);
			call.on('stream', function (stream) {
				// `stream` is the MediaStream of the remote peer.
  				// Here you'd add it to an HTML video/canvas element.
				addAudioElement(stream);
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
					// case "mute":
					//   toggleAudioElement(tmp[2]);
					//   console.log(`muted ${tmp[0]}`);
					//   break;
					// case "unmute":
					//   toggleAudioElement(tmp[2]);
					//   console.log(`unmuted ${tmp[0]}`);
					//   break;
				}
			});

			conn.on('open', function () {
				conn.send(`${userId} new-connection`);
				// console.log(`sent: new-connection from ${userId}`);
			});

			let call = myPeer.call(peerId, myStream);
			call.on('stream', addAudioElement);
		}
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
			removeAudioElement(remoteClients[uId]["stream_id"]);
		}
		voiceRef.child(userId).set(null);
		alert("Leaving the voice chat.");
		document.getElementById("mute").disabled = true;
		document.getElementById("mute").innerText = "Mute";
		document.getElementById("voiceChatSwitch").disabled = false;
	}

	window.addEventListener("beforeunload", function () {
		if (document.getElementById('voiceChatSwitch').checked) {
			onLeave();
			document.getElementById('voiceChatSwitch').checked = false;
		}
		voiceRef.child(userId).set(null);
		voiceRef.child(userId).remove();
	});
}();
