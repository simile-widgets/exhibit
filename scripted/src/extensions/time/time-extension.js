/**
 * @fileOverview An extension to Exhibit adding a view using SIMILE Timeline.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 * @example Load this file like so:
 * <script src="http://host/exhibit/3.0.0/exhibit-api.js"></script>
 * <script src="http://host/exhibit/3.0.0/extensions/time-extension.js"></script>
 * where "host" is wherever the Exhibit files are based on the web.  Valid
 * parameters are:
 *  bundle [true|false]: load extension files one by one or bundled in one file
 *  timelinePrefix <String>: Which host to find Timeline, defaults to
 *    "http://api.simile-widgets.org"
 *  timelineVersion <String>: Which version of Timeline to use, defaults to
 *    "2.3.1"
 */

/**
 * This extension is subject to ugly, ugly hacks because Timeline a) relies
 * on SimileAjax, which Exhibit 3.0 no longer does, and b) Timeline's method
 * of loading (via SimileAjax) is outdated and not compatible with Exhibit.
 *
 * In order to compensate, this file uses two polling loops and a modified
 * version of the SimileAjax loader.  The first polling loop waits until
 * jQuery is available, which is mostly a network latency concern.  The
 * second polling loop waits until Timeline has loaded and is defined in
 * the window context, which is also mostly a network latency concern.
 * But the extension must take advantage of Exhibit's delay mechanism so
 * Exhibit will delay creation until Timeline has finished loading.  The
 * modified SimileAjax loader does not load SimileAjax jQuery or allow
 * SimileAjax to modify jQuery but has to define some of the material
 * in SimileAjax as a consequence.  See load-simile-ajax.js.
 */

(function loadTimeExtension(){
    /**
     * Ugly polling hack #1.
     */
    setTimeout(function() {
        if (typeof jQuery === "undefined") {
            loadTimeExtension();
        } else {
            $(document).one("loadExtensions.exhibit", function() {
                var javascriptFiles, cssFiles, paramTypes, url, scriptURLs, cssURLs, ajaxURLs, i, delayID, finishedLoading;
                delayID = Exhibit.generateDelayID();
                $(document).trigger(
                    "delayCreation.exhibit",
                    delayID
                );

                Exhibit.TimeExtension = {
                    "params": {
                        "bundle": true,
                        "timelinePrefix": "http://api.simile-widgets.org",
                        "timelineVersion": "2.3.1"
                    },
                    "urlPrefix": null,
                };

                javascriptFiles = [
                    "timeline-view.js"
                ];
                cssFiles = [
                    "timeline-view.css"
                ];
                paramTypes = {
                    "bundle": Boolean,
                    "timelinePrefix": String,
                    "timelineVersion": String
                };
                
                if (typeof Exhibit_TimeExtension_urlPrefix === "string") {
                    Exhibit.TimeExtension.urlPrefix = Exhibit_TimeExtension_urlPrefix;
                    if (typeof Exhibit_TimeExtension_parameters !== "undefined") {
                        Exhibit.parseURLParameters(Exhibit_TimeExtension_parameters,
                                                   Exhibit.TimeExtension.params,
                                                   paramTypes);
                    }
                } else {
                    url = Exhibit.findScript(document, "/time-extension.js");
                    if (url === null) {
                        Exhibit.Debug.exception(new Error("Failed to derive URL prefix for SIMILE Exhibit Time Extension files"));
                        return;
                    }
                    Exhibit.TimeExtension.urlPrefix = url.substr(0, url.indexOf("time-extension.js"));
                    
                    Exhibit.parseURLParameters(url, Exhibit.TimeExtension.params, paramTypes);
                }
                
                scriptURLs = [];
                cssURLs = [];
                
                if (typeof SimileAjax === "undefined") {
                    /**
                     * Ugly SimileAjax hack.  See load-simile-ajax.js.
                     */
                    scriptURLs.push(Exhibit.TimeExtension.urlPrefix + "load-simile-ajax.js");
                }
                if (typeof Timeline === "undefined") {
                    scriptURLs.push(Exhibit.TimeExtension.params.timelinePrefix + "/timeline/" + Exhibit.TimeExtension.params.timelineVersion + "/timeline-api.js?bundle=true");
                }
                
                if (Exhibit.TimeExtension.params.bundle) {
                    scriptURLs.push(Exhibit.TimeExtension.urlPrefix + "time-extension-bundle.js");
                    cssURLs.push(Exhibit.TimeExtension.urlPrefix + "time-extension-bundle.css");
                } else {
                    Exhibit.prefixURLs(scriptURLs, Exhibit.TimeExtension.urlPrefix + "scripts/", javascriptFiles);
                    Exhibit.prefixURLs(cssURLs, Exhibit.TimeExtension.urlPrefix + "styles/", cssFiles);
                }
                
                scriptURLs.push(Exhibit.TimeExtension.urlPrefix + "locales/" + Exhibit.Localization._currentLocale + "/time-locale.js");

                Exhibit.includeCssFiles(document, "", cssURLs);
                Exhibit.includeJavascriptFiles(document, "", scriptURLs);

                /**
                 * Ugly polly hack #2.
                 */
                finishedLoading = function() {
                    setTimeout(function() {
                        if (typeof Timeline === "undefined") {
                            finishedLoading();
                        } else {
                            $(document).trigger("delayFinished.exhibit", delayID);
                        }
                    }, 500);
                };
                finishedLoading();
            });
        }
    }, 500);
}());
