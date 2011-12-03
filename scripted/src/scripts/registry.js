/**
 * @fileOverview Centralized component registry for easier API access.
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace
 * @class
 */
Exhibit.Registry = function() {
    this._registry = {};
    this._untyped = {};
    this._components = [];
};

/**
 * @param {String} component
 * @returns {Boolean}
 */
Exhibit.Registry.prototype.createRegistry = function(component) {
    this._registry[component] = {};
    this._components.push(component);
};

/**
 * @returns {Array}
 */
Exhibit.Registry.prototype.components = function() {
    return this._components;
};

/**
 * @param {String} component
 * @returns {Boolean}
 */
Exhibit.Registry.prototype.hasRegistry = function(component) {
    return typeof this._registry[component] !== "undefined";
};

/**
 * @param {String} component
 * @param {String} id
 * @returns {Boolean}
 */
Exhibit.Registry.prototype.isRegistered = function(component, id) {
    return (this.hasRegistry(component) &&
            typeof this._registry[component][id] !== "undefined");
};

/**
 * @param {String} component
 * @param {String} id
 * @param {Object} handler
 * @returns {Boolean}
 */
Exhibit.Registry.prototype.register = function(component, id, handler) {
    if (!this.isRegistered(component, id)) {
        this._registry[component][id] = handler;
        return true;
    } else {
        return false;
    }
};

/**
 * @param {String} component
 * @returns {Object}
 */
Exhibit.Registry.prototype.componentHandlers = function(component) {
    if (this.hasRegistry(component)) {
        return this._registry[component];
    } else {
        // @@@ throw?
        return null;
    }
};

/**
 * @param {String} component
 * @returns {Array}
 */
Exhibit.Registry.prototype.getKeys = function(component) {
    var hash, key, keys;
    hash = this._registry[component];
    keys = [];
    for (key in hash) {
        if (hash.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    return keys;
};

/**
 * @param {String} component
 * @param {String} id
 * @returns {Object}
 */
Exhibit.Registry.prototype.get = function(component, id) {
    if (this.isRegistered(component, id)) {
        return this._registry[component][id];
    } else {
        // @@@ or throw?
        return null;
    }
};

/**
 * @param {String} component
 * @param {String} id
 * @returns {Boolean}
 */
Exhibit.Registry.prototype.unregister = function(component, id) {
    var c;
    if (this.isRegistered(component, id)) {
        c = this.get(component, id);
        //if (typeof c.dispose === "function") {
        //    c.dispose();
        //}
        this._registry[component][id] = null;
        delete this._registry[component][id];
    }
};
