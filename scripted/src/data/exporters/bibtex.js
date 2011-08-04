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
Exhibit.Exporter.BibTex.wrapOne = function(s) {
    return s + "\n";
};

/**
 * @param {String} itemID
 * @param {Exhibit.Database} database
 * @returns {String}
 */
Exhibit.Exporter.BibTex.exportOne = function(itemID, database) {
    var s = "", type, key, allProperties, i, propertyID, property, values, valueType, strings, fn;

    type = database.getObject(itemID, "pub-type");
    key = database.getObject(itemID, "key");
    key = (key !== null ? key : itemID);
    key = key.replace(/[\s,]/g, "-");

    s += "@" + type + "{" + key + ",\n";

    allProperties = database.getAllProperties();

    fn = function(vt, s) {
        if (vt === "item") {
            return function(value) {
                s.push(database.getObject(value, "label"));
            };
        } else if (vt === "url") {
            return function(value) {
                s.push(Exhibit.Persistence.resolveURL(value));
            };
        }
    };

    for (i = 0; i < allProperties.length; i++) {
        propertyID = allProperties[i];
        property = database.getProperty(propertyID);
        values = database.getObjects(itemID, propertyID);
        valueType = property.getValueType();

        if (values.size() > 0 && !(Exhibit.Exporter.BibTex._excludeProperties.hasOwnProperty(propertyID))) {
            s += "\t" + (propertyID === "label" ?
                         "title" :
                         propertyID) + " = \"";

            if (valueType === "item" || valueType === "url") {
                strings = [];
                values.visit(fn(valueType, strings));
            } else {
                strings = values.toArray();
            }

            s += strings.join(" and ") + "\",\n";
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
        "BibTex",
        Exhibit.l10n.exhibitBibTexExporterLabel,
        Exhibit.Exporter.BibTex.wrap,
        Exhibit.Exporter.BibTex.wrapOne,
        Exhibit.Exporter.BibTex.exportOne
    );
};

$(document).one("registerExporters.exhibit",
                Exhibit.Exporter.BibTex._register);
