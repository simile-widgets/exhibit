/**
 * @fileOverview Code values with size.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @class
 * @constructor
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.SizeCoder = function(uiContext) {
    this._uiContext = uiContext;
    this._settings = {};
    
    this._map = {};
    this._mixedCase = { label: "mixed", size: 10 };
    this._missingCase = { label: "missing", size: 10 };
    this._othersCase = { label: "others", size: 10 };
};

Exhibit.SizeCoder._settingSpecs = {
};

/**
 * @param {Object} configuration
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.SizeCoder}
 */
Exhibit.SizeCoder.create = function(configuration, uiContext) {
    var coder = new Exhibit.SizeCoder(Exhibit.UIContext.create(configuration, uiContext));
    
    Exhibit.SizeCoder._configure(coder, configuration);
    return coder;
};

/**
 * @param {Element} configElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.SizeCoder}
 */
Exhibit.SizeCoder.createFromDOM = function(configElmt, uiContext) {
    var configuration, coder;

    $(configElmt).hide();
    
    configuration = Exhibit.getConfigurationFromDOM(configElmt);
    coder = new Exhibit.SizeCoder(Exhibit.UIContext.create(configuration, uiContext));
    
    Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt, Exhibit.SizeCoder._settingSpecs, coder._settings);
    
    try {
        $(configElmt).children().each(function(index, elmt) {
            coder._addEntry(
                Exhibit.getAttribute(this,  "case"),
                $(this).text().trim(),
                Exhibit.getAttribute(this, "size")
            );
        });
    } catch (e) {
        Exhibit.Debug.exception(e, "SizeCoder: Error processing configuration of coder");
    }
    
    Exhibit.SizeCoder._configure(coder, configuration);
    return coder;
};

/**
 * @param {Exhibit.SizeCoder} coder
 * @param {Object} configuration
 */
Exhibit.SizeCoder._configure = function(coder, configuration) {
    var entries, i;

    Exhibit.SettingsUtilities.collectSettings(configuration, Exhibit.SizeCoder._settingSpecs, coder._settings);
    
    if (typeof configuration.entries !== "undefined") {
        entries = configuration.entries;
        for (i = 0; i < entries.length; i++) {
            coder._addEntry(entries[i].kase, entries[i].key, entries[i].size);
        }
    }
};

/**
 *
 */
Exhibit.SizeCoder.prototype.dispose = function() {
    this._uiContext = null;
    this._settings = null;
};

/**
 * @param {String} kase
 * @param {String} key
 * @param {Number} size
 */
Exhibit.SizeCoder.prototype._addEntry = function(kase, key, size) {  
    var entry = null;
    switch (kase) {
    case "others":  entry = this._othersCase; break;
    case "mixed":   entry = this._mixedCase; break;
    case "missing": entry = this._missingCase; break;
    }
    if (entry !== null) {
        entry.label = key;
        entry.size = size;
    } else {
        this._map[key] = { size: size };
    }
};

/**
 * @param {String} key
 * @param {Object} flags
 * @returns {Number}
 */
Exhibit.SizeCoder.prototype.translate = function(key, flags) {
    if (typeof this._map[key] !== "undefined") {
        if (typeof flags !== "undefined" && flags !== null) {
            flags.keys.add(key);
        }
        return this._map[key].size;
    } else if (key === null) {
        if (typeof flags !== "undefined" && flags !== null) {
            flags.missing = true;
        }
        return this._missingCase.size;
    } else {
        if (typeof flags !== "undefined" && flags !== null) {
            flags.others = true;
        }
        return this._othersCase.size;
    }
};

/**
 * @param {Exhibit.Set} keys
 * @param {Object} flags
 * @returns {Number}
 */
Exhibit.SizeCoder.prototype.translateSet = function(keys, flags) {
    var size, self;
    size = null;
    self = this;
    keys.visit(function(key) {
        var size2 = self.translate(key, flags);
        if (size === null) {
            size = size2;
        } else if (size !== size2) {
            if (typeof flags !== "undefined" && flags !== null) {
                flags.mixed = true;
            }
            size = self._mixedCase.size;
            return true;
        }
        return false;
    });
    
    if (size !== null) {
        return size;
    } else {
        if (typeof flags !== "undefined" && flags !== null) {
            flags.missing = true;
        }
        return this._missingCase.size;
    }
};

/**
 * @returns {String}
 */
Exhibit.SizeCoder.prototype.getOthersLabel = function() {
    return this._othersCase.label;
};

/**
 * @returns {Number}
 */
Exhibit.SizeCoder.prototype.getOthersSize = function() {
    return this._othersCase.size;
};

/**
 * @returns {String}
 */
Exhibit.SizeCoder.prototype.getMissingLabel = function() {
    return this._missingCase.label;
};

/**
 * @returns {Number}
 */
Exhibit.SizeCoder.prototype.getMissingSize = function() {
    return this._missingCase.size;
};

/**
 * @returns {String}
 */
Exhibit.SizeCoder.prototype.getMixedLabel = function() {
    return this._mixedCase.label;
};

/**
 * @returns {Number}
 */
Exhibit.SizeCoder.prototype.getMixedSize = function() {
    return this._mixedCase.size;
};
