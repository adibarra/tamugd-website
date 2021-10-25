// toggle-darkmode js to toggle darkmode
function toggleDarkMode() {
    toggleDarkmodeHTML = $("#darkmode-toggle").html().trim();
    if (toggleDarkmodeHTML.includes('<i class="fa fa-sun-o')) {
        $("#darkmode-toggle").html('<i class="fa fa-moon-o" aria-hidden="true"></i>&nbsp;<i class="fa fa-toggle-on" aria-hidden="true"></i>');
        document.cookie = "darkmode=true; SameSite=Strict;";
        darkmodeEnabled = true        
    }
    else {
        $("#darkmode-toggle").html('<i class="fa fa-sun-o" aria-hidden="true"></i>&nbsp;<i class="fa fa-toggle-off" aria-hidden="true"></i>');
        document.cookie = "darkmode=false; SameSite=Strict;";
        darkmodeEnabled = false
    }
    updateThemeMode();
}

// set page to darkmode if darkmode is enabled
function updateThemeMode() {
    if (darkmodeEnabled) {
        $('*').addClass("dark-theme");
    }
    else {
        $('*').removeClass("dark-theme");
    }
}