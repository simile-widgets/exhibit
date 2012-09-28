/**
 * @fileOverview An extension to Exhibit adding a map view with options for
 *    different mapping services.
 * @author David Huynh
 * @author <a href="mailto:karger@mit.edu">David Karger</a>
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 * @example Load this file like so:
 * <script src="http://host/exhibit/3.0.0/exhibit-api.js"></script>
 * <script src="http://host/exhibit/3.0.0/extensions/map-extension.js"></script>
 * where "host" is wherever the Exhibit files are based on the web.  Valid
 * parameters are:
 *  bundle [true|false]: load extension files one by one or bundled in one file,
 *       defaults to true
 *  service [google|google2]: which mapping service to draw upon,
 *       defaults to google (v3)
 *  gmapKey: only necessary when using google2 service
 *  mapPrefix <String>: Which host to find Timeline, defaults to
 *    "http://api.simile-widgets.org"
 */

(function() {
    var loader;
    loader = function() {
        var javascriptFiles, cssFiles, paramTypes, url, scriptURLs, cssURLs, ajaxURLs, i, delayID, finishedLoading, localesToLoad;
        delayID = Exhibit.generateDelayID();
        Exhibit.jQuery(document).trigger(
            "delayCreation.exhibit",
            delayID
        );
        
        Exhibit.MapExtension = {
            "params": {
                "bundle": true,
                "gmapKey": null,
                "service": "google",
                "mapPrefix": "http://api.simile-widgets.org"
            },
            "urlPrefix": null,
            "markerUrlPrefix" :"http://service.simile-widgets.org/painter/painter?",
            "initialized": false, // used in the view
            "hasCanvas": false, // used in the view
            "locales": [
                "en",
                "de",
                "es",
                "fr",
                "nl",
                "sv"
            ],
            "noop": function() { }, // so google maps v3 will load
            "_CORSWarned": false // used in the view
        };
        // Only the shared files are listed here. The service-
        // specific files are loaded with the service-specific library.
        javascriptFiles = [
            "canvas.js",
            "painter.js",
            "marker.js"
        ];
        cssFiles = [
            "map-view.css"
        ];
        paramTypes = {
            "bundle": Boolean,
            "service": String,
            "gmapKey": String,
            "mapPrefix": String
        };
        
        if (typeof Exhibit_MapExtension_urlPrefix === "string") {
            Exhibit.MapExtension.urlPrefix = Exhibit_MapExtension_urlPrefix;
            if (typeof Exhibit_MapExtension_parameters !== "undefined") {
                Exhibit.parseURLParameters(
                    Exhibit_MapExtension_parameters,
                    Exhibit.MapExtension.params,
                    paramTypes
                );
            }
        } else {
            url = Exhibit.findScript(document, "/map-extension.js");
            if (url === null) {
                Exhibit.Debug.exception(new Error("Failed to derive URL prefix for SIMILE Exhibit Map Extension files"));
                return;
            }
            Exhibit.MapExtension.urlPrefix = url.substr(0, url.indexOf("map-extension.js"));
            
            Exhibit.parseURLParameters(
                url,
                Exhibit.MapExtension.params,
                paramTypes
            );
        }
        
        scriptURLs = [];
        cssURLs = [];
        if (Exhibit.MapExtension.params.service === "google2" &&
                   typeof GMap2 === "undefined") {
            if (typeof Exhibit.params.gmapKey !== "undefined") {
	            scriptURLs.push("http://maps.google.com/maps?file=api&v=2&sensor=false&callback=Exhibit.MapExtension.noop&async=2&key=" + Exhibit.params.gmapKey);
            } else if (typeof Exhibit.MapExtension.params.gmapKey !== "undefined") {
	            scriptURLs.push("http://maps.google.com/maps?file=api&v=2&sensor=false&callback=Exhibit.MapExtension.noop&async=2&key=" + Exhibit.MapExtension.params.gmapKey);
            } else {
	            scriptURLs.push("http://maps.google.com/maps?file=api&v=2&sensor=false&callback=Exhibit.MapExtension.noop&async=2");
            }
            if (!Exhibit.MapExtension.params.bundle) {
                javascriptFiles.push("google-maps-v2-view.js");
            }
        } else {
            // if author is referring to an unknown service, default to google
	        if (typeof google === "undefined" ||
                (typeof google !== "undefined" && typeof google.map === "undefined")) {
	            scriptURLs.push("http://maps.googleapis.com/maps/api/js?sensor=false&callback=Exhibit.MapExtension.noop");
                if (!Exhibit.MapExtension.params.bundle) {
                    javascriptFiles.push("map-view.js");
                }
            }
        }
        
        // @@@ ideally these bundles would be service-specific instead of
        // loading everything
        if (Exhibit.MapExtension.params.bundle) {
            scriptURLs.push(Exhibit.MapExtension.urlPrefix + "map-extension-bundle.js");
            cssURLs.push(Exhibit.MapExtension.urlPrefix + "styles/map-extension-bundle.css");
        } else {
            Exhibit.prefixURLs(scriptURLs, Exhibit.MapExtension.urlPrefix + "scripts/", javascriptFiles);
            Exhibit.prefixURLs(cssURLs, Exhibit.MapExtension.urlPrefix + "styles/", cssFiles);
        }
        
        localesToLoad = Exhibit.Localization.getLoadableLocales(Exhibit.MapExtension.locales);
        for (i = 0; i < localesToLoad.length; i++) {
            scriptURLs.push(Exhibit.MapExtension.urlPrefix + "locales/" + localesToLoad[i] + "/locale.js");
        }
        
        Exhibit.includeCssFiles(document, null, cssURLs);
        Exhibit.includeJavascriptFiles(null, scriptURLs);
        
        finishedLoading = function() {
            if ((typeof google === "undefined" ||
                 (typeof google !== "undefined" && typeof google.maps === "undefined")) &&
                typeof GMap2 === "undefined") {
                setTimeout(finishedLoading, 500);
            } else {
                Exhibit.jQuery(document).trigger("delayFinished.exhibit", delayID);
            }
        };
        finishedLoading();
    };

    Exhibit.jQuery(document).one("loadExtensions.exhibit", loader);
}());
