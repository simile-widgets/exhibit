/**
 * @fileOverview Load locales, any dynamic post-script loading activities.
 */

Exhibit.jQuery(document).ready(function() {
    var delays, localeLoaded;
    // Without threading, this shouldn't introduce a race condition,
    // but it is definitely a problem if concurrency comes into play.
    // Maybe refactoring so everything uses the delay queue under the hood
    // would make more sense.
    delays = [];
    localeLoaded = false;

    Exhibit.jQuery(document).bind("delayCreation.exhibit", function(evt, delayID) {
        delays.push(delayID);
    });

    Exhibit.jQuery(document).bind("delayFinished.exhibit", function(evt, delayID) {
        var idx = delays.indexOf(delayID);
        if (idx >= 0) {
            delays.splice(idx);
            if (delays.length === 0 && localeLoaded) {
                delays = null;
                Exhibit.jQuery(document).trigger("scriptsLoaded.exhibit");
            }
        }
    });
    
    Exhibit.jQuery(document).bind("localeSet.exhibit", function(evt, localeURLs) {
        var i;
        for (i = 0; i < localeURLs.length; i++) {
            Exhibit.loader.script(localeURLs[i]);
        }
        Exhibit.jQuery(document).trigger("loadExtensions.exhibit");
    });

    Exhibit.jQuery(document).bind("error.exhibit", function(evt, e, msg) {
        Exhibit.UI.hideBusyIndicator();
        Exhibit.Debug.exception(e, msg);
        alert(msg);
    });

    Exhibit.jQuery(document).one("localeLoaded.exhibit", function(evt) {
        localeLoaded = true;
        if (delays.length === 0) {
            Exhibit.jQuery(document).trigger("scriptsLoaded.exhibit");
        }
    });

    Exhibit.jQuery(document).one("scriptsLoaded.exhibit", function(evt) {
        Exhibit.jQuery(document).trigger("registerStaticComponents.exhibit", Exhibit.staticRegistry);
    });

    Exhibit.jQuery(document).one("exhibitConfigured.exhibit", function(evt, ex) {
        Exhibit.Bookmark.init();
        Exhibit.History.init(ex);
    });

    // Signal recording
    Exhibit.jQuery(document).one("loadExtensions.exhibit", function(evt) {
        Exhibit.signals["loadExtensions.exhibit"] = true;
    });

    Exhibit.jQuery(document).one("exhibitConfigured.exhibit", function(evt) {
        Exhibit.signals["exhibitConfigured.exhibit"] = true;
    });

    Exhibit.checkBackwardsCompatibility();
    Exhibit.staticRegistry = new Exhibit.Registry(true);

    Exhibit.jQuery("link[rel='exhibit-extension']").each(function(idx, el) {
        Exhibit.loader.script(Exhibit.jQuery(el).attr("href"));
    });

    Exhibit.loader.wait(function() {
        Exhibit.jQuery(document).trigger("registerLocalization.exhibit", Exhibit.staticRegistry);
    });
});
