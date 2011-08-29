/**
 * @fileOverview Instance of Exhibit.Exporter for bookmarking display.  This
 *    is a temporary placeholder for a real bookmarking widget.
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace
 */
Exhibit.Exporter.Bookmark = {
    exporter: null
};

/**
 * @param {String} s
 * @returns {String}
 */
Exhibit.Exporter.Bookmark.wrap = function(s) {
    return s;
};

/**
 * @param {String} s
 * @param {Boolean} first
 * @param {Boolean} last
 * @returns {String}
 */
Exhibit.Exporter.Bookmark.wrapOne = function(s, first, last) {
    return s;
};

/**
 * @param {String} itemID
 * @param {Object} o
 * @returns {String}
 */
Exhibit.Exporter.Bookmark.exportOne = function(itemID, o) {
    return null;
};

/**
 * @param {Exhibit.Set} set
 * @param {Exhibit.Database} database
 * @depends Exhibit.Bookmark
 */
Exhibit.Exporter.Bookmark.exportMany = function(set, database) {
    return Exhibit.Bookmark.generateBookmark();
};

/**
 * @private
 */
Exhibit.Exporter.Bookmark._register = function() {
    Exhibit.Exporter.Bookmark.exporter = new Exhibit.Exporter(
        "text/url",
        "Bookmark",
        null,
        null,
        null,
        Exhibit.Exporter.Bookmark.exportMany
    );
};

$(document).one("registerExporters.exhibit",
                Exhibit.Exporter.Bookmark._register);
