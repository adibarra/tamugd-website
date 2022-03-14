document.addEventListener('DOMContentLoaded', () => {
    updateThemeMode();
    openURL('header_favicon', '/');
    openURL('footer_favicon', '/');
    document.getElementById('thememode_toggle').addEventListener('click', () => {
        toggleThemeMode();
    });
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-HS51DZ5HEM');
});

function openURL(elementID, link) {
    document.getElementById(elementID).addEventListener('click', () => { window.location=link;});
}

function isElementVisible(element) {
    return $(element).offset().top <= ($(window).height() + $(window).scrollTop());
}

function toggleThemeMode() {
    document.cookie = 'lightmode='+!document.cookie.includes('lightmode=true')+'; SameSite=Strict;';
    updateThemeMode();
}

function updateThemeMode() {
    var light_theme = document.cookie.includes('lightmode=true')
    if (light_theme && !document.body.classList.contains('light-theme')) {
        document.getElementById('thememode_toggle').innerHTML = '<i class="fa fa-sun-o" aria-hidden="true"></i>';
    }
    else if(document.body.classList.contains('light-theme')) {
        document.getElementById('thememode_toggle').innerHTML = '<i class="fa fa-moon-o" aria-hidden="true"></i>';
    }
    document.body.classList.toggle('light-theme', light_theme);
}