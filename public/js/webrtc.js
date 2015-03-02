
//A list of public STUN and TURN servers from https://gist.github.com/yetithefoot/7592580
var iceServers = [	{url:'stun:stun01.sipphone.com'},
					{url:'stun:stun.ekiga.net'},
					{url:'stun:stun.fwdnet.net'},
					{url:'stun:stun.ideasip.com'},
					{url:'stun:stun.iptel.org'},
					{url:'stun:stun.rixtelecom.se'},
					{url:'stun:stun.schlund.de'},
					{url:'stun:stun.l.google.com:19302'},
					{url:'stun:stun1.l.google.com:19302'},
					{url:'stun:stun2.l.google.com:19302'},
					{url:'stun:stun3.l.google.com:19302'},
					{url:'stun:stun4.l.google.com:19302'},
					{url:'stun:stunserver.org'},
					{url:'stun:stun.softjoys.com'},
					{url:'stun:stun.voiparound.com'},
					{url:'stun:stun.voipbuster.com'},
					{url:'stun:stun.voipstunt.com'},
					{url:'stun:stun.voxgratia.org'},
					{url:'stun:stun.xten.com'},
					{url:'turn:numb.viagenie.ca', credential: 'muazkh', username: 'webrtc@live.com'},
					{url:'turn:192.158.29.39:3478?transport=udp', credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=', username: '28224511:1379330808'},
					{url:'turn:192.158.29.39:3478?transport=tcp', credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=', username: '28224511:1379330808'}
				];
				
var rtc = {
	//Initializes and returns a new RTC connection between two clients
	//The RTC connection object has the following methods:
	//call: Sends an incoming call to the 'to' ID.
	//answer: Answers an incoming call. If this operation completes without errors, the RTC call will start.
	//disconnect: Ends the call and permanently closes the RTC connection.
	//onCallStarted: Called when the RTC call has successfully started.
	//onCallEnded: Called after the RTC connection has closed.
	connect: function(from, to, socket, localVideo, remoteVideo) {
		var rtcConnection = {};
		var localStream;
		var remoteStream;
		var disconnected = false;
		
		//Peer connection configuration
		var pcConfig = {"iceServers": iceServers};
		
		//DTLS/SRTP is preferred on Chrome to interop with Firefox which supports them by default
		var pcConstraints = {"optional": [{"DtlsSrtpKeyAgreement": true}]};
		
		var sdpConstraints = {'mandatory': {'OfferToReceiveAudio':true, 'OfferToReceiveVideo':true}};
		
		//Firefox recommends the following format for setting constraints, but this is not accepted by Chrome
		//var sdpConstraints = {"offerToReceiveAudio": true, "offerToReceiveVideo": true};
		
		var printError = function(error) {
			if (error) {
				console.log("RTC error: " + error);
			}
		};
		
		//Create an RTC peer connection
		var pc;
		
		try {
			pc = new RTCPeerConnection(pcConfig, pcConstraints);
			
			pc.onicecandidate = function(event) {
				if (event.candidate) {
					sendSignal(event.candidate);
				}
			};
			
			pc.onaddstream = function(event) {
				remoteStream = event.stream;
				attachMediaStream(remoteVideo, event.stream);
			};
		}
		catch(e) {
			printError(e);
		}
		
		//Stops the RTC call
		var stop = function() {
			if (!disconnected) {
				pc.close();
				disconnected = true;
			}
			
			if (localStream && localStream.stop) {
				localStream.stop();
			}
			
			if (remoteStream && remoteStream.stop) {
				remoteStream.stop();
			}
			
			if (typeof(rtcConnection.onCallEnded) == "function") {
				rtcConnection.onCallEnded();
			}
			
			socket.removeListener("signal", receiveSignal);
		};
		
		var sendSignal = function(signal) {
			console.log("Sending RTC signal to " + to + ": " + JSON.stringify(signal));
			socket.emit("signal", signal, from, to);
		};
		
		var receiveSignal = function(signal, sender, receiver) {
			if (receiver === from) {
				console.log("Received RTC signal from " + sender + ": " + JSON.stringify(signal));
				
				if (signal.sdp) {
					pc.setRemoteDescription(new RTCSessionDescription(signal), function() {
						if (signal.type === "offer") {
							//Answer the call
							start(false);
						}
						else if (signal.type === "answer" && typeof(rtcConnection.onCallStarted) == "function") {
							rtcConnection.onCallStarted();
						}
					}, printError);
				}
				else if (signal.candidate) {
					pc.addIceCandidate(new RTCIceCandidate(signal), function() { 
						//Success callback for addIceCandidate
					}, printError);
				}
				else if (signal === "stop") {
					stop();
				}
			}			
		};
		
		socket.on("signal", receiveSignal);
		
		//Starts the RTC call
		var start = function(isHost) {
			getUserMedia({"audio": true, "video": true}, function(stream) {
				localStream = stream;
				
				if (disconnected) {
					stop();
					return;
				}
				else {
					attachMediaStream(localVideo, stream);
					pc.addStream(stream);
				}
				
				var setDescription = function(description) {
					pc.setLocalDescription(description, function() {
						sendSignal(description);
					}, printError);
				};
				
				if (isHost) {
					pc.createOffer(setDescription, printError, sdpConstraints);
				}
				else {
					pc.createAnswer(setDescription, printError, sdpConstraints);
					
					if (typeof(rtcConnection.onCallStarted) == "function") {
						rtcConnection.onCallStarted();
					}
				}
			}, printError);		
		};
		
		//Called when the other peer closes the browser window (doesn't work on firefox)
		pc.oniceconnectionstatechange = function() {
			if (pc.iceConnectionState == "disconnected") {
				stop();
			}
		}
		
		//Create and return the RTC connection
		rtcConnection.call = function() {
			socket.emit("call", from, to);
		};
		
		rtcConnection.answer = function() {
			start(true);
		};
		
		rtcConnection.disconnect = function() {
			sendSignal("stop");
			stop();
		};
		
		return rtcConnection;
	}
};

//A wrapper object containing simple functions to call other clients and answer incoming calls using WebRTC
rtcHelper = {
	pendingConnection: undefined, //An incoming RTC connection that has not yet been answered
	activeConnection: undefined, //An RTC connection where a call is currently ongoing
	id: undefined,
	socket: undefined,
	
	onIncomingCall: function(from, to) {
		if (to === rtcHelper.id) {
			//If multiple people are calling the same person at the same time, only the last call will show up
			if (rtcHelper.pendingConnection) {
				rtcHelper.pendingConnection.disconnect();
			}
			
			rtcHelper.pendingConnection = rtc.connect(to, from, rtcHelper.socket, $("#localVideo")[0], $("#remoteVideo")[0]);
			
			rtcHelper.pendingConnection.onCallStarted = function() {
				$(".rtcVideo").show();
			};
			
			rtcHelper.pendingConnection.onCallEnded = function() {
				rtcHelper.pendingConnection.onCallStarted = undefined;
				rtcHelper.pendingConnection.onCallEnded = undefined;
				rtcHelper.pendingConnection = undefined;
				$(".incomingCall").hide();
				
				if (!rtcHelper.activeConnection) {
					$("#hangUp").hide();
					$(".call").show();
				}
			};
			
			$("#hangUp").show();
			$(".incomingCall").show();
			$(".call").hide();
			$("#callerId").html(from.charAt(0).toUpperCase() + from.slice(1) + "-teamet ringer");
		}
	},
	
	answerIncomingCall: function() {
		//If no one is calling, do nothing
		if (!rtcHelper.pendingConnection) {
			return;
		}
		
		//End any ongoing calls
		if (rtcHelper.activeConnection) {
			rtcHelper.activeConnection.disconnect();
		}
		
		rtcHelper.pendingConnection.onCallEnded = function() {
			rtcHelper.activeConnection.onCallStarted = undefined;
			rtcHelper.activeConnection.onCallEnded = undefined;
			rtcHelper.activeConnection = undefined;
			$(".rtcVideo").hide();
			
			if (!rtcHelper.pendingConnection) {
				$("#hangUp").hide();
				$(".call").show();
			}
		};
		
		$(".incomingCall").hide();
		rtcHelper.pendingConnection.answer();
		rtcHelper.activeConnection = rtcHelper.pendingConnection;
		rtcHelper.pendingConnection = undefined;
	},
	
	call: function(to) {
		if (rtcHelper.pendingConnection) {
			rtcHelper.pendingConnection.disconnect();
		}
		
		if (rtcHelper.activeConnection) {
			rtcHelper.activeConnection.disconnect();
		}
		
		rtcHelper.pendingConnection = rtc.connect(rtcHelper.id, to, rtcHelper.socket, $("#localVideo")[0], $("#remoteVideo")[0]);
		rtcHelper.pendingConnection.call();
		$(".call").hide();
		$("#hangUp").show();
		
		rtcHelper.pendingConnection.onCallStarted = function() {
			rtcHelper.activeConnection = rtcHelper.pendingConnection;
			rtcHelper.pendingConnection = undefined;
			$(".rtcVideo").show();
			
			rtcHelper.activeConnection.onCallEnded = function() {
				rtcHelper.activeConnection.onCallStarted = undefined;
				rtcHelper.activeConnection.onCallEnded = undefined;
				rtcHelper.activeConnection = undefined;
				$(".rtcVideo").hide();
				
				if (!rtcHelper.pendingConnection) {
					$("#hangUp").hide();
					$(".call").show();
				}				
			};
		};
		
		rtcHelper.pendingConnection.onCallEnded = function() {
			rtcHelper.pendingConnection.onCallStarted = undefined;
			rtcHelper.pendingConnection.onCallEnded = undefined;
			rtcHelper.pendingConnection = undefined;
			$("#hangUp").hide();
			$(".call").show();			
		};
	},
	
	hangUp: function() {
		if (rtcHelper.pendingConnection) {
			rtcHelper.pendingConnection.disconnect();
		}
		else if (rtcHelper.activeConnection) {
			rtcHelper.activeConnection.disconnect();
		}
	}
};

module.exports = rtc;