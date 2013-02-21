/**
 * @fileOverview Instance of Exhibit.Exporter for Semantic MediaWiki text.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace
 */
Exhibit.Exporter.SemanticWikiText = {
    _type: "semantic-mediawiki",
    exporter: null
};

/**
 * @param {String} s
 * @param {Exhibit.Database} database
 * @returns {String}
 */
Exhibit.Exporter.SemanticWikiText.wrap = function(s, database) {
    return s;
};

/**
 * @param {String} s
 * @returns {String}
 */
Exhibit.Exporter.SemanticWikiText.wrapOne = function(s, first, last) {
    return s + "\n";
};

/**
 * @param {String} itemID
 * @param {Object} o
 * @param {Object} properties
 * @returns {String}
 */
Exhibit.Exporter.SemanticWikiText.exportOne = function(itemID, o, properties) {
    var uri, prop, valueType, values, i, s = "";

    uri = o.uri;
    s += uri + "\n";

    for (prop in o) {
        if (o.hasOwnProperty(prop) && typeof properties[prop] !== "undefined") {
            valueType = properties[prop].valueType;
            values = o[prop];
            if (valueType === "item") {
                for (i = 0; i < values.length; i++) {
                    s += "[[" + prop + "::" + values[i] + "]]\n";
                }
            } else {
                for (i = 0; i < values.length; i++) {
                    s += "[[" + prop + ":=" + values[i] + "]]\n";
                }
            }
        }
    }

    s += "[[origin:=" + Exhibit.Persistence.getItemLink(itemID) + "]]\n\n";

    return s;
};

/**
 * @private
 */
Exhibit.Exporter.SemanticWikiText._register = function() {
    Exhibit.Exporter.SemanticWikiText.exporter = new Exhibit.Exporter(
        Exhibit.Exporter.SemanticWikiText._type,
        Exhibit._("%export.smwExporterLabel"),
        Exhibit.Exporter.SemanticWikiText.wrap,
        Exhibit.Exporter.SemanticWikiText.wrapOne,
        Exhibit.Exporter.SemanticWikiText.exportOne
    );
};

Exhibit.jQuery(document).one("registerExporters.exhibit",
                Exhibit.Exporter.SemanticWikiText._register);
