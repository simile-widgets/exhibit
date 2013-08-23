/**
 * @fileOverview Support methods surrounding generating a URL for an item
 *               in the database.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace Contains support methods for generating persistent URLs for
 *            items in an Exhibit database.
 */
Exhibit.Persistence = {
    /**
     * Cached URL without query portion.
     */
    "_urlWithoutQuery": null,

    /**
     * Cached URL without query and hash portions.
     */
    "_urlWithoutQueryAndHash": null
};

/**
 * Given a relative or absolute URL, determine the fragment of the
 * corresponding absolute URL up to its last '/' character (relative URLs
 * are resolved relative to the document location).
 * 
 * @param {String} url Starting URL to derive a base URL from.
 * @returns {String} The base URL.
 */
Exhibit.Persistence.getBaseURL = function(url) {
    // HACK: for some unknown reason Safari keeps throwing
    //      TypeError: no default value
    // when this function is called from the RDFa importer. So I put a try catch here.
    var url2, i;
    try {
        url = Exhibit.Persistence.resolveURL(url);
        i = url.indexOf("#");
        if (i >= 0) {
            url = url.substr(0, i);
        }
        i = url.lastIndexOf("/");
        if (i < 0) {
            return "";
        } else {
            return url.substr(0, i + 1);
        }
    } catch (e) {
        return url;
    }
};

/**
 * Given a relative or absolute URL, return the absolute URL (resolving
 * relative to the document location). 
 *
 * @param {String} url The orignal URL to resolve.
 * @returns {String} The resolved URL.
 */
(function () {
    var a = document.createElement('a');

    Exhibit.Persistence.resolveURL = function (url) {
        a.href = url; 
        return a.href; //browser magic converts to absolute
    };
})();

/**
 * Return the current document location without the query and hash portions
 * of the URL.
 *
 * @returns {String} The document's location without query and hash portions.
 */
Exhibit.Persistence.getURLWithoutQueryAndHash = function() {
    return document.location.origin + document.location.pathname;
};

/**
 * Return a URL to one item in this Exhibit, encoding it as a hash relative to
 * the URL without query and hash. 
 *
 * @param {String} itemID The item's database identifier.
 * @returns {String} A URL to Exhibit highlighting the item.
 */
Exhibit.Persistence.getItemLink = function(itemID) {
    return Exhibit.Persistence.resolveURL("#" + encodeURIComponent(itemID));
};
