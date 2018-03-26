var SidebarRight = function ( editor ) {

	var container = new UI.Panel();
	container.setId( 'sidebar_right' );
	container.dom.style.zIndex = '4';

	editor.sidebar_right = container;

	let titleValence = new UI.Text( 'Valence' );
	titleValence.addClass( 'h4' );
	titleValence.setTextAlign('center');
	titleValence.setColor( 'whitesmoke' );
	titleValence.setWidth( '200px' );
	titleValence.setBackgroundColor( 'blueviolet' );
	container.add( titleValence );

	var valenceView = new UI.Div();
	valenceView.setId( 'valenceView' );
	valenceView.dom.style.textAlign = 'center';
	valenceView.dom.style.padding = '5px';

	var valenceImg = document.createElement( "img" );
	valenceImg.src = './asset/valence_new/5.png';
	valenceImg.style.verticalAlign = 'middle';
	valenceView.dom.appendChild( valenceImg );

	var valenceText = new UI.Div();
	valenceText.setId( 'valenceText' );
	valenceText.setWidth( '20px' );
	valenceText.setHeight( '20px' );
	valenceText.setTextContent( '5' );
	valenceText.setBackgroundColor('yellow');
	valenceText.setMargin('5px');
	valenceText.setMarginLeft('90px');
	valenceText.setTextAlign('center');
	valenceText.dom.style.borderRadius = '10px';

	var valenceSlider = new UI.Div();
	valenceSlider.setId( 'valenceSlider' );

	container.add( valenceView );
	container.add( valenceText );
	container.add( valenceSlider );

	let titleArousal = new UI.Text( 'Arousal' );
	titleArousal.addClass( 'h4' );
	titleArousal.setTextAlign('center');
	titleArousal.setColor( 'whitesmoke' );
	titleArousal.setMarginTop( '15px' );
	titleArousal.setWidth( '200px' );
	titleArousal.setBackgroundColor( 'blueviolet' );
	container.add( titleArousal );

	var heartView = new UI.Div();
	heartView.setId( 'heartView' );
	heartView.setClass( 'heart animated' );

	var heartValueText = new UI.Div();
	heartValueText.setId( 'heartValueText' );
	heartValueText.setWidth( '40px' );
	heartValueText.setHeight( '20px' );
	heartValueText.setTextContent( '70' );
	heartValueText.setBackgroundColor('red');
	heartValueText.setMargin('5px');
	heartValueText.setMarginLeft('80px');
	heartValueText.setTextAlign('center');
	heartValueText.dom.style.borderRadius = '15px';

	var heartSlider = new UI.Div();
	heartSlider.setId( 'heartSlider' );

	container.add( heartView );
	container.add( heartValueText );
	container.add( heartSlider );

	editor.msgInputArousal = 70;

	$( function () {

		let heart = document.getElementsByClassName( 'heart' )[ 0 ];

		$( "#heartSlider" ).slider( {
			value: 70,
			min: 50,
			max: 90,
			slide: function ( event, ui ) {
				editor.msgInputArousal = Number( ui.value );

				$( heartValueText.dom ).text( ui.value );
				let val = -15 * ui.value + 2100;
				heart.style.animation = val + 'ms pulsate infinite alternate ease-in-out';

				if( editor.emotionCMDManager.currentNodeSession !== null && editor.emotionCMDManager.currentNodeSession.triggerNode !== null ) {
					editor.emotionCMDManager.currentNodeSession.triggerNode.arousal.setArg( ui.value );
				}
			}
		} );

		$( "#valenceSlider" ).slider( {
			value: 5,
			min: 1,
			max: 9,
			slide: function ( event, ui ) {
				editor.msgInputValence = Number( ui.value );

				$( valenceText.dom ).text( ui.value );
				let res = ui.value;
				valenceImg.src = './asset/valence_new/' + res + '.png';

				if( editor.emotionCMDManager.currentNodeSession !== null && editor.emotionCMDManager.currentNodeSession.triggerNode !== null ) {
					editor.emotionCMDManager.currentNodeSession.triggerNode.valence.setArg( ui.value );
				}
			}
		} );
	} );

	editor.signals.updateRecommendation.add( function ( valence_level ) {
		if ( editor.usageMode === 0 ) {

			let valence = null;
			if( valence_level['happy']+0.2>valence_level['sad'] ) {
				valence = Math.floor( valence_level['happy']*4 ) + 5;
			}
			else {
				valence = Math.floor( valence_level['sad']*4 ) + 1;
			}

			$( valenceText.dom ).text( valence );
			$( "#valenceSlider" ).slider( 'value', valence );
			valenceImg.src = './asset/valence_new/' + valence + '.png';
		}
		else {
			let valence = null;
			if( valence_level['happy']+0.2>valence_level['sad'] ) {
				valence = Math.floor( valence_level['happy']*4 ) + 5;
			}
			else {
				valence = Math.floor( valence_level['sad']*4 ) + 1;
			}

			$( valenceText.dom ).text( valence );
			$( "#valenceSlider" ).slider( 'value', valence );
			valenceImg.src = './asset/valence_new/' + valence + '.png';

			if( editor.emotionCMDManager.currentNodeSession !== null && editor.emotionCMDManager.currentNodeSession.triggerNode !== null ) {
				editor.emotionCMDManager.currentNodeSession.triggerNode.valence.setArg( valence );
			}
		}
	} );

	return container;
};