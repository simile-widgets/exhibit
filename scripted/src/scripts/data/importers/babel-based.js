/**
 * @fileOverview Babel service-based data conversion and import.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace
 */
Exhibit.Importer.BabelBased = {
    _importer: null,

    _mimeTypeToReader: {
        "application/rdf+xml" : "rdf-xml",
        "application/n3" : "n3",
        
        "application/msexcel" : "xls",
        "application/x-msexcel" : "xls",
        "application/x-ms-excel" : "xls",
        "application/vnd.ms-excel" : "xls",
        "application/x-excel" : "xls",
        "application/xls" : "xls",
        "application/x-xls" : "xls",
        
        "application/x-bibtex" : "bibtex"        
    },

    _translatorPrefix: (typeof Exhibit.babelPrefix !== "undefined") ?
        Exhibit.babelPrefix + "translator?" :
        undefined
};

/**
 * @param {String} url
 * @param {Object} s
 * @param {Function} callback
 */
Exhibit.Importer.BabelBased.parse = function(url, s, callback) {
    if (typeof callback === "function") {
        callback(s);
    }
};

/**
 * @param {String} url
 * @param {String} mimeType
 * @returns {String}
 */
Exhibit.Importer.BabelBased.makeURL = function(url, mimeType) {
    if (typeof Exhibit.Importer.BabelBased._translatorPrefix === "undefined") {
        return null;
    }

    var reader, writer;
    reader = Exhibit.Importer.BabelBased._defaultReader;
    writer = Exhibit.Importer.BabelBased._defaultWriter;

    if (typeof Exhibit.Importer.BabelBased._mimeTypeToReader[mimeType] !== "undefined") {
        reader = Exhibit.Importer.BabelBased._mimeTypeToReader[mimeType];
    }

    if (reader === "bibtex") {
        writer = "bibtex-exhibit-jsonp";
    }

    return Exhibit.Importer.BabelBased._translatorPrefix + [
        "reader=" + reader,
        "writer=" + writer,
        "url=" + encodeURIComponent(url)
    ].join("&");
};

/**
 * @private
 * @static
 * @param {jQuery.Event} evt
 * @param {Exhibit.Registry} reg
 */
Exhibit.Importer.BabelBased._register = function(evt, reg) {
    if (typeof Exhibit.Importer.BabelBased._translatorPrefix === "undefined") {
        return;
    }

    var types, type;
    types = [];
    for (type in Exhibit.Importer.BabelBased._mimeTypeToReader) {
        if (Exhibit.Importer.BabelBased._mimeTypeToReader.hasOwnProperty(type)) {
            types.push(type);
        }
    }
    
    Exhibit.Importer.BabelBased._importer = new Exhibit.Importer(
        types,
        "babel",
        Exhibit.Importer.BabelBased.parse
    );
};

Exhibit.jQuery(document).one(
    "registerImporters.exhibit",
    Exhibit.Importer.BabelBased._register
);
