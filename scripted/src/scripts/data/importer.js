/**
 * @fileOverview General class for data importer.
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @class
 * @constructor
 * @param {String} mimeType
 * @param {String} loadType
 * @param {String} label
 * @param {Function} parse
 */
Exhibit.Importer = function(mimeType, loadType, parse) {
    this._mimeType = mimeType;
    this._loadType = loadType;
    this._parse = parse;
    this._registered = this.register();
};

/**
 * @private
 * @constant
 */
Exhibit.Importer._registryKey = "importer";

/**
 * @static
 */
Exhibit.Importer._registerComponent = function() {
    if (!Exhibit.Registry.hasRegistry(Exhibit.Importer._registryKey)) {
        Exhibit.Registry.createRegistry(Exhibit.Importer._registryKey);
        $(document).trigger("registerImporters.exhibit");
    }
};

/**
 * @static
 * @param {String} mimeType
 * @returns {Exhibit.Importer}
 */
Exhibit.Importer.getImporter = function(mimeType) {
    return Exhibit.Registry.get(Exhibit.Importer._registryKey, mimeType);
};

/**
 * @returns {Boolean}
 */
Exhibit.Importer.prototype.register = function() {
    if (!Exhibit.Registry.isRegistered(Exhibit.Importer._registryKey,
                                       this._mimeType)) {
        Exhibit.Registry.register(Exhibit.Importer._registryKey,
                                  this._mimeType, this);
        return true;
    } else {
        return false;
    }
};

/**
 *
 */
Exhibit.Importer.prototype.dispose = function() {
    Exhibit.Registry.unregister(Exhibit.Importer._registryKey, this._mimeType);
};

/**
 * @returns {Boolean}
 */
Exhibit.Importer.prototype.isRegistered = function() {
    return this._registered;
};

/**
 * @param {String} type
 * @param {Element|String} link
 * @param {Exhibit.Database} database
 * @param {Function} callback
 */
Exhibit.Importer.prototype.load = function(link, database, callback) {
    var resolver, url, postLoad, postParse, self;
    url = typeof link === "string" ? link : $(link).attr("href");
    url = Exhibit.Persistence.resolveURL(url);

    switch(this._loadType) {
    case "babel":
        resolver = this._loadBabel;
        break;
    case "jsonp":
        resolver = this._loadJSONP;
        break;
    default:
        resolver = this._loadURL;
        break;
    }

    postParse = function(o) {
        try {
            database.loadData(o, Exhibit.Persistence.getBaseURL(url));
        } catch(e) {
            // @@@ UI for loading data - trigger event?
            Exhibit.Debug.exception(e);
            // , Exhibit.l10n.importer.parseError + url);
        } finally {
            if (typeof callback === "function") {
                callback();
            }
        }
    };

    self = this;
    postLoad = function(s, textStatus, jqxhr) {
        try {
            self._parse(url, s, postParse);
        } catch(e) {
            Exhibit.Debug.exception(e);
            // @@@, Exhibit.l10n.importer.loadError + url);
        }
    };

    resolver(url, database, postLoad);
};

/**
 * @param {String} url
 * @param {Exhibit.Database} database
 * @param {Function} callback
 */
Exhibit.Importer.prototype._loadURL = function(url, database, callback) {
    var fError, fDone, self;

    self = this;

    fError = function(jqxhr, textStatus, e) {
        // @@@ handle UI for load error - trigger event?
        callback();
    };

    $.ajax({
        "url": url,
        "dataType": "text",
        "error": fError,
        "success": callback
    });
};

/**
 * @@@
 */
Exhibit.Importer.prototype._loadJSONP = function(url, database, callback) {
    $.ajax({
        "url": url,
        "dataType": "jsonp",
        "error": fError,
        "success": fDone
    });
};

/**
 * @@@
 */ 
Exhibit.Importer.prototype._loadBabel = function(url, database, callback) {
    Exhibit.Importer.prototype._loadJSONP(url);
};

$(document).one("registerComponents.exhibit",
                Exhibit.Importer._registerComponent);
