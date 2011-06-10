/**
 * @fileOverview Methods for generating and interpreting session state
 *               bookmarks.
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace Bookmarking the current state of a browsing session.
 */
Exhibit.Bookmark = {};

/**
 * Generate a string that can be used as the hash portion of a URI
 * to be used for bookmarking the current state of an Exhibit browsing
 * session.
 *
 * @static
 * @param state {Object} An JSON serializable object fully describing
 *                       the current state.
 * @returns {String} The Base64-encoded string representing a JSON
 *                   serialized object.
 * @depends JSON
 * @depends Base64
 */
Exhibit.Bookmark.generateBookmarkHash = function(state) {
    if (typeof state.data.state === "undefined") {
        return "";
    }
    // Other subsystems also examine the hash and will do the wrong
    // thing if a '/' character is present.  Substitute it and do
    // the opposite substitution for interpretation.
    return Base64.encode(JSON.stringify(state.replace(/\//g, '|')));
};

/**
 * Turn a bookmark hash into a representation of state.
 *
 * @static
 * @param hash {String} A Base64-encoded string representing a JSON
 *                      serialized object.
 * @returns {Object} The deserialized object represented by the hash.
 * @depends JSON
 * @depends Base64
 */
Exhibit.Bookmark.interpretBookmarkHash = function(hash) {
    // See generateBookmarkHash.
    return JSON.parse(Base64.decode(hash.replace(/\|/g, '/')));
};

/**
 * Given the current page state from History.js, make a bookmark URI.
 *
 * @static
 * @returns {String} The bookmark URI
 * @depends History.js
 */
Exhibit.Bookmark.generateBookmark = function() {
    var hash = Exhibit.Bookmark.generateBookmarkHash(History.getState());
    return document.location.href + ((hash === "") ? "": "#" + hash);
};

/**
 * Change the state of the page given an interpreted bookmark hash.
 *
 * @static
 * @param state {Object} The interpreted bookmark hash as the state
 *                       object History.js uses.
 * @depends History.js
 */
Exhibit.Bookmark.implementBookmark = function(state) {
    History.replaceState(state.data, state.title, state.url);
};

/**
 * When run, examine this page's URI for a hash and try to interpret and
 * implement it.
 *
 * @static
 */
Exhibit.Bookmark.init = function() {
    if (document.location.hash.length > 0) {
        Exhibit.Bookmark.implementBookmark(Exhibit.Bookmark.interpretBookmarkHash(document.location.hash.substr(1)));
    }
};

$(document).ready(function() {
    Exhibit.Bookmark.init();
});
