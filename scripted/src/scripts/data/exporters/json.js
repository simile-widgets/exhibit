/**
 * @fileOverview Instance of Exhibit.Exporter for Exhibit JSON.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace
 */
Exhibit.Exporter.ExhibitJSON = {
    _mimeType: "application/json",
    exporter: null
};

/**
 * @param {String} s
 * @returns {String}
 */
Exhibit.Exporter.ExhibitJSON.wrap = function(s) {
    return "{\n" +
        "    \"items\": [\n" +
            s +
        "    ]\n" +
        "}\n";
};

/**
 * @param {String} s
 * @param {Boolean} first
 * @param {Boolean} last
 * @returns {String}
 */
Exhibit.Exporter.ExhibitJSON.wrapOne = function(s, first, last) {
    return s + (last ? "" : ",")  +"\n";
};

/**
 * @param {String} itemID
 * @param {Object} o
 * @returns {String}
 * @depends JSON
 */
Exhibit.Exporter.ExhibitJSON.exportOne = function(itemID, o) {
    return JSON.stringify(o);
};

/**
 * @private
 */
Exhibit.Exporter.ExhibitJSON._register = function() {
    Exhibit.Exporter.ExhibitJSON.exporter = new Exhibit.Exporter(
        Exhibit.Exporter.ExhibitJSON._mimeType,
        Exhibit._("%export.exhibitJsonExporterLabel"),
        Exhibit.Exporter.ExhibitJSON.wrap,
        Exhibit.Exporter.ExhibitJSON.wrapOne,
        Exhibit.Exporter.ExhibitJSON.exportOne
    );
};

Exhibit.jQuery(document).one("registerExporters.exhibit",
                Exhibit.Exporter.ExhibitJSON._register);
