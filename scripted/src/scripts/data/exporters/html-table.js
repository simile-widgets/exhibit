/**
 * @fileOverview Instance of Exhibit.Exporter for tab-separated values.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace
 */
Exhibit.Exporter.HTMLTable = {
    _mimeType: "text/html",
    exporter: null
};

/**
 * @param {String} s
 * @param {Exhibit.Database} database
 * @returns {String}
 */
Exhibit.Exporter.HTMLTable.wrap = function(s, database, props) {
    var prop
    , $ = Exhibit.jQuery
    , header = $("<tr/>");

    for (prop in props) {
        if (props.hasOwnProperty(prop)) {
            $("<th/>").text(props[prop].label || prop)
                .attr("data-ex-property",prop)
                .attr("data-ex-value-type",props[prop].valueType)
                .appendTo(header);
        }
    }

    return "<table><tr>\n" + header.html() 
        + "</tr>\n" + s + "</table>";
};

/**
 * @param {String} s
 * @returns {String}
 */
Exhibit.Exporter.HTMLTable.wrapOne = function(s, first, last) {
    return s + "\n";
};

/**
 * @param {String} itemID
 * @param {Object} o
 * @returns {String}
 */
Exhibit.Exporter.HTMLTable.exportOne = function(itemID, o, props) {
    var prop, $ = Exhibit.jQuery, s = "", fields=$("<tr/>");

    for (prop in props) {
        if (props.hasOwnProperty(prop)) {
            if (o.hasOwnProperty(prop)) {
                if (Array.isArray(o[prop])) {
                    $("<td/>").text(o[prop].join(";")).appendTo(fields);
                } else {
                    $("<td/>").text(o[prop]).appendTo(fields);
                }
            } else {
                $("<td/>").appendTo(fields);
            }
        }
    }
    return "<tr>" + fields.html() + "</tr>";
};

/**
 * @private
 */
Exhibit.Exporter.HTMLTable._register = function() {
    Exhibit.Exporter.HTMLTable.exporter = new Exhibit.Exporter(
        Exhibit.Exporter.HTMLTable._mimeType,
        Exhibit._("%export.htmlTableExporterLabel"),
        Exhibit.Exporter.HTMLTable.wrap,
        Exhibit.Exporter.HTMLTable.wrapOne,
        Exhibit.Exporter.HTMLTable.exportOne
    );
};

Exhibit.jQuery(document).one("registerExporters.exhibit",
                Exhibit.Exporter.HTMLTable._register);
