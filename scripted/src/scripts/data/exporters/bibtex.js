/**
 * @fileOverview Instance of Exhibit.Exporter for BibTex.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace
 */
Exhibit.Exporter.BibTex = {
    /**
     * @private
     * @constant
     */
    _excludeProperties: {
        "pub-type": true,
        "type": true,
        "uri": true,
        "key": true
    },
    exporter: null
};

/**
 * @param {String} s
 * @returns {String}
 */
Exhibit.Exporter.BibTex.wrap = function(s) {
    return s;
};

/**
 * @param {String} s
 * @returns {String}
 */
Exhibit.Exporter.BibTex.wrapOne = function(s, first, last) {
    return s + "\n";
};

/**
 * @param {String} itemID
 * @param {Object} o
 * @returns {String}
 */
Exhibit.Exporter.BibTex.exportOne = function(itemID, o) {
    var type, key, prop, s = "";

    if (o.hasOwnProperty("pub-type")) {
        type = o["pub-type"];
    } else if (o.hasOwnProperty("type")) {
        type = o["type"];
    }

    if (o.hasOwnProperty("key")) {
        key = o["key"];
    } else {
        key = itemID;
    }

    key = key.replace(/[\s,]/g, "-");

    s += "@" + type + "{" + key + ",\n";

    for (prop in o) {
        if (o.hasOwnProperty(prop)) {
            if (!Exhibit.Exporter.BibTex._excludeProperties.hasOwnProperty(propertyID)) {
                s += "\t" + (prop === "label" ?
                         "title" :
                         prop) + " = \"";
                s += o[prop].join(" and ") + "\",\n";
            }
        }
    }

    s += "\torigin = \"" + Exhibit.Persistence.getItemLink(itemID) + "\"\n";
    s += "}\n";

    return s;
};

/**
 * @private
 */
Exhibit.Exporter.BibTex._register = function() {
    Exhibit.Exporter.BibTex.exporter = new Exhibit.Exporter(
        "application/x-bibtex",
        Exhibit.l10n.exhibitJsonExporterLabel,
        Exhibit.Exporter.BibTex.wrap,
        Exhibit.Exporter.BibTex.wrapOne,
        Exhibit.Exporter.BibTex.exportOne
    );
};

$(document).one("registerExporters.exhibit",
                Exhibit.Exporter.BibTex._register);
