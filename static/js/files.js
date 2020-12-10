var addEvent = ( function () {
	if ( document.addEventListener ) {
		return function ( el, type, fn ) {
			if ( el && el.nodeName || el === window ) {
				el.addEventListener( type, fn, false );
			} else if ( el && el.length ) {
				for ( var i = 0; i < el.length; i++ ) {
					addEvent( el[ i ], type, fn );
				}
			}
		};
	} else {
		return function ( el, type, fn ) {
			if ( el && el.nodeName || el === window ) {
				el.attachEvent( 'on' + type, function () {
					return fn.call( el, window.event );
				} );
			} else if ( el && el.length ) {
				for ( var i = 0; i < el.length; i++ ) {
					addEvent( el[ i ], type, fn );
				}
			}
		};
	}
} )();
var updateCrumbs = function () {
	window.document.title = "Files: " + decodeURI( window.location.pathname );
	setTimeout( function () {
		var loc = window.location.pathname;
		var segments = loc.split( '/' );
		var breadcrumbs = '';
		var currentPath = '/';
		for ( var i = 0; i < segments.length; i++ ) {
			if ( segments[ i ] !== '' ) {
				currentPath += segments[ i ] + '/';
				if ( segments.length > i + 2 ) {
					link = '<a href="' + currentPath + '">' + decodeURIComponent( segments[ i ] ) + '<\/a>';
				} else {
					link = decodeURIComponent( segments[ i ] );
				}
				breadcrumbs += '<li class="breadcrumb-item' + ( ( segments.length == i + 2 ) ? ' active fg-active' : '' ) + '">' + link + '<\/li>';
			} else if ( segments.length - 1 !== i ) {
				currentPath += '';
				breadcrumbs += '<li class="breadcrumb-item">Root<\/li>';
			}
		}
		document.getElementById( 'breadcrumbs' ).innerHTML = breadcrumbs;
		addEvent( document.getElementById( 'list' ), 'click', navigate );
		addEvent( document.getElementById( 'breadcrumbs' ), 'click', navigate );
	}, 500 );
};
var intercept = function ( event ) {
	event.preventDefault();
}
var navigate = function ( event ) {
	if ( event.target.nodeName == 'A' && event.target.href.endsWith( '/' ) ) {
		event.preventDefault();
		swapPage( event.target.href, event );
	}
}
var swapPage = function ( href, event = undefined ) {
	fetch( href )
		.then( response => response.text() )
		.then( data => {
			var target = document.getElementById( 'list' );
			var doc = document.implementation.createHTMLDocument();
			doc.documentElement.innerHTML = data;
			target.innerHTML = doc.getElementById( 'list' ).innerHTML;
			delete doc;
			if ( event ) {
				var title = event.target.innerHTML;
				history.pushState( {
					page: title
				}, title, event.target.href );
			}
			window.nginxListItems = [].slice.call( document.querySelectorAll( '#list tbody tr' ) )
			updateCrumbs();
			table_row_link_class();
		} );
};

function table_row_link_class () {
	document.getElementById( 'list' ).className = 'table table-hover table-dark';
	headers = document.getElementsByTagName( 'th' );
	for ( var i = 0; i < headers.length; i++ ) {
		headers[ i ].scope = "col";
	}
	files = document.getElementById( 'list' ).getElementsByTagName( 'tbody' )[ 0 ].getElementsByTagName( 'a' );
	for ( var i = 0; i < files.length; i++ ) {
		if("classList" in files[ i ]) files[ i ].classList.add("text-info");
		else {
			files[ i ].className = c.className.split(" ").concat("text-info").join(" ");
		}
	}
}

addEvent( window, 'popstate', function ( e ) {
	swapPage( window.location.pathname );
} );
addEvent( window, 'load', function ( e ) {
	updateCrumbs();
	table_row_link_class();
} );
