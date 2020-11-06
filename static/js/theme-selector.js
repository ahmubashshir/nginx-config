 // function to set a given theme/color-scheme
import('./misc.js');
function theme(){
	return (window.hasOwnProperty('themecookie'))?window[themecookie]:'theme';
}
function setTheme(themeName) {
	setLTCookie(theme(), themeName);
	if ( window.themes == undefined )
		return;
	if ( window.themes instanceof Object && window.themes.hasOwnProperty(themeName) )
		document.getElementById(window.themestyle).href = window.themes[themeName];

}

// function to toggle between light and dark theme
function toggleTheme() {
	if (getCookie(theme()) === 'dark') {
		setTheme('light');
	} else {
		setTheme('dark');
	}
}
// Immediately invoked function to set the theme on initial load
(function () {
	if (getCookie(theme()) === 'dark') {
		setTheme('dark');
		document.getElementById('slider').checked = false;
	} else {
		setTheme('light');
	  	document.getElementById('slider').checked = true;
	}
})();
