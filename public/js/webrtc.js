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
				
rtc = {
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
		
		var sendSignal = function(signal) {
			console.log("Sending RTC signal: " + JSON.stringify(signal));
			socket.emit("signal", signal, from, to);
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
			
			socket.removeAllListeners("signal");
		};
		
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
		
		socket.removeAllListeners("signal");
		
		socket.on("signal", function(signal, sender, receiver) {
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
		});
		
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