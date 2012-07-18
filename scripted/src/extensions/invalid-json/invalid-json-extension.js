/**
 * @fileOverview Methods for converting Exhibit 2.2.0 JSON into
 *     valid JSON 2.0.  If the existing Exhibit JSON import fails
 *     it will offer this as an option via confirmation dialog.  This tool
 *     should not be included under normal operation, only when upgrading
 *     and your data fails to load.
 * @example
 * <script src="http://host/exhibit/3.0.0/exhibit-api.js?autoCreate=false">
 * </script>
 * <script src="http://host/exhibit/3.0.0/extensions/invalid-json-extension.js">
 * </script>
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace
 */
Exhibit.Extension.InvalidJSON = {};

/**
 * @param {String} url
 */
Exhibit.Extension.InvalidJSON.process = function(url) {
    Exhibit.Extension.InvalidJSON.get(
        url,
        Exhibit.Extension.InvalidJSON.onSuccess
    );
};

/**
 * The imprecise method Exhibit 2.2.0 used to process JSON.
 * @param {String} json
 * @returns {Object}
 */
Exhibit.Extension.InvalidJSON.parseJSON = function(json) {
    return eval("(" + json + ")");
};

/**
 * @param {String} url
 * @param {String} json
 * @returns {String}
 */
Exhibit.Extension.InvalidJSON.makeValid = function(url, json) {
    try {
        return JSON.stringify(Exhibit.Extension.InvalidJSON.parseJSON(json), null, "\t");
    } catch(e) {
        Exhibit.jQuery(document).trigger(
            "error.exhibit",
            [e, "Failed to convert."]
        );
    }
};

/**
 * @param {String} url
 * @param {Function} callback
 */
Exhibit.Extension.InvalidJSON.get = function(url, callback) {
    Exhibit.jQuery.ajax({
        "url": url,
        "dataType": "text",
        "success": function(s, t, j) {
            callback(url, s, t, j);
        }
    });
};

/**
 * @param {String} url
 * @param {String} s
 * @param {String} textStatus
 * @param {jQuery.XmlHttpRequest} jqxhr
 */
Exhibit.Extension.InvalidJSON.onSuccess = function(url, s, textStatus, jqxhr) {
    Exhibit.Extension.InvalidJSON.show(
        url,
        Exhibit.Extension.InvalidJSON.makeValid(url, s)
    );
};

/**
 * @param {String} url
 * @param {String} json
 */
Exhibit.Extension.InvalidJSON.show = function(url, json) {
    var valid = json + "\n// " + url + "\n";
    Exhibit.ToolboxWidget.createExportDialogBox(valid).open();
};

// Initialize
(function loadInvalidJSONExtension() {
    setTimeout(function() {
        if (typeof jQuery === "undefined") {
            loadInvalidJSONExtension();
        } else {
            Exhibit.jQuery(document).one("localeLoaded.exhibit", function(evt) {
                Exhibit.jQuery('link[rel="exhibit/data"][type="application/json"],link[rel="exhibit-data"][type="application/json"]')
                    .each(function(idx) {
                        Exhibit.Extension.InvalidJSON.process(Exhibit.jQuery(this).attr("href"));
                    });
            });
        }
    }, 500);
}());
