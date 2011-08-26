/**
 * @fileOverview View component.
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace
 */
Exhibit.View = {};

/**
 * @constant
 */
Exhibit.View._registryKey = "view";

/**
 *
 */
Exhibit.View._registerComponent = function() {
    if (!Exhibit.Registry.hasRegistry(Exhibit.View._registryKey)) {
        Exhibit.Registry.createRegistry(Exhibit.View._registryKey);
    }
};

$(document).one("registerComponents.exhibit",
                Exhibit.View._registerComponent);
