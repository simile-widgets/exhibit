/**
 * @fileOverview Load locales, any dynamic post-script loading activities.
 */

$(document).ready(function() {
    $(document).bind("localeSet.exhibit", function(event, localeURL) {
        $LAB.script(localeURL);
    });

    $(document).one("localeLoaded.exhibit", function(event) {
        $(document).trigger("scriptsLoaded.exhibit");
    });

    $(document).trigger("registerLocalization.exhibit");
});
