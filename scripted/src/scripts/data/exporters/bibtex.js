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
    _mimeType: "application/x-bibtex",
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

    if (typeof o["pub-type"] !== "undefined") {
        type = o["pub-type"];
    } else if (typeof o.type !== "undefined") {
        type = o.type;
    }

    if (typeof o.key !== "undefined") {
        key = o.key;
    } else {
        key = itemID;
    }

    key = key.replace(/[\s,]/g, "-");

    s += "@" + type + "{" + key + ",\n";

    for (prop in o) {
        if (o.hasOwnProperty(prop)) {
            if (typeof Exhibit.Exporter.BibTex._excludeProperties[prop] === "undefined") {
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
        Exhibit.Exporter.BibTex._mimeType,
        Exhibit._("%export.bibtexExporterLabel"),
        Exhibit.Exporter.BibTex.wrap,
        Exhibit.Exporter.BibTex.wrapOne,
        Exhibit.Exporter.BibTex.exportOne
    );
};

Exhibit.jQuery(document).one("registerExporters.exhibit",
                Exhibit.Exporter.BibTex._register);
