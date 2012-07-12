/**
 * @fileOverview General class for data importer.
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @class
 * @constructor
 * @param {String|Array} mimeType
 * @param {String} loadType
 * @param {String} label
 * @param {Function} parse
 */
Exhibit.Importer = function(mimeType, loadType, parse) {
    if (typeof mimeType === "string") {
        this._mimeTypes = [mimeType];
    } else {
        this._mimeTypes = mimeType;
    }
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
        $(document).trigger("registerImporters.exhibit", reg);
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
 * @static
 * @string {String} url
 * @returns {Boolean}
 */
Exhibit.Importer.checkFileURL = function(url) {
    return url.startsWith("file:");
};

/**
 * @returns {Boolean}
 */
Exhibit.Importer.prototype.register = function() {
    var reg, i, registered;
    reg = Exhibit.Importer._registry;
    registered = false;
    for (i = 0; i < this._mimeTypes.length; i++) {
        if (!reg.isRegistered(
            Exhibit.Importer._registryKey,
            this._mimeTypes[i]
        )) {
            reg.register(
                Exhibit.Importer._registryKey,
                this._mimeTypes[i],
                this
            );
            registered = registered || true;
        } else {
            registered = registered || false;
        }
    }
    return registered;
};

/**
 *
 */
Exhibit.Importer.prototype.dispose = function() {
    var i;
    for (i = 0; i < this._mimeTypes.length; i++) {
        Exhibit.Importer._registry.unregister(
            Exhibit.Importer._registryKey,
            this._mimeTypes[i]
        );
    }
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
            Exhibit.Debug.exception(e);
            $(document).trigger("error.exhibit", [e, Exhibit._("%import.couldNotLoad", url)]);
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
            $(document).trigger("error.exhibit", [e, Exhibit._("%import.couldNotParse", url)]);
        }
    };

    Exhibit.UI.showBusyIndicator();
    resolver(url, database, postLoad, link);
};

/**
 * @param {String} url
 * @param {Exhibit.Database} database
 * @param {Function} callback
 */
Exhibit.Importer.prototype._loadURL = function(url, database, callback) {
    var self = this,
        callbackOrig = callback,
        fragmentStart = url.indexOf('#'),
        fragmentId = url.substring(fragmentStart),

        fError = function(jqxhr, textStatus, e) {
            var msg;
            if (Exhibit.Importer.checkFileURL(url) && jqxhr.status === 404) {
                msg = Exhibit._("%import.missingOrFilesystem", url);
            } else {
                msg = Exhibit._("%import.httpError", url, jqxhr.status);
            }
            $(document).trigger("error.exhibit", [e, msg]);
        };

    if ((fragmentStart >= 0) && (fragmentStart < url.length - 1)) {
        url = url.substring(0, fragmentStart);

        callback = function(data, status, jqxhr) {
            var msg,
                fragment = $(data).find(fragmentId)
	                          .andSelf()
	                          .filter(fragmentId);
            if (fragment.length < 1) {
                msg = Exhibit._("%import.missingFragment", url);
                $(document).trigger("error.exhibit", [new Error(msg), msg]);
            } else {
                callbackOrig(fragment.text(), status, jqxhr);
            }
        };
    }

    $.ajax({
        "url": url,
        "dataType": "text",
        "error": fError,
        "success": callback
    });
};

/**
 * @param {String} url
 * @param {Exhibit.Database} database
 * @param {Function} callback
 * @param {Element} link
 */
Exhibit.Importer.prototype._loadJSONP = function(url, database, callback, link) {
    var charset, convertType, jsonpCallback, converter, fDone, fError, ajaxArgs;

    if (typeof link !== "string") {
        convertType = Exhibit.getAttribute(link, "converter");
        jsonpCallback = Exhibit.getAttribute(link, "jsonp-callback");
        charset = Exhibit.getAttribute(link, "charset");
    }

    converter = Exhibit.Importer._registry.get(
        Exhibit.Importer.JSONP._registryKey,
        convertType
    );

    if (converter !== null && typeof converter.preprocessURL !== "undefined") {
        url = converter.preprocessURL(url);
    }
    
    fDone = function(s, textStatus, jqxhr) {
        callback(converter.transformJSON(s), textStatus, jqxhr);
    };

    fError = function(jqxhr, textStatus, e) {
        var msg;
        msg = Exhibit._(
            "%import.failedAccess",
            url,
            (typeof jqxhr.status !== "undefined") ? Exhibit._("%import.failedAccessHttpStatus", jqxhr.status) : "");
        $(document).trigger("error.exhibit", [e, msg]);
    };

    ajaxArgs = {
        "url": url,
        "dataType": "jsonp",
        "success": fDone,
        "error": fError
    };

    if (jsonpCallback !== null) {
        ajaxArgs.jsonp = false;
        ajaxArgs.jsonpCallback = jsonpCallback;
    }

    if (charset !== null) {
        ajaxArgs.scriptCharset = charset;
    }

    $.ajax(ajaxArgs);
};

/**
 * @param {String} url
 * @param {Exhibit.Database} database
 * @param {Function} callback
 * @param {Element} link
 */
Exhibit.Importer.prototype._loadBabel = function(url, database, callback, link) {
    var mimeType = null;
    if (typeof link !== "string") {
        mimeType = $(link).attr("type");
    }
    this._loadJSONP(
        Exhibit.Importer.BabelBased.makeURL(url, mimeType),
        database,
        callback,
        link
    );
};

$(document).one(
    "registerStaticComponents.exhibit",
    Exhibit.Importer._registerComponent
);
