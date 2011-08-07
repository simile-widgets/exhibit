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
     *
     */
    enabled: false,

    /**
     * @private
     */
    _registeredComponents: [],

    /**
     * @private
     */
    _state: 0,

    /**
     * @private
     */
    _originalTitle: ''
};

/**
 * 
 *
 * @depends History.js
 */
Exhibit.History.init = function() {
    if (typeof History !== "undefined" && History.enabled) {
        Exhibit.History.enabled = true;
        Exhibit.History._originalTitle = document.title;

        Exhibit.History.stateListener();
        $(window).bind('statechange', Exhibit.History.stateListener);
        // initial state without bookmarking lacks a title, replaceState
        // should run if no bookmark was executed first to set the title
        // appropriately
        if (!Exhibit.Bookmark.run) {
            Exhibit.History.pushState(null, Exhibit.History._originalTitle, null);
        }
    }
};

/**
 *
 */
Exhibit.History.stateListener = function() {
};

/**
 * Register any thing on the page that maintains state in response to user
 * interaction.  Registered components are polled after each interaction
 * to gather history tracking information.  Each component must implement
 * the method getState that returns identifying information and the current
 * state, enough to replicate the current state to a different user.
 *
 */
Exhibit.History.register = function() {
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

/**
 * Passes through to History.js History.pushState function.
 * 
 * @static
 * @param data {Object}
 * @param title {String}
 * @param url {String}
 */
Exhibit.History.pushState = function(data, title, url) {
    if (Exhibit.History.enabled) {
        History.pushState(data, title, url);
    }
};

/**
 * Passes through to History.js History.replaceState function.
 * 
 * @static
 * @param data {Object}
 * @param title {String}
 * @param url {String}
 */
Exhibit.History.replaceState = function(data, title, url) {
    if (Exhibit.History.enabled) {
        History.replaceState(data, title, url);
    }
};
