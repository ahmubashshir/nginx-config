//import( "/static/js/misc.js" );
wavesurfer = WaveSurfer.create( {
	container: "#waveform",
	waveColor: "#98a5a3",
	progressColor: "#61c2b0",
	cursorColor: "#82b0a9",
	forceDecode: true,
	hideScrollbar: true,
	partialRender: true,
	responsive: true,
	scrollParent: true,
	plugins: [ WaveSurfer.cursor.create() ]
} );
document.addEventListener( 'DOMContentLoaded', function () {
	wavesurfer[ "scale" ] = 1;
	wavesurfer.load( location.pathname );
	wavesurfer.on( "play", function () {
		document.getElementById( "playPause" ).className = "buttonbox fa fa-pause";
	} );
	wavesurfer.on( "pause", function () {
		document.getElementById( "playPause" ).className = "buttonbox fa fa-play";
	} );
	wavesurfer.on( "mute", function ( bool ) {
		var elem = document.getElementById( "volume-toggle" );
		var vol = document.getElementById( "volume-slider" ).value;
		if ( bool ) {
			elem.className = "buttonbox buttonbox-right fa fa-volume-off";
		} else {
			elem.className = "buttonbox buttonbox-right fa fa-volume-" + (( (vol*wavesurfer.scale)/100 <= 50 * wavesurfer.scale ) ? "down" : "up" );
		}
		console.log( (vol*wavesurfer.scale)/100 + " " + 50 * wavesurfer.scale);
	} );

	wavesurfer.on( "volume", function ( i ) {
		vol = parseInt( i / wavesurfer.scale * 100 );
		elems = [ "volume-toggle", "volume-view" ]
		for ( n in elems ) {
			var e = document.getElementById( elems[ n ] );
			if ( !wavesurfer.getMute() ) {
				e.className = (elems[n]==="volume-toggle")?"buttonbox buttonbox-right ":"";
				if ( vol <= 50 ) {
					e.className += "fa fa-volume-" + ( ( vol ) ? "down" : "off" );
				} else {
					e.className += "fa fa-volume-up";
				}
			}
		}
		console.log(vol);
		vol = (vol<=100)?vol:document.getElementById( "volume-slider" ).value;
		document.getElementById( "volume-label" ).textContent = vol.toString().padStart( 3, '\xa0' ) + "%";
		setCookie( "wavesurfer-volume", vol, 366 * 30 );
	} );

	wavesurfer.on( 'ready', function () {
		wavesurfer.play();
	} );
	wavesurfer.on( 'error', function ( e ) {
		console.warn( e );
	} );

	elem = document.getElementById( "volume-slider" );
	if ( getParam( "scale" ) ) {
		setCookie( "wavesurfer-volume-scale", parseFloat( getParam( "scale" ) ), 366 * 30 );
	}
	if ( getCookie( "wavesurfer-volume-scale" ) ) {
		wavesurfer[ "scale" ] = parseFloat( getCookie( "wavesurfer-volume-scale" ) );
	}
	if ( getParam( "vol" ) ) {
		if ( parseInt( getParam( "vol" ) ) <= 100 ) {
			setCookie( "wavesurfer-volume", parseInt( getParam( "vol" ) ), 366 * 30 );
		} else {
			if ( !getCookie( "wavesurfer-volume" ) ) {
				setCookie( "wavesurfer-volume", 50, 366 * 30 );
			}
		}
	}
	elem.value = parseInt( getCookie( "wavesurfer-volume" ) ) || 50;
	wavesurfer.setVolume( ( elem.value * wavesurfer.scale ) / 100 );
	delete elem;
} );
