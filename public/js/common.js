document.addEventListener('DOMContentLoaded', () => {
  updateTheme();
  $('#header_favicon').bind('click', () => window.location='/');
  $('#footer_favicon').bind('click', () => window.location='/');
  $('#theme_toggle')  .bind('click', () => toggleDark());
});

function isElementVisible(element) {
  return $(element).offset().top <= ($(window).height() + $(window).scrollTop());
}

function isDark() {
  if (localStorage && localStorage.getItem('dark'))
    return JSON.parse(localStorage.getItem('dark'));
  return true;
}

function toggleDark() {
  if (localStorage) {
    localStorage.setItem('dark', JSON.stringify(!isDark()));
  }
  updateTheme();
}

function updateTheme() {
  $('body').attr('class', isDark() ? 'dark' : 'light');
  $('#theme_toggle').html('<i class="fa '+(isDark() ? 'fa-moon-o' : 'fa-sun-o')+'" title="Toggle Theme" aria-hidden="true"></i>');
}
