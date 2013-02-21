/**
 * @fileOverview
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace
 */
Exhibit.Importer.ExhibitJSON = {
    _importer: null
};

/**
 * @param {String} url
 * @param {String} s
 * @param {Function} callback
 * @depends JSON
 */
Exhibit.Importer.ExhibitJSON.parse = function(url, s, callback) {
    var o = null;

    try {
        o = JSON.parse(s);
    } catch(e) {
        Exhibit.UI.showJsonFileValidation(Exhibit._("%general.badJsonMessage", url, e.message), url);
    }

    if (typeof callback === "function") {
        callback(o);
    }
};

/**
 * @private
 */
Exhibit.Importer.ExhibitJSON._register = function() {
    Exhibit.Importer.ExhibitJSON._importer = new Exhibit.Importer(
        "application/json",
        "get",
        Exhibit.Importer.ExhibitJSON.parse
    );
};

Exhibit.jQuery(document).one("registerImporters.exhibit",
                Exhibit.Importer.ExhibitJSON._register);
