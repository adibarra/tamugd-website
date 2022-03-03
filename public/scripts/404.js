document.addEventListener('DOMContentLoaded', () => {
    updateThemeMode();
    openOnClick('home_link1', '/home');
    openOnClick('home_link2', '/home');
    document.getElementById('thememode_toggle').addEventListener('click', () => {
        toggleThemeMode();
    });
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-HS51DZ5HEM');
});

function openOnClick(elementID, link) {
    document.getElementById(elementID).addEventListener('click', () => { window.location=link;});
}

function openTabOnClick(elementID, link) {
    document.getElementById(elementID).addEventListener('click', () => { window.open(link); });
}

// toggle-theme js to toggle between light and dark theme
function toggleThemeMode() {
    document.cookie = 'lightmode='+!document.cookie.includes('lightmode=true')+'; SameSite=Strict;';
    updateThemeMode();
}

function updateThemeMode() {
    var light_theme = document.cookie.includes('lightmode=true')
    if (light_theme && !document.body.classList.contains('light-theme')) {
        document.getElementById('thememode_toggle').innerHTML = '<i class="fa fa-sun-o" aria-hidden="true"></i>&nbsp;<i class="fa fa-toggle-on" aria-hidden="true"></i>';
    }
    else if(document.body.classList.contains('light-theme')) {
        document.getElementById('thememode_toggle').innerHTML = '<i class="fa fa-moon-o" aria-hidden="true"></i>&nbsp;<i class="fa fa-toggle-off" aria-hidden="true"></i>';
    }
    document.body.classList.toggle('light-theme', light_theme);
}