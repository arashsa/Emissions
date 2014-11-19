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
					{url: 'turn:numb.viagenie.ca', credential: 'muazkh', username: 'webrtc@live.com'},
					{url: 'turn:192.158.29.39:3478?transport=udp', credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=', username: '28224511:1379330808'},
					{url: 'turn:192.158.29.39:3478?transport=tcp', credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=', username: '28224511:1379330808'}
				];
				
rtc = {
	call: undefined,
	
	//Initializes an RTC connection between two clients
	connect: function(from, to, socket, localVideo, remoteVideo) {
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
				attachMediaStream(remoteVideo, event.stream);
			};
			
			pc.onremovestream = function(event) {
				remoteVideo.src = undefined;
			};
		}
		catch(e) {
			printError(e);
		}

		//Starts the RTC call
		var start = function(isCaller) {
			getUserMedia({"audio": true, "video": true}, function(stream) {
				attachMediaStream(localVideo, stream);
				pc.addStream(stream);
				
				var setDescription = function(description) {
					pc.setLocalDescription(description, function() {
						sendSignal(description);
					}, printError);
				};
				
				if (isCaller) {
					pc.createOffer(setDescription, printError, sdpConstraints);
				}
				else {
					pc.createAnswer(setDescription, printError, sdpConstraints);
				}
			}, printError);		
		};
		
		socket.on("signal", function(signal, sender, receiver) {
			if (signal.sdp) {
				pc.setRemoteDescription(new RTCSessionDescription(signal), function() {
					if (signal.type === "offer") {
						//Answer the call
						start(false);
					}
				}, printError);
			}
			else if (signal.candidate) {
				pc.addIceCandidate(new RTCIceCandidate(signal), function() { 
					//Success callback for addIceCandidate
				}, printError);
			}
		});
		
		rtc.call = function() {
			start(true);
		};
	}
};