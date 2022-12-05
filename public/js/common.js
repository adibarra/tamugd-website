document.addEventListener('DOMContentLoaded', () => {
    updateThemeMode();
    $('#header_favicon').bind('click', () => window.location='/');
    $('#footer_favicon').bind('click', () => window.location='/');
    $('#theme_toggle')  .bind('click', () => toggleThemeMode());
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-HS51DZ5HEM');
});

function isElementVisible(element) {
    return $(element).offset().top <= ($(window).height() + $(window).scrollTop());
}

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const c = cookies[i].trim().split('=');
        if (c[0] === name) return decodeURIComponent(c[1]);
    }
    return '';
}

function setCookie(name, value, days=365, path='/', domain='', samesite='strict') {
    let cookie = `${name}=${encodeURIComponent(value)}`;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);
    document.cookie = `${cookie}; expires=${expiry.toUTCString()}; path=${path}; domain=${domain}; samesite=${samesite}; secure`;
}

function toggleThemeMode() {
    setCookie('style', getCookie('style') === 'light' ? 'dark' : 'light');
    updateThemeMode();
}

function updateThemeMode() {
    if (!getCookie('style')) setCookie('style', 'dark');
    $('body').attr('class', getCookie('style'));
    $('#theme_toggle').html('<i class="fa '+(getCookie('style') === 'light' ? 'fa-sun-o' : 'fa-moon-o')+'" title="Toggle Theme" aria-hidden="true"></i>');
}
