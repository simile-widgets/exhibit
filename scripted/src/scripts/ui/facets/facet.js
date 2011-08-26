/**
 * @fileOverview Basic facet component registration.
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace
 */
Exhibit.Facet = {};

/**
 * @constant
 */
Exhibit.Facet._registryKey = "facet";

/**
 *
 */
Exhibit.Facet._registerComponent = function() {
    if (!Exhibit.Registry.hasRegistry(Exhibit.Facet._registryKey)) {
        Exhibit.Registry.createRegistry(Exhibit.Facet._registryKey);
        $(document).trigger("registerFacets.exhibit");
    }
};

$(document).one("registerComponents.exhibit",
                Exhibit.Facet._registerComponent);
