/*jshint esversion: 6 */

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

function updateCrumbs () {
	window.document.title = "Files: " + decodeURI( window.location.pathname );
	setTimeout( function () {
		var loc = window.location.pathname;
		var link;
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
}

function navigate ( event ) {
	if ( event.target.nodeName == 'A' && event.target.href.endsWith( '/' ) ) {
		event.preventDefault();
		swapPage( event.target.href, event );
	}
}

function swapPage ( href, event = undefined ) {
	fetch( href )
		.then( response => response.text() )
		.then( data => {
			var target = document.getElementById( 'list' );
			var doc = document.implementation.createHTMLDocument();
			doc.documentElement.innerHTML = data;
			target.innerHTML = doc.getElementById( 'list' ).innerHTML;
			if ( event ) {
				var title = event.target.innerHTML;
				history.pushState( {
					page: title
				}, title, event.target.href );
			}
			document.getElementById( 'search' ).value = '';
			updateCrumbs();
			table_row_link_class();
		} );
}

function table_row_link_class () {
	document.getElementById( 'list' ).className = 'table table-hover table-dark';
	var headers = document.getElementsByTagName( 'th' );
	var i;
	for ( i = 0; i < headers.length; i++ ) {
		headers[ i ].scope = "col";
	}
	var files = document.getElementById( 'list' ).getElementsByTagName( 'tbody' )[ 0 ].getElementsByTagName( 'a' );
	for ( i = 0; i < files.length; i++ ) {
		if ( "classList" in files[ i ] ) files[ i ].classList.add( "text-info" );
		else {
			files[ i ].className = files[ i ].className.split( " " ).concat( "text-info" ).join( " " );
		}
	}
}
addEvent( window, 'popstate', e => {
	swapPage( window.location.pathname );
} );
addEvent( window, 'DOMContentLoaded', e => {
	updateCrumbs();
	table_row_link_class();
	var form = document.createElement( 'form' );
	var input = document.createElement( 'input' );
	form.className = 'form';
	form.setAttribute( 'onsubmit', "event.preventDefault();" );
	input.name = 'filter';
	input.id = 'search';
	input.style = 'border-bottom-right-radius: 0; border-bottom-left-radius: 0;';
	input.placeholder = 'Type to search...';
	input.className = 'form-control text-light bg-dark';
	form.appendChild( input );
	document.getElementById( 'search_bar' ).appendChild( form );
	input.addEventListener( 'keyup', function () {
		var i,
			e = "^(?=.*\\b" + this.value.trim().split( /\s+/ ).join( "\\b)(?=.*\\b" ) + ").*$",
			n = RegExp( e, "i" );
		Array.prototype.filter.call(
			document.querySelectorAll( '#list tbody tr' ),
			function ( item ) {
				item.removeAttribute( 'hidden' )
				i = item.querySelector( 'td' ).textContent.replace( /\s+/g, " " );
				return !n.test( i );
			}
		).forEach( function ( item ) {
			item.hidden = true;
		} );
	} );
} );