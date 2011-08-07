/**
 * @fileOverview Instance of Exhibit.Exporter for RDF/XML.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace
 */
Exhibit.Exporter.RDFXML = {
    exporter: null
};

/**
 * @param {String} s
 * @param {Object} prefixToBase
 * @returns {String}
 */
Exhibit.Exporter.RDFXML.wrap = function(s, prefixToBase) {
    var s2, prefix;

    s2 = "<?xml version=\"1.0\"?>\n" +
        "<rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"\n"+
        "\txmlns:exhibit=\"http://simile.mit.edu/2006/11/exhibit#\"";

    for (prefix in prefixToBase) {
        if (prefixToBase.hasOwnProperty(prefix)) {
            s2 += "\n\txmlns:" + prefix + "=\"" + prefixToBase[prefix] + "\"";
        }
    }

    s2 += ">\n" + s + "\n</rdf:RDF>\n";

    return s2;
};

/**
 * @param {String} s
 * @returns {String}
 */
Exhibit.Exporter.RDFXML.wrapOne = function(s, first, last) {
    return s + "\n";
};

/**
 * @param {String} itemID
 * @param {Object} o
 * @param {Object} properties
 * @param {Object} propertyIDToQualifiedName
 * @param {Object} prefixToBase
 * @returns {String}
 */
Exhibit.Exporter.RDFXML.exportOne = function(itemID, o, properties, propertyIDToQualifiedName, prefixToBase) {
    var s = "", uri, i, propertyID, valueType, propertyString, j, values;
    uri = o["uri"];
    s += "<rdf:Description rdf:about=\"" + uri + "\">\n";

    for (propertyID in o) {
        if (o.hasOwnProperty(propertyID) && properties.hasOwnProperty(propertyID)) {
            valueType = properties[propertyID].valueType;
            if (propertyIDToQualifiedName.hasOwnProperty(propertyID)) {
                qname = propertyIDToQualifiedName[propertyID];
                propertyString = qname.prefix + ":" + qname.localName;
            } else {
                propertyString = properties[propertyID].uri;
            }

            if (valueType === "item") {
                values = o[propertyID];
                for (j = 0; j < values.length; j++) {
                    s += "\t<" + propertyString + " rdf:resource=\"" + values[j] + "\" />\n";
                }
            } else if (propertyID !== "uri") {
                values = o[propertyID];
                for (j = 0; j < values.length; j++) {
                    s += "\t<" + propertyString + ">" + value + "</" + propertyString + ">\n";
                }
            }
        }
    }
         
    s += "\t<exhibit:origin>" + Exhibit.Persistence.getItemLink(itemID) + "</exhibit:origin>\n";
    s += "</rdf:Description>";

    return s;
};

Exhibit.Exporter.RDFXML.exportMany = function(set, database) {
    var propertyIDToQualifiedName = {}, prefixToBase = {}, s = "";
    database.getNamespaces(propertyIDToQualifiedName, prefixToBase);
    set.visit(function(itemID) {
        s += this.wrapOne(this.exportOne(itemID, database, propertyIDToQualifiedName, prefixToBase));
    });
    return this.wrap(s, prefixToBase);
};

/**
 * @private
 */
Exhibit.Exporter.RDFXML._register = function() {
    Exhibit.Exporter.RDFXML.exporter = new Exhibit.Exporter(
        "application/rdf+xml",
        Exhibit.l10n.exhibitRDFXMLExporterLabel,
        Exhibit.Exporter.RDFXML.wrap,
        Exhibit.Exporter.RDFXML.wrapOne,
        Exhibit.Exporter.RDFXML.exportOne,
        Exhibit.Exporter.RDFXML.exportMany
    );
};

$(document).one("registerExporters.exhibit",
                Exhibit.Exporter.RDFXML._register);
