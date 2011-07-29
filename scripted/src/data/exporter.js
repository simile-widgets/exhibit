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
 * @param {Function} exportOne Function taking at minimum an item identifier
 *    and a database, returning a string.
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
Exhibit.Exporter._registerComponent = "exporter";

/**
 * @static
 */
Exhibit.Exporter._registerComponent = function() {
    if (!Exhibit.Registry.hasRegistry(Exhibit.Exporter._registerComponent)) {
        Exhibit.Registry.createRegistry(Exhibit.Exporter._registerComponent);
    }
};

/**
 * @returns {Boolean}
 */
Exhibit.Exporter.prototype.register = function() {
    if (!Exhibit.Registry.isRegistered(this._registerComponent, this._mimeType)) {
        Exhibit.Registry.register(this._registerComponent, this._mimeType, this);
        return true;
    } else {
        return false;
    }
};

/**
 *
 */
Exhibit.Exporter.prototype.dispose = function() {
    Exhibit.Registry.unregister(this._registerComponent, this._mimeType);
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
 * @returns {String}
 */
Exhibit.Exporter.prototype.exportOne = function(itemID, database) {
    return this._wrap(this._exportOne(itemID,
                                      database,
                                      arguments.splice(0, 2)),
                      database,
                      arguments.splice(0, 2));
};

/**
 * @param {Exhibit.Set} set
 * @param {Exhibit.Database} database
 * @returns {String}
 */
Exhibit.Exporter.prototype.exportMany = function(set, database) {
    if (typeof this._exportMany !== "undefined") {
        this.exportMany = this._exportMany;
        return this._exportMany(set, database);
    }

    var s = "", self = this, count = 0, size = set.size();
    set.visit(function(itemID) {
        s += self._wrapOne(self._exportOne(itemID,
                                           database,
                                           arguments.splice(0, 2)),
                           count === 0,
                           count++ === size - 1,
                           arguments.splice(0, 2));
    });
    return s;
};

$(document).once("registerComponents.exhibit",
                 Exhibit.Exporter._registerComponent());
