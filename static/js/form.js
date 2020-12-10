// addNginxFancyIndexForm.js
// Add a small form to filter through the output of Nginx FancyIndex page
// © 2017, Lilian Besson (Naereen) and contributors,
// open-sourced under the MIT License, https://lbesson.mit-license.org/
// hosted on GitHub, https://GitHub.com/Naereen/Nginx-Fancyindex-Theme
var form = document.createElement('form');
var input = document.createElement('input');
form.className = 'form';
form.setAttribute('onsubmit', "event.preventDefault();");
input.name = 'filter';
input.id = 'search';
input.style = 'border-bottom-right-radius: 0; border-bottom-left-radius: 0;'
input.placeholder = 'Type to search...';
input.className = 'form-control text-light bg-dark';
form.appendChild(input);


document.getElementById('search_bar').appendChild(form);

window.nginxListItems = [].slice.call(document.querySelectorAll('#list tbody tr'));

input.addEventListener('keyup', function () {
    var i,
        e = "^(?=.*\\b" + this.value.trim().split(/\s+/).join("\\b)(?=.*\\b") + ").*$",
        n = RegExp(e, "i");
    window.nginxListItems.forEach(function(item) {
        item.removeAttribute('hidden');
    });
    window.nginxListItems.filter(function(item) {
        i = item.querySelector('td').textContent.replace(/\s+/g, " ");
        return !n.test(i);
    }).forEach(function(item) {
  	    item.hidden = true;
    });
});
