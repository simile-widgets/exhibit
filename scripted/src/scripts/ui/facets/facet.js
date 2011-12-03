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
 * @private
 */
Exhibit.Facet._registry = null;

/**
 * @private
 * @param {jQuery.Event} evt
 * @param {Exhibit.Registry} reg
 */
Exhibit.Facet._registerComponent = function(evt, reg) {
    Exhibit.Facet._registry = reg;
    if (!reg.hasRegistry(Exhibit.Facet._registryKey)) {
        reg.createRegistry(Exhibit.Facet._registryKey);
        $(document).trigger("registerFacets.exhibit");
    }
};

$(document).one("registerComponents.exhibit",
                Exhibit.Facet._registerComponent);
