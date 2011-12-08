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

    $(document).one("scriptsLoaded.exhibit", function(evt) {
        $(document).trigger("registerStaticComponents.exhibit", Exhibit.staticRegistry);
    });

    $(document).one("exhibitConfigured.exhibit", function(evt, ex) {
        Exhibit.Bookmark.init();
        Exhibit.History.init(ex);
    });

    Exhibit.staticRegistry = new Exhibit.Registry(true);
    $(document).trigger("registerLocalization.exhibit", Exhibit.staticRegistry);
});
