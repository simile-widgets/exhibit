/**
 * @fileOverview Read Google Docs Spreadsheet JSONP feed.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace
 */
Exhibit.Importer.JSONP.GoogleSpreadsheet = {
    _type: "googleSpreadsheets",
    _dateRegex: /^\d{1,2}\/\d{1,2}\/\d{4}$/
};

/**
 * @private
 * @static
 * @param {jQuery.Event} evt
 * @param {Exhibit.Registry} reg
 */
Exhibit.Importer.JSONP.GoogleSpreadsheet._register = function(evt, reg) {
    if (!reg.isRegistered(
        Exhibit.Importer.JSONP._registryKey,
        Exhibit.Importer.JSONP.GoogleSpreadsheet._type)) {
        reg.register(
            Exhibit.Importer.JSONP._registryKey,
            Exhibit.Importer.JSONP.GoogleSpreadsheet._type,
            Exhibit.Importer.JSONP.GoogleSpreadsheet
        );
    }
};

/**
 * @static
 * @param {Object} json
 * @param {String} url
 * @param {String|Element} link
 * @returns {Object}
 */
Exhibit.Importer.JSONP.GoogleSpreadsheet.transformJSON = function(json, url, link) {
    var separator, s, items, properties, types, valueTypes, entries, i, entry, id, c, r, cellIndex, getNextRow, propertyRow, propertiesByColumn, cell, fieldSpec, fieldName, fieldDetails, property, d, detail, row, fieldValues, v;
    separator = ";";

    if (typeof link !== "undefined" && link !== null && typeof link !== "string") {
        s = Exhibit.getAttribute(link, "separator");
        if (s !== null && s.length > 0) {
            separator = s;
        }
    }
    
    items = [];
    properties = {};
    types = {};
    valueTypes = {
        "text" : true,
        "number" : true,
        "item" : true,
        "url" : true,
        "boolean" : true,
        "date" : true
    };

    entries = json.feed.entry || []; // if no entries in feed
    for (i = 0; i < entries.length; i++) {
        entry = entries[i];
        id = entry.id.$t;
        c = id.lastIndexOf("C");
        r = id.lastIndexOf("R");
        
        entries[i] = {
            "row": parseInt(id.substring(r + 1, c), 10) - 1,
            "col": parseInt(id.substring(c + 1), 10) - 1,
            "val": entry.content.$t
        };
    };
    
    cellIndex = 0;
    getNextRow = function() {
        var firstEntry, row, nextEntry;
        if (cellIndex < entries.length) {
            firstEntry = entries[cellIndex++];
            row = [ firstEntry ];
            while (cellIndex < entries.length) {
                nextEntry = entries[cellIndex];
                if (nextEntry.row == firstEntry.row) {
                    row.push(nextEntry);
                    cellIndex++;
                } else {
                    break;
                }
            }
            return row;
        }
        return null;
    };
    
    propertyRow = getNextRow();
    if (propertyRow != null) {
        propertiesByColumn = [];
        for (i = 0; i < propertyRow.length; i++) {
            cell = propertyRow[i];
            
            fieldSpec = cell.val.trim().replace(/^\{/g, "").replace(/\}$/g, "").split(":");
            fieldName = fieldSpec[0].trim();
            fieldDetails = fieldSpec.length > 1 ? fieldSpec[1].split(",") : [];
            
            property = { single: false };
            
            for (d = 0; d < fieldDetails.length; d++) {
                detail = fieldDetails[d].trim();
                if (typeof valueTypes[detail] !== null) {
                    property.valueType = detail;
                } else if (detail === "single") {
                    property.single = true;
                }
            }
            
            propertiesByColumn[cell.col] = fieldName;
            properties[fieldName] = property;
        }
        
        row = null;
        while ((row = getNextRow()) !== null) {
            item = {};
            
            for (i = 0; i < row.length; i++) {
                cell = row[i];
                fieldName = propertiesByColumn[cell.col];
                if (typeof fieldName === "string") {
                    // ensure round-trip iso8601 date strings through google docs
                    if (Exhibit.Importer.JSONP.GoogleSpreadsheet._dateRegex.exec(cell.val)) {
                        cell.val = Exhibit.Database.makeISO8601DateString(new Date(cell.val));
                    }

                    item[fieldName] = cell.val;
                    
                    property = properties[fieldName];
                    if (!property.single) {
                        fieldValues = cell.val.split(separator);
                        for (v = 0; v < fieldValues.length; v++) {
                            fieldValues[v] = fieldValues[v].trim();
                        }
                        item[fieldName] = fieldValues;
                    } else {
                        item[fieldName] = cell.val.trim();
                    }
                }
            }
            
            items.push(item);
        }
    }
    
    return {
        "types": types,
        "properties": properties,
        "items": items
    };    
};

/**
 * @param {String} url
 * @returns {String}
 */
Exhibit.Importer.JSONP.GoogleSpreadsheet.preprocessURL = function(url) {
    return url.replace(/\/list\//g, "/cells/");
};

Exhibit.jQuery(document).one(
    "registerJSONPImporters.exhibit",
    Exhibit.Importer.JSONP.GoogleSpreadsheet._register
);
