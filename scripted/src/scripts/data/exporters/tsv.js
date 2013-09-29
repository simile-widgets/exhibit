/**
 * @fileOverview Instance of Exhibit.Exporter for tab-separated values.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace
 */
Exhibit.Exporter.TSV = {
    _mimeType: "text/tab-separated-values",
    exporter: null
};

/**
 * @param {String} s
 * @param {Exhibit.Database} database
 * @returns {String}
 */
Exhibit.Exporter.TSV.wrap = function(s, database, props) {
    var header, prop, propertyID, property, valueType;

    header = [];

    for (prop in props) {
        if (props.hasOwnProperty(prop)) {
            valueType = props[prop].valueType;
            header.push(prop + ":" + valueType);
        }
    }

    return header.join("\t") + "\n" + s;
};

/**
 * @param {String} s
 * @returns {String}
 */
Exhibit.Exporter.TSV.wrapOne = function(s, first, last) {
    return s + "\n";
};

/**
 * @param {String} itemID
 * @param {Object} o
 * @returns {String}
 */
Exhibit.Exporter.TSV.exportOne = function(itemID, o, props) {
    var prop, s = "", fields=[];

    for (prop in props) {
        if (props.hasOwnProperty(prop)) {
            if (o.hasOwnProperty(prop)) {
                if (Array.isArray(o[prop])) {
                    fields.push(o[prop].join(";"));
                } else {
                    fields.push(o[prop]);
                }
            } else {
                fields.push("");
            }
        }
    }
    return fields.join("\t");
};

/**
 * @private
 */
Exhibit.Exporter.TSV._register = function() {
    Exhibit.Exporter.TSV.exporter = new Exhibit.Exporter(
        Exhibit.Exporter.TSV._mimeType,
        Exhibit._("%export.tsvExporterLabel"),
        Exhibit.Exporter.TSV.wrap,
        Exhibit.Exporter.TSV.wrapOne,
        Exhibit.Exporter.TSV.exportOne
    );
};

Exhibit.jQuery(document).one("registerExporters.exhibit",
                Exhibit.Exporter.TSV._register);
