/**
 * @fileOverview General backwards compatibility material.
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace
 */
Exhibit.Backwards = {
    "enabled": {
        "Attributes": false
    }
};

/**
 * Enable a backwards compatibility module.
 * @param {String} module
 */
Exhibit.Backwards.enable = function(module) {
    Exhibit.Backwards[module].enable();
};
