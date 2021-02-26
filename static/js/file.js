/*jshint esversion: 6 */
"use strict";

var req = undefined;

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
	let breadcrumb = document.getElementById( 'breadcrumbs' );
	let path = window.location.pathname;
	if ( path.endsWith( "/" ) )
		window.document.title = "Files: " + decodeURI( path );
	else
		window.document.title = "View: " + decodeURI( path );

	if ( breadcrumb ) {
		setTimeout( function () {
			let loc = window.location.pathname;
			let link, crumb;
			let segments = loc.split( '/' );
			let breadcrumbs = '';
			let currentPath = '/';
			if ( segments[ segments.length - 1 ] == "" ) {
				segments.splice( segments.length - 1, segments.length );
			}

			for ( var i = 0; i < segments.length; i++ ) {
				crumb = document.createElement( 'li' );
				crumb.classList.add( "breadcrumb-item" )
				if ( i == 0 ) {
					crumb.append( "Root" );
					breadcrumbs += crumb.outerHTML;
				} else if ( i > 0 ) {
					currentPath += segments[ i ] + '/';
					if ( i < segments.length - 1 ) {
						link = document.createElement( 'a' );
						link.href = currentPath;
						link.text = decodeURIComponent( segments[ i ] );
					} else {
						link = decodeURIComponent( segments[ i ] );
					}
					if ( i == segments.length - 1 ) {
						crumb.classList.add( 'active', 'fg-active' )
					}
					crumb.append( link );
					breadcrumbs += crumb.outerHTML;
				}
			}
			breadcrumb.innerHTML = breadcrumbs;
			const spinner = document.getElementById( 'loading-spinner' );
			spinner.style.display = "none";
			addEvent( breadcrumb, 'click', navigate );
		}, 500 );
	}
}

function navigate ( event ) {
	console.log( event.target.href );
	if ( event.target.nodeName == 'A' ) {
		if ( event.target.href.endsWith( '/' ) ) {
			event.preventDefault();
		}
	}

	if ( event.defaultPrevented ) {
		if ( req ) req.abort();

		const spinner = document.getElementById( 'loading-spinner' );
		spinner.style.display = "";
		swapPage( event.target.href, event );
	}
}

function swapPage ( href, event = undefined ) {
	req = new AbortController();
	fetch( href, {
			signal: req.signal
		} )
		.then( response => response.text() )
		.then( data => {
			document.documentElement.innerHTML = data;

			updateCrumbs();

			if ( event ) {
				let title = event.target.innerHTML;
				let path = event.target.pathname;
				if ( path.endsWith( "/" ) )
					window.document.title = "Files: " + decodeURI( path );
				else
					window.document.title = "View: " + decodeURI( path );

				history.pushState( {
					page: title
				}, title, href );
			}

			let search_bar = document.getElementById( 'search_bar' );
			if ( search_bar ) {
				setup_search_bar( search_bar );
				document.getElementById( 'search' ).value = '';
			}

			let list = document.getElementById( 'list' );
			if ( list ) table_row_link_class( list );

			// scroll to top
			document.body.scrollTop = 0;
			document.documentElement.scrollTop = 0;
			req = undefined;
		} )
		.catch( err => {
			console.log( "Canceled navigation: " + href );
			console.log( err );
			req = undefined;
		} );
}

function table_row_link_class ( list ) {
	list.className = 'table table-hover table-dark';
	let headers = document.getElementsByTagName( 'th' );
	let i;
	for ( i = 0; i < headers.length; i++ ) {
		headers[ i ].scope = "col";
	}
	let files = list.getElementsByTagName( 'tbody' )[ 0 ].getElementsByTagName( 'a' );
	for ( i = 0; i < files.length; i++ ) {
		if ( "classList" in files[ i ] ) files[ i ].classList.add( "text-info" );
		else {
			files[ i ].className = files[ i ].className.split( " " ).concat( "text-info" ).join( " " );
		}
	}
	addEvent( list, 'click', navigate );
}

function setup_search_bar ( elem ) {
	let form = document.createElement( 'form' );
	let input = document.createElement( 'input' );
	form.className = 'form';
	form.setAttribute( 'onsubmit', "event.preventDefault();" );
	input.name = 'filter';
	input.id = 'search';
	input.style = 'border-bottom-right-radius: 0; border-bottom-left-radius: 0;';
	input.placeholder = 'Type to search...';
	input.className = 'form-control text-light bg-dark';
	form.appendChild( input );
	elem.appendChild( form );
	addEvent( input, 'keyup', function () {
		let i,
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
}

addEvent( window, 'popstate', e => {
	swapPage( window.location.pathname );
} );

addEvent( window, 'DOMContentLoaded', e => {

	updateCrumbs();

	let list = document.getElementById( 'list' );
	if ( list ) table_row_link_class( list );

	let search_bar = document.getElementById( 'search_bar' );
	if ( search_bar ) setup_search_bar( search_bar );
} );