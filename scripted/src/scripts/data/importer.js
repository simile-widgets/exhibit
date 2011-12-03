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
 * @private
 */
Exhibit.Importer._registry = null;

/**
 * @static
 * @param {Exhibit._Impl} ex
 */
Exhibit.Importer._registerComponent = function(evt, reg) {
    Exhibit.Importer._registry = reg;
    if (!reg.hasRegistry(Exhibit.Importer._registryKey)) {
        reg.createRegistry(Exhibit.Importer._registryKey);
        $(document).trigger("registerImporters.exhibit");
    }
};

/**
 * @static
 * @param {String} mimeType
 * @returns {Exhibit.Importer}
 */
Exhibit.Importer.getImporter = function(mimeType) {
    return Exhibit.Importer._registry.get(
        Exhibit.Importer._registryKey,
        mimeType
    );
};

/**
 * @returns {Boolean}
 */
Exhibit.Importer.prototype.register = function() {
    var reg = Exhibit.Importer._registry;
    if (!reg.isRegistered(
        Exhibit.Importer._registryKey,
        this._mimeType
    )) {
        reg.register(
            Exhibit.Importer._registryKey,
            this._mimeType,
            this
        );
        return true;
    } else {
        return false;
    }
};

/**
 *
 */
Exhibit.Importer.prototype.dispose = function() {
    Exhibit.Importer._registry.getRegistry().unregister(
        Exhibit.Importer._registryKey,
        this._mimeType
    );
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
        Exhibit.UI.hideBusyIndicator();
        try {
            self._parse(url, s, postParse);
        } catch(e) {
            Exhibit.Debug.exception(e);
            // @@@, Exhibit.l10n.importer.loadError + url);
        }
    };

    Exhibit.UI.showBusyIndicator();
    resolver(url, database, postLoad);
};

/**
 * @param {String} url
 * @param {Exhibit.Database} database
 * @param {Function} callback
 */
Exhibit.Importer.prototype._loadURL = function(url, database, callback) {
    var fError, self;

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

$(document).one(
    "registerComponents.exhibit",
    Exhibit.Importer._registerComponent
);
