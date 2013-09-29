/**
 * @fileOverview General class for data exporter.
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @class
 * @constructor
 * @param {String} mimeType
 * @param {String} label
 * @param {Function} wrap Function taking at minimum a string and a database,
 *    returning a string.
 * @param {Function} wrapOne Function taking at minimum a string, a boolean
 *    for first, and a boolean for last, returning a string.
 * @param {Function} exportOne Function taking at minimum an item identifier,
 *    the item itself, and a hash of properties, returning a string.
 * @param {Function} [exportMany] Function taking a set and a database,
 *    returning a string, which overrides the default exportMany that uses
 *    the other three functions in conjunction.
 */
Exhibit.Exporter = function(mimeType, label, wrap, wrapOne, exportOne, exportMany) {
    this._mimeType = mimeType;
    this._label = label;
    this._wrap = wrap;
    this._wrapOne = wrapOne;
    this._exportOne = exportOne;
    this._exportMany = exportMany;
    this._registered = this.register();
};

/**
 * @private
 * @constant
 */
Exhibit.Exporter._registryKey = "exporter";

/**
 * @private
 */
Exhibit.Exporter._registry = null;

/**
 * @static
 * @param {Exhibit._Impl} ex
 */
Exhibit.Exporter._registerComponent = function(evt, reg) {
    Exhibit.Exporter._registry = reg;
    if (!reg.hasRegistry(Exhibit.Exporter._registryKey)) {
        reg.createRegistry(Exhibit.Exporter._registryKey);
        Exhibit.jQuery(document).trigger("registerExporters.exhibit");
    }
};

/**
 * @returns {Boolean}
 */
Exhibit.Exporter.prototype.register = function() {
    var reg = Exhibit.Exporter._registry;
    if (!reg.isRegistered(
        Exhibit.Exporter._registryKey,
        this._mimeType
    )) {
        reg.register(
            Exhibit.Exporter._registryKey,
            this._mimeType,
            this
        );
        return true;
    } else {
        return false;
    }
};

/**
 *
 */
Exhibit.Exporter.prototype.dispose = function() {
    Exhibit.Exporter._registry.unregister(
        Exhibit.Exporter._registryKey,
        this._mimeType
    );
};

/**
 * @returns {Boolean}
 */
Exhibit.Exporter.prototype.isRegistered = function() {
    return this._registered;
};

/**
 * @returns {String}
 */
Exhibit.Exporter.prototype.getLabel = function() {
    return this._label;
};

/**
 * @param {String} itemID
 * @param {Exhibit.Database} database
 * @returns {Object}
 */
Exhibit.Exporter.prototype.exportOneFromDatabase = function(itemID,
                                                            database, 
                                                            props) {
    var fn, prop, values, valueType, item;

    fn = function(vt, s) {
        if (vt === "item") {
            return function(value) {
                s.push(database.getObject(value, "label") || value);
            };
        } else if (vt === "url") {
            return function(value) {
                s.push(Exhibit.Persistence.resolveURL(value));
            };
        }
    };

    props = props || 
        Exhibit.Exporter._getPropertyMap(database);
    item = {};

    for (prop in props) {
        if (props.hasOwnProperty(prop)) {
            values = database.getObjects(itemID, prop);
            valueType = props[prop].valueType;
            
            if (values.size() > 0) {
                if (valueType === "item" || valueType === "url") {
                    strings = [];
                    values.visit(fn(valueType, strings));
                } else {
                    strings = values.toArray();
                }
                item[prop] = strings;
            }
        }
    }

    return item;
};

/**
 * @param {String} itemID
 * @param {Exhibit.Database} database
 * @returns {String}
 */
Exhibit.Exporter.prototype.exportOne = function(itemID, database, props) {
    props = props || Exhibit.Exporter._getPropertyMap(database);
    return this._wrap(
        this._exportOne(
            itemID,
            this.exportOneFromDatabase(itemID, database),
            props 
        ),
        database,
        props
    );
};

/**
 * @param {Exhibit.Set} set
 * @param {Exhibit.Database} database
 * @returns {String}
 */
Exhibit.Exporter.prototype.exportMany = function(set, database) {
    var s = "", self = this, count = 0, size = set.size(), props
    , wraps = [];

    if (typeof this._exportMany !== "undefined" && typeof this._exportMany === "function") {
        this.exportMany = this._exportMany;
        return this._exportMany(set, database);
    }

    props = Exhibit.Exporter._getPropertyMap(database);
    set.visit(function(itemID) {
        wraps.push( 
            self._wrapOne(
                self._exportOne(
                    itemID,
                    self.exportOneFromDatabase(itemID, database),
                    props)
                ,
                count === 0,
                count++ === size - 1
            ));
    });
    return this._wrap(wraps.join(""), database, props);
};

/**
 * @private
 * @static
 * @param {Exhibit.Database} database
 */
Exhibit.Exporter._getPropertyMap = function(database) {
    var properties, i, propertyID, property, map;
    map = {};
    properties = database.getAllProperties();
    for (i = 0; i < properties.length; i++) {
        propertyID = properties[i];
        property = database.getProperty(propertyID);
        map[propertyID] = { "label" : property.getLabel(),
                            "valueType": property.getValueType(),
                            "uri": property.getURI() };
    }
    return map;
};

Exhibit.jQuery(document).one(
    "registerStaticComponents.exhibit",
    Exhibit.Exporter._registerComponent
);
