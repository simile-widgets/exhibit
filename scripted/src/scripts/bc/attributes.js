/**
 * @fileOverview Methods for handling older Exhibit attribute styles. Only
 *     load if the page-based config seems to contain a namespace / attributes
 *     that reflect the old style (e.g., ex:role) instead of the new style.
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace
 */
Exhibit.Backwards.Attributes = {
    "prefix": "ex:"
};

/**
 * Call to switch Exhibit into backwards compatibility mode for Exhibit
 * attributes.
 * @static
 */
Exhibit.Backwards.Attributes.enable = function() {
    Exhibit.Backwards.enabled.Attributes = true;
    Exhibit.getAttribute = Exhibit.Backwards.Attributes.getAttribute;
    Exhibit.extractOptionsFromElement = Exhibit.Backwards.Attributes.extractOptionsFromElement;
    Exhibit.isExhibitAttribute = Exhibit.Backwards.Attributes.isExhibitAttribute;
    Exhibit.makeExhibitAttribute = Exhibit.Backwards.Attributes.makeExhibitAttribute;
    Exhibit.extractAttributeName = Exhibit.Backwards.Attributes.extractAttributeName;
};

/**
 * A backwards compatible mechanism for retrieving an Exhibit attribute value.
 * @static
 * @param {jQuery|Element} elmt
 * @param {String} name
 * @param {String} splitOn
 * @returns {String|Array}
 */
Exhibit.Backwards.Attributes.getAttribute = function(elmt, name, splitOn) {
    var value, i, values;

    try {
        value = Exhibit.jQuery(elmt).attr(name);
        if (typeof value === "undefined" || value === null || value.length === 0) {
            value = Exhibit.jQuery(elmt).attr(Exhibit.Backwards.Attributes.prefix+name);
            if (typeof value === "undefined" || value === null || value.length === 0) {
                return null;
            }
        }
        if (typeof splitOn === "undefined" || splitOn === null) {
            return value;
        }
        values = value.split(splitOn);
        for (i = 0; i < values.length; i++) {
            values[i] = values[i].trim();
        }
        return values;
    } catch(e) {
        return null;
    }
};

/**
 * A backwards compatible mechanism for retrieving all Exhibit attributes
 * on an element.
 * @static
 * @param {Element} elmt
 * @returns {Object}
 */
Exhibit.Backwards.Attributes.extractOptionsFromElement = function(elmt) {
    var opts, attrs, i, name, value;
    opts = {};
    attrs = elmt.attributes;
    for (i in attrs) {
        if (attrs.hasOwnProperty(i)) {
            name = attrs[i].nodeName;
            value = attrs[i].nodeValue;
            if (name.indexOf(Exhibit.Backwards.Attributes.prefix) === 0) {
                name = name.substring(Exhibit.Backwards.Attributes.prefix.length);
            }
            opts[name] = value;
        }
    }
    return opts;
};

/**
 * @static
 * @param {String} name
 * @returns {Boolean}
 */
Exhibit.Backwards.Attributes.isExhibitAttribute = function(name) {
    var prefix = Exhibit.Backwards.Attributes.prefix;
    return name.length > prefix.length
        && name.startsWith(prefix);
};

/**
 * @static
 * @param {String} name
 */
Exhibit.Backwards.Attributes.extractAttributeName = function(name) {
    return name.substr(Exhibit.Backwards.Attributes.prefix.length);
};

/**
 * @static
 * @param {String} name
 * @returns {String}
 */
Exhibit.Backwards.Attributes.makeExhibitAttribute = function(name) {
    return Exhibit.Backwards.Attributes.prefix + name;
};
