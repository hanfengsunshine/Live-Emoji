/**
 * @author mrdoob / http://mrdoob.com/
 */

Menubar.Tool = function ( editor ) {
	let container = new UI.Panel();
	container.setClass( 'menu' );

	let title = new UI.Panel();
	title.setClass( 'title' );
	title.setTextContent( 'Tool' );
	title.addClass( 'h4' );
	container.add( title );

	let options = new UI.Panel();
	options.setClass( 'options' );
	container.add( options );

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Reset' );
	option.onClick( function () {
		if ( editor.selected !== null ) {
			editor.selected.position.x = 0;
			editor.selected.position.y = 0;
		}

		if ( editor.backgroundSprite !== null ) {
			editor.backgroundSprite.position.x = 0;
			editor.backgroundSprite.position.y = 0;
		}

		let particles = editor.protonPixi4Renderer.proton.getAllParticles();
		let len = particles.length;
		for ( let i = 0; i < len; ++i ) particles[ i ].dead = true;
	} );
	options.add( option );

	// Background

	let form = document.createElement( 'form' );
	form.style.display = 'none';
	document.body.appendChild( form );

	let fileInput = document.createElement( 'input' );
	fileInput.type = 'file';
	fileInput.addEventListener( 'change', function ( event ) {

		editor.loader.loadFile( fileInput.files[ 0 ] );
		form.reset();

	} );
	form.appendChild( fileInput );

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Background' );
	option.onClick( function () {

		fileInput.click();

	} );
	options.add( option );

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Download Arousal' );
	option.onClick( function () {

		let rows = editor.allArousals;
		let csvContent = "data:text/csv;charset=utf-8,";
		rows.forEach( function ( rowArray ) {
			// let row = rowArray.join( "," );
			csvContent += rowArray + "\r\n";
		} );

		let encodedUri = encodeURI( csvContent );
		let link = document.createElement( "a" );
		link.setAttribute( "href", encodedUri );
		link.setAttribute( "download", "my_data.csv" );
		document.body.appendChild( link );

		link.click();

	} );
	options.add( option );

	return container;

};
