/**
 * @fileOverview Load locales, any dynamic post-script loading activities.
 */

$(document).ready(function() {
    var delays = [];

    $(document).bind("delayCreation.exhibit", function(evt, delayID) {
        delays.push(delayID);
    });

    $(document).bind("delayFinished.exhibit", function(evt, delayID) {
        var idx = delays.indexOf(delayID);
        if (idx >= 0) {
            delays.splice(idx);
            if (delays.length === 0) {
                $(document).trigger("scriptsLoaded.exhibit");
            }
        }
    });
    
    $(document).bind("localeSet.exhibit", function(evt, localeURL) {
        $LAB.script(localeURL);
        $(document).trigger("loadExtensions.exhibit");
    });

    $(document).bind("error.exhibit", function(evt, e, msg) {
        Exhibit.UI.hideBusyIndicator();
        Exhibit.Debug.exception(e, msg);
        alert(msg);
    });

    $(document).one("localeLoaded.exhibit", function(evt) {
        if (delays.length === 0) {
            $(document).trigger("scriptsLoaded.exhibit");
        }
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
