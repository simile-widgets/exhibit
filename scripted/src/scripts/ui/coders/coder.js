/**
 * @fileOverview Coder component.
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace
 */
Exhibit.Coder = {
    /**
     * @private
     * @constant
     */
    _registryKey: "coder"
};

/**
 * @private
 * @param {jQuery.Event} evt
 * @param {Exhibit.Registry} reg
 */
Exhibit.Coder._registerComponent = function(evt, reg) {
    if (!reg.hasRegistry(Exhibit.Coder._registryKey)) {
        reg.createRegistry(Exhibit.Coder._registryKey);
    }
};

$(document).one("registerComponents.exhibit",
                Exhibit.Coder._registerComponent);
