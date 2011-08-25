/**
 * @fileOverview Centralized component registry for easier API access.
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace
 */
Exhibit.Registry = {
    _registry: {},
    _components: []
};

/**
 * @static
 * @param {String} component
 * @returns {Boolean}
 */
Exhibit.Registry.createRegistry = function(component) {
    Exhibit.Registry._registry[component] = {};
    Exhibit.Registry._components.push(component);
};

/**
 * @static
 * @returns {Array}
 */
Exhibit.Registry.components = function() {
    return EXhibit.Registry._components;
};

/**
 * @static
 * @param {String} component
 * @returns {Boolean}
 */
Exhibit.Registry.hasRegistry = function(component) {
    return Exhibit.Registry._registry.hasOwnProperty(component);
};

/**
 * @static
 * @param {String} component
 * @param {String} type
 * @returns {Boolean}
 */
Exhibit.Registry.isRegistered = function(component, type) {
    return (Exhibit.Registry._registry.hasOwnProperty(component) &&
            Exhibit.Registry._registry[component].hasOwnProperty(type));
};

/**
 * @static
 * @param {String} component
 * @param {String} type
 * @param {Object} handler
 * @returns {Boolean}
 */
Exhibit.Registry.register = function(component, type, handler) {
    if (!Exhibit.Registry.isRegistered(component, type)) {
        Exhibit.Registry._registry[component][type] = handler;
        return true;
    } else {
        return false;
    }
};

/**
 * @static
 * @param {String} component
 * @returns {Object}
 */
Exhibit.Registry.componentHandlers = function(component) {
    if (Exhibit.Registry.hasRegistry(component)) {
        return Exhibit.Registry._registry[component];
    } else {
        // @@@ throw?
        return null;
    }
};

/**
 * @param {String} component
 * @returns {Array}
 */
Exhibit.Registry.getKeys = function(component) {
    var hash, key, keys;
    hash = Exhibit.Registry._registry[component];
    keys = [];
    for (key in hash) {
        if (hash.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    return keys;
};

/**
 * @static
 * @param {String} component
 * @param {String} type
 * @returns {Object}
 */
Exhibit.Registry.get = function(component, type) {
    if (Exhibit.Registry.isRegistered(component, type)) {
        return Exhibit.Registry._registry[component][type];
    } else {
        // @@@ or throw?
        return null;
    }
};

/**
 * @static
 * @param {String} component
 * @param {String} type
 * @returns {Boolean}
 */
Exhibit.Registry.unregister = function(component, type) {
    var c;
    if (Exhibit.Registry.isRegistered(component, type)) {
        c = Exhibit.Registry.get(component, type);
        if (typeof c.dispose === "function") {
            c.dispose();
        }
        Exhibit.Registry._registry[component][type] = null;
        delete Exhibit.Registry._registry[component][type];
    }
};
