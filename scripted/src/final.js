/**
 * @fileOverview Load locales, any dynamic post-script loading activities.
 */

$(document).ready(function() {
    $(document).bind("localeSet.exhibit", function(evt, localeURL) {
        $LAB.script(localeURL);
    });

    $(document).one("localeLoaded.exhibit", function(evt) {
        $(document).trigger("scriptsLoaded.exhibit");
    });

    $(document).one("exhibitConfigured.exhibit", function(evt) {
        Exhibit.Bookmark.init();
        Exhibit.History.init();
    });

    $(document).trigger("registerLocalization.exhibit");
});
