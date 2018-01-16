/**
 * @author mrdoob / http://mrdoob.com/
 */


Sidebar.Project = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setBorderTop( '0' );
	container.setPaddingTop( '20px' );

	var overlayedPanel = new UI.Panel();
	overlayedPanel.setWidth( '250px' );
	overlayedPanel.setHeight( '200px' );

	container.add( overlayedPanel );

	// Webcam

	var videoStream = new UI.Video();
	videoStream.setPosition( 'absolute' );
	videoStream.setId( 'videoStream' );
	videoStream.dom.width = 250;
	videoStream.dom.height = 200;
	// vid.setControls( true );
	videoStream.setPreload( 'auto' );
	videoStream.setLoop( true );
	videoStream.setPlaysinline( true );
	videoStream.setAutoplay( true );
	var videoStreamWidth = videoStream.dom.width;
	var videoStreamHeight = videoStream.dom.height;

	overlayedPanel.add( videoStream );

	var videoStreamOverlay = new UI.Canvas();
	videoStreamOverlay.setPosition( 'absolute' );
	videoStreamOverlay.setId( 'videoStreamOverlay' );
	videoStreamOverlay.dom.width = 250;
	videoStreamOverlay.dom.height = 200;

	overlayedPanel.add( videoStreamOverlay );

	var startButton = new UI.Button( 'Start' );
	startButton.setValue( 'wait, loading video' );
	startButton.setId( 'startButton' );
	startButton.setType( 'button' );
	startButton.setDisabled( 'disabled' );

	$( startButton.dom ).click(function(){
		startVideo();
	});

	container.add( startButton );

	var videoStreamOverlayContext = videoStreamOverlay.getContext( '2d' );

	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
	window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;

	var trackingStarted = false;

	function GetUserMediaSuccess( stream ) {
	  if ("srcObject" in videoStream.dom) {
	    videoStream.dom.srcObject = stream;
	  } else {
	    videoStream.dom.src = ( window.URL && window.URL.createObjectURL( stream ) );
	  }

		function adjustVideoProportions() {
		  var proportion = videoStream.dom.videoWidth / videoStream.dom.videoHeight;
		  videoStreamWidth = Math.round(videoStreamHeight * proportion);
		  videoStream.dom.width = videoStreamWidth;
		  videoStreamOverlay.dom.width = videoStreamWidth;
		}

	  videoStream.dom.onloadedmetadata = function() {
	    adjustVideoProportions();
	    videoStream.dom.play();
	  }

	  videoStream.dom.onresize = function() {
	    adjustVideoProportions();
	    if( trackingStarted ) {
	      ctrack.stop();
	      //htracker.stop();
	      ctrack.reset();
	      ctrack.start( videoStream.dom );
	      //htracker.start();
	    }
	  }
	}

	function GetUserMediaFail() {}

	if (navigator.mediaDevices) {
		navigator.mediaDevices.getUserMedia({video : true}).then(GetUserMediaSuccess).catch(GetUserMediaFail);
	} else if (navigator.getUserMedia) {
		navigator.getUserMedia({video : true}, GetUserMediaSuccess, GetUserMediaFail);
	} else {
		alert("Your browser does not seem to support getUserMedia, using a fallback video instead.");
	}

	videoStream.dom.addEventListener('canplay', function(){
		startButton.dom.value = "start";
		startButton.dom.disabled = null;
	}, false);


	/*********** setup of emotion detection *************/
	// set eigenvector 9 and 11 to not be regularized. This is to better detect motion of the eyebrows
	pModel.shapeModel.nonRegularizedVectors.push(9);
	pModel.shapeModel.nonRegularizedVectors.push(11);

	var ec = new emotionClassifier();
	ec.init( emotionModel );

	/*** Code for head tracking ***/
	// var htracker = new headtrackr.Tracker({calcAngles : true, ui : false});
	// htracker.init(videoStream.dom, videoStreamOverlay.dom);
	// htracker.start();

	// document.addEventListener("facetrackingEvent", function(event) {
	// 	//在这里可以对head的数据进行实时处理，x,y是头（脸）的位置(400 x 300)，width,height是头（脸）的像素长宽，angle是头（脸）的角度（正常情况下为90度，也就是pi/2，往左倾斜，变大）
	// 	var headInfo = "";
	// 	headInfo += "Face positon: [" + event.x + ", " + event.y + "]  ";
	// 	headInfo += "width and height: [" + event.width + ", " + event.height + "]  ";
	// 	headInfo += "angle: " + event.angle + "<br/>";
	// 	// console.log( headInfo );
	// });

	/*********** Code for face tracking *********/
	var ctrack = new clm.tracker( {searchWindow:11} );
	ctrack.init( pModel );
	ctrack.setResponseMode( "single", ["raw"] );

	function startVideo() {

		//按下按钮之后再开始tracking脸和头
		// start video
		videoStream.dom.play();
		// start tracking
		ctrack.start( videoStream.dom );
		//htracker.start();
		trackingStarted = true;
		// start loop to draw face and output messages
		drawLoop();
		positionLoop();

		FaceSignalLoop();
	}

	function FaceSignalLoop() {
		requestAnimFrame( FaceSignalLoop );

		for( var prop in FACE_INFORMATION ) {
			if( FACE_INFORMATION_PRE[prop] !== FACE_INFORMATION[prop] ) {

				FACE_TRIGGER.faceinfo = FACE_INFORMATION;
				signals.trigger.dispatch( FACE_TRIGGER );
			}
		}

		FACE_INFORMATION_PRE = ObjDeepCopy( FACE_INFORMATION );
	}

	/******Code for output positions of face feature points*************************/
	function positionLoop() {
		requestAnimFrame(positionLoop);

		var positions = ctrack.getCurrentPosition();//这个函数返回了检测到的所有特征点(70个)的在vid（400 x 300）中的位置，格式是：positions[i][j]代表第i个特征点的位置(j=0代表x，j=1代表y，注意原点在右上方)
		// var positionString = "";
		if( positions ) {
			//列了一些关键点的位置
			/********** Output key position ***********/
			// positionString += "left eye: ["+positions[32][0].toFixed(1)+","+positions[32][1].toFixed(1)+"] ";
			// positionString += "right eye: ["+positions[27][0].toFixed(1)+","+positions[27][1].toFixed(1)+"]<br/>";
			// positionString += "chin point: ["+positions[7][0].toFixed(1)+","+positions[7][1].toFixed(1)+"]<br/>";
			// positionString += "nose point: ["+positions[62][0].toFixed(1)+","+positions[62][1].toFixed(1)+"]<br/>";
			// positionString += "feature points of eyebrow: 15 - 18 -> left, 19 - 22 -> right" + "<br/>";
			// for (var p = 15;p < 23;p++) {
			// 	positionString += "featurepoint "+p+" : ["+positions[p][0].toFixed(1)+","+positions[p][1].toFixed(1)+"]<br/>";
			// }
			/********** decide whether the mouth is open ************/
			//这里用嘴的上下左右四个点来判断开合，参考https://github.com/douyamv/FaceTracker/blob/master/main.html
			var mousedist = positions[57][1] - positions[60][1];
			var mouthwidth = positions[50][0] - positions[44][0];
			// var mouthstate = "";
			if(mousedist>mouthwidth*0.2){
				// mouthstate = "open";
				FACE_INFORMATION['mouth'] = MOUTH_TYPE.OPEN;
			}
			else if(mousedist<mouthwidth*0.2){
				// mouthstate = "close";
				FACE_INFORMATION['mouth'] = MOUTH_TYPE.CLOSED;
			}
			else {
				// mouthstate = "uncertain";
				FACE_INFORMATION['mouth'] = MOUTH_TYPE.CLOSED;
			}

			//这里是嘴的四个关键点的位置，关注position[i][j]就好
			// positionString += "Mouth: " + mouthstate + "<br/>";
      //
			// positionString += "feature points of mouth:" + "<br/>";
			// positionString += "left: ["+positions[50][0].toFixed(1)+","+positions[50][1].toFixed(1)+"] ";
			// positionString += "right: ["+positions[44][0].toFixed(1)+","+positions[44][1].toFixed(1)+"]<br/>";
			// positionString += "top: ["+positions[60][0].toFixed(1)+","+positions[60][1].toFixed(1)+"] ";
			// positionString += "down: ["+positions[57][0].toFixed(1)+","+positions[57][1].toFixed(1)+"]<br/>";
		}

		var cp = ctrack.getCurrentParameters();//这个函数返回追踪到的parameter，用来预测情绪
		// var emotionvalue = "";
		var mostPossible = "";//the max possiblity of all emotions
		var temp0 = 0;//temp parameter for comparing possiblities
		var er = ec.meanPredict(cp); //预测情绪
		//er有两个属性，emotion是情绪名称，value是相应概率，er[0]~er[5]代表angry,disgusted,fear,sad,surprised,happy.
		/***meanPredict, show possibilities of all emotions***/
		for (i = 0; i < er.length;i++){
			// emotionvalue += er[i].emotion + ": " + (er[i].value * 100).toFixed(1) + "%<br/>";//e.g. disgusted: 15.1%
			if (temp0 < er[i].value){ //获取最高概率的情绪mostPossible
				temp0 = er[i].value;
				mostPossible = er[i].emotion;
			}
		}
		//显示相关信息，可忽略
		// console.log( positionString );
		// console.log( "Predicted emotions: " + mostPossible );
		// console.log( "Possibilities of all emotions: " + emotionvalue );

		switch( mostPossible ) {
			case 'happy':
				FACE_INFORMATION['emotion'] = EMOTION_TYPE.HAPPY;
				break;
			case 'sad':
				FACE_INFORMATION['emotion'] = EMOTION_TYPE.SAD;
				break;
			case 'surprised':
				FACE_INFORMATION['emotion'] = EMOTION_TYPE.SURPRISED;
				break;
			case 'angry':
				FACE_INFORMATION['emotion'] = EMOTION_TYPE.ANGRY;
				break;
			default:
				break;
		}
		// console.log( FACE_INFORMATION );
	}

	function drawLoop() {//画出人脸位置，就是那些绿色的线，用ctrack.draw在overlay这个canvas上画出来
		requestAnimFrame(drawLoop);
		videoStreamOverlayContext.clearRect(0, 0, videoStreamWidth, videoStreamHeight);
		//psrElement.innerHTML = "score :" + ctrack.getScore().toFixed(4);
		if (ctrack.getCurrentPosition()) {
			ctrack.draw(videoStreamOverlay.dom);
		}
	}

	return container;

};
