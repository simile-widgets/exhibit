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

Exhibit.View.addViewState = function(id, state) {
    var fullState;

    fullState = Exhibit.History.getState();
    // If History has been initialized already; don't worry if not
    if (fullState !== null) {
        if (typeof fullState.data.components[id] === "undefined") {
            fullState.data.components[id] = {
                "state": state,
                "type": Exhibit.View._registryKey
            };
            Exhibit.History.replaceState(fullState.data);
        } else {
            $(document).trigger("importReady.exhibit",
                                [Exhibit.View._registryKey, id]);
        }
    }
};

$(document).one("registerComponents.exhibit",
                Exhibit.View._registerComponent);
