/* jshint esversion: 6
 *
 * Dark/Light Theme toggle
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

// function to set a given theme/color-scheme
import( './misc.js' );

function theme() {
	return ( window.hasOwnProperty( 'themecookie' ) ) ? window[ themecookie ] : 'theme';
}

function setTheme( themeName ) {
	setLTCookie( theme(), themeName );
	if ( window.themes == undefined )
		return;
	if ( window.themes instanceof Object && window.themes.hasOwnProperty( themeName ) )
		document.getElementById( window.themestyle ).href = window.themes[ themeName ];

}

// function to toggle between light and dark theme
function toggleTheme() {
	if ( getCookie( theme() ) === 'dark' ) {
		setTheme( 'light' );
	} else {
		setTheme( 'dark' );
	}
}
// Immediately invoked function to set the theme on initial load
( function () {
	if ( getCookie( theme() ) === 'dark' ) {
		setTheme( 'dark' );
		document.getElementById( 'slider' ).checked = false;
	} else {
		setTheme( 'light' );
		document.getElementById( 'slider' ).checked = true;
	}
} )();
