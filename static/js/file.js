/* jshint esversion: 6
 *
 * File Browser for nginx-fancyindex
 * Copyright (C) 2021  Ahmad Hasan Mubashshir <ahmubashshir@gmail.com>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 */

"use strict";

/* @global */
var fetchQueue = Array();

/*
 * addEvent Factory
 *
 * @returns {function}
 */
const addEvent = ( function () {
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


/**
 * Update breadcrumb with current path
 *
 * @param {HTMLDocument} doc - HTMLDocument to work on
 * @param {string} [path=location.pathname] - Path of the HTMLDocument
 */
const updateCrumbs = function ( doc = document, path = location.pathname ) {
	let breadcrumb = doc.getElementById( 'breadcrumbs' );

	if ( path.endsWith( "/" ) )
		doc.title = "Files: " + decodeURI( path );
	else
		doc.title = "View: " + decodeURI( path );

	if ( breadcrumb ) {
		let link, crumb;
		let segments = path.split( '/' );
		let breadcrumbs = '';
		let currentPath = '/';
		if ( segments[ segments.length - 1 ] == "" ) {
			segments.splice( segments.length - 1, segments.length );
		}

		// Initialize breadcrumb as path bar
		for ( var i = 0; i < segments.length; i++ ) {
			crumb = doc.createElement( 'li' );
			crumb.classList.add( "breadcrumb-item" )
			if ( i == 0 ) {
				crumb.append( "Root" );
				breadcrumbs += crumb.outerHTML;
			} else if ( i > 0 ) {
				currentPath += segments[ i ] + '/';
				if ( i < segments.length - 1 ) {
					link = doc.createElement( 'a' );
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
		const spinner = doc.getElementById( 'loading-spinner' );
		spinner.style.display = "none";
	}
}

/**
 * Handle navigate event in background
 *
 * Set spinner as visible and call {@link swapPage}
 * with {@link event.target.href} and {@link event}
 *
 * @param {event} event - {@a onclick} event
 */
const navigate = function ( event ) {
	if ( event.target.nodeName == 'A' ) {
		if ( event.target.href.endsWith( '/' ) ) {
			event.preventDefault();
		}
	}

	if ( event.defaultPrevented ) {
		abortAll( fetchQueue );

		const spinner = document.getElementById( 'loading-spinner' );
		spinner.style.display = "";
		swapPage( event.target.href, event );
	}
}

/**
 * Find element by 'id' then connect callback() to 'event'
 *
 * @param {string} id - Element ID
 * @param {string} event - Event name
 * @param {function} callback - Event Handler
 */
const connectEventById = function ( id = undefined, event = undefined, callback = undefined ) {
	let elem;
	if ( id && event && callback )
		elem = document.getElementById( id );
	if ( elem )
		addEvent( elem, event, callback );
}

/**
 * Return an AbortController
 *
 * @returns {AbortController}
 */
const fetchTask = function () {
	let task = new AbortController();
	fetchQueue.push( task );
	task.signal.onabort = task => {
		fetchQueue.pop( fetchQueue.indexOf( task ) );
	}
	return task;
}

/**
 * Abort all queued task with AbortController collection
 *
 * @param {Array} queue - Array containing AbortControllers
 */
const abortAll = function ( queue ) {
	while ( queue.length > 0 ) {
		queue.at( 0 ).abort()
	}
}

/**
 * Sleep for ms miliseconds then do something
 * @param {int} ms - Time to sleep in ms
 */
function sleep( ms ) {
	return new Promise( resolve => setTimeout( resolve, ms ) );
}
/**
 * Load 'href' offscreen, build dom from 'href' then replace current dom
 *
 * @param {string} href - Requested page
 * @param {event} [event=undefined] - Event that called this method
 */
const swapPage = function ( href, event = undefined ) {
	let task = fetchTask();

	fetch( href, {
			signal: task.signal
		} )
		.then( response => response.text() )
		.then( data => {
			// Load the document off-screen
			let doc = document.implementation.createHTMLDocument();
			doc.documentElement.innerHTML = data;

			if ( event ) {
				let path = event.target.pathname;
				if ( path.endsWith( "/" ) )
					doc.title = "Files: " + decodeURI( path );
				else
					doc.title = "View: " + decodeURI( path );

				history.pushState( {
					page: doc.title
				}, doc.title, href );
			}
			updateCrumbs( doc, event ? event.target.pathname : window.location.pathname );

			let searchBox = doc.getElementById( 'searchBox' );
			if ( searchBox ) {
				initSearchBox( searchBox, doc );
				doc.getElementById( 'search' ).value = '';
			}

			let list = doc.getElementById( 'list' );
			if ( list ) tableRowSetupClass( list, doc, href, task );
			return doc.documentElement.innerHTML;
		} )
		.catch( () => {
			console.log( "Canceled navigation: " + href );
		} )
		.finally( ( innerHTML ) => {
			fetchQueue.pop( fetchQueue.indexOf( task ) );
		} )
		.then( innerHTML => {
			if ( !task.signal.aborted ) {
				// Render the document
				document.documentElement.innerHTML = innerHTML;
				// Connect events
				connectEventById( 'search', 'keyup', searchFile );
				connectEventById( 'breadcrumbs', 'click', navigate );
				connectEventById( 'list', 'click', navigate );
				connectEventById( 'searchForm', 'submit', event => {
					event.preventDefault();
				} );
				// scroll to top
				document.body.scrollTop = 0;
				document.documentElement.scrollTop = 0;
			}
		} );
}

/**
 * Set style class for table rows and remove rows specified in '.hidden'
 *
 * @param {HTMLElement} list - An html table
 * @param {document} [doc=document] - HTMLDocument to work on
 * @param {string} [href=location.href] - Url to fetch '.hidden' from
 * @param {AbortController} r - Abort this task
 */
const tableRowSetupClass = function ( list, doc, href, task ) {
	doc = doc || document;
	href = href || location.href;

	// Set table class
	list.className = 'table table-hover table-dark';
	let headers = doc.getElementsByTagName( 'th' );
	let i;
	for ( i = 0; i < headers.length; i++ ) {
		headers[ i ].scope = "col";
	}

	let files = list.getElementsByTagName( 'tbody' )[ 0 ].getElementsByTagName( 'a' );

	// Delete rows specified in '.hidden'
	fetch( href + '.hidden', {
			signal: task.signal
		} )
		.then( response => {
			if ( !response.ok ) {
				throw new Error( 'Fetch failed' );
			}
			return response.text()
		} )
		.then(
			data =>
			data.trim()
			.split( /\r?\n/ )
			.filter(
				str => str.trim().length > 0
			)
		)
		.then( hidden => {
			Array.from( files )
				.forEach( file => {
					if ( hidden.includes( file.title ) ) {
						file.parentElement
							.parentElement
							.parentElement
							.removeChild(
								file.parentElement
								.parentElement
							)
					}
				} );
		} )
		.catch( () => {
			undefined;
		} );
	Array.from( files )
		.forEach(
			file => {
				if ( "classList" in file ) file.classList.add( "text-info" );
				else {
					file.className = file.className.split( " " ).concat( "text-info" ).join( " " );
				}
			}
		)
}


/**
 * Filter File list by name
 *
 * @callback searchFile
 */
const searchFile = function () {
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
}

/**
 * Initialize the search box
 *
 * @param {HTMLElement} elem - HTMLElement to create Search Box on.
 * @param {HTMLDocument} [doc=document] - HTMLDocument that contains {@link initSearchBox#elem}
 */
const initSearchBox = function ( elem, doc = document ) {

	let form = doc.createElement( 'form' );
	let input = doc.createElement( 'input' );

	form.className = 'form';
	form.id = 'searchForm';

	input.name = 'filter';
	input.id = 'search';
	input.style = 'border-bottom-right-radius: 0; border-bottom-left-radius: 0;';
	input.placeholder = 'Type to search...';
	input.className = 'form-control text-light bg-dark';

	form.appendChild( input );
	elem.appendChild( form );
}

addEvent( window, 'popstate', e => {
	abortAll( fetchQueue );
	const spinner = document.getElementById( 'loading-spinner' );

	spinner.style.display = "";
	swapPage( e.target.location.href );
} );

addEvent( window, 'DOMContentLoaded', () => {
	updateCrumbs();

	let list = document.getElementById( 'list' );
	if ( list ) tableRowSetupClass( list, undefined, undefined, fetchTask() );

	let searchBox = document.getElementById( 'searchBox' );
	if ( searchBox ) initSearchBox( searchBox );

	connectEventById( 'search', 'keyup', searchFile );
	connectEventById( 'breadcrumbs', 'click', navigate );
	connectEventById( 'list', 'click', navigate );
	connectEventById( 'searchForm', 'submit', event => {
		event.preventDefault();
	} );
} );
