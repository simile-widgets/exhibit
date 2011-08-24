/**
 * This requires the entire Exhibit infrastructure to be oriented around
 * generating registered state changes.
 */

/**
 * @fileOverview Local interface to a history manager.
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace For history management related methods.
 */
Exhibit.History = {
    /**
     * Whether the history module is available.
     */
    enabled: false,

    /**
     * @private
     */
    _state: 0,

    /**
     * @private
     */
    _originalTitle: "",

    /**
     * @private
     */
    _originalLocation: ""
};

/**
 * @depends History.js
 */
Exhibit.History.init = function() {
    var state, types, i, j, keys, component;

    if (typeof History !== "undefined" && History.enabled) {
        Exhibit.History.enabled = true;
        Exhibit.History._originalTitle = document.title;
        Exhibit.History._originalLocation = Exhibit.Persistence.getURLWithoutQueryAndHash();

        $(window).bind("statechange", Exhibit.History.stateListener);
        if (Exhibit.Bookmark.runBookmark()) {
            Exhibit.Bookmark.implementBookmark(Exhibit.Bookmark.state);
        } else {
            state = Exhibit.History.getState();
            if (typeof state.data.components === "undefined") {
                state.data.components = {};
                state.data.state = Exhibit.History._state;
                types = [ "facet", "view", "viewPanel" ];
                for (i = 0; i < types.length; i++) {
                    keys = Exhibit.Registry.getKeys(types[i]);
                    for (j = 0; j < keys.length; j++) {
                        component = Exhibit.Registry.get(types[i], keys[j]);
                        if (typeof component.exportState === "function") {
                            state.data.components[keys[j]] = {};
                            state.data.components[keys[j]].type = types[i];
                            state.data.components[keys[j]].state = component.exportState();
                        }
                    }
                }
                Exhibit.History.replaceState(state.data);
            }
            Exhibit.History.stateListener();
        }
    }
};

/**
 * @param {jQuery.Event} evt
 */
Exhibit.History.stateListener = function(evt) {
    var fullState, components, key, id, componentState, component;

    fullState = Exhibit.History.getState();

    if (fullState.data.lengthy) {
        $(document).trigger("busyDialogStart.exhibit");
    }

    components = fullState.data.components;
    for (key in components) {
        console.log(key);
        if (components.hasOwnProperty(key)) {
            componentState = components[key].state;
            component = Exhibit.Registry.get(components[key].type, key);
            if (component !== null &&
                typeof component.importState === "function") {
                console.log(componentState);
                component.importState(componentState);
            }
        }
    }
    Exhibit.History._state = fullState.data.state || 0;

    if (fullState.data.lengthy) {
        $(document).trigger("busyDialogEnd.exhibit");
    }
};

/**
 * Passes through to History.js History.getState function.
 *
 * @static
 * @returns {Object}
 */
Exhibit.History.getState = function() {
    if (Exhibit.History.enabled) {
        return History.getState();
    } else {
        return null;
    }
};

Exhibit.History.pushComponentState = function(component, registry, data, subtitle, lengthy) {
    var state = Exhibit.History.getState();

    if (typeof state === "undefined" || state === null) {
        state = { "data": { "components": {} } };
    }

    if (!state.hasOwnProperty("data")) {
        state.data = { "components": {} };
    }
    if (!state.data.hasOwnProperty("components")) {
        state.data.components = {};
    }

    state.data.lengthy = lengthy;
    state.data.components[component.getID()] = {
        "type": registry,
        "state": data
    }

    Exhibit.History.pushState(state.data, subtitle);
};

/**
 * Passes through to History.js History.pushState function.
 * 
 * @static
 * @param {Object} data
 * @param {String} subtitle
 */
Exhibit.History.pushState = function(data, subtitle) {
    var title, url;

    if (Exhibit.History.enabled) {
        Exhibit.History._state++;
        data.state = Exhibit.History._state;

        title = Exhibit.History._originalTitle;

        if (typeof subtitle !== "undefined" &&
            subtitle !== null &&
            subtitle !== "") {
            title += " {" + subtitle + "}";
        }
        
        url = Exhibit.History._originalLocation;
        
        History.pushState(data, title, url);
    }
};

/**
 * Passes through to History.js History.replaceState function.
 * 
 * @static
 * @param {Object} data
 * @param {String} subtitle
 */
Exhibit.History.replaceState = function(data, subtitle, url) {
    var title;

    if (Exhibit.History.enabled) {
        title = Exhibit.History._originalTitle;

        if (typeof subtitle !== "undefined" &&
            subtitle !== null &&
            subtitle !== "") {
            title += " {" + subtitle + "}";
        }

        if (typeof url === "undefined" || url === null) {
            url = Exhibit.History._originalLocation;
        }
        
        History.replaceState(data, title, url);
    }
};
