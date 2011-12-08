/**
 * @fileOverview View component.
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace
 */
Exhibit.View = {};

/**
 * @private
 * @constant
 */
Exhibit.View._registryKey = "view";

/**
 * @private
 * @param {jQuery.Event} evt
 * @param {Exhibit.Registry} reg
 */
Exhibit.View._registerComponent = function(evt, reg) {
    if (!reg.hasRegistry(Exhibit.View._registryKey)) {
        reg.createRegistry(Exhibit.View._registryKey);
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
