/**
 * @fileOverview Code values with size.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @class
 * @constructor
 * @param {Element|jQuery} containerElmt
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.SizeCoder = function(containerElmt, uiContext) {
    Exhibit.jQuery.extend(this, new Exhibit.Coder(
        "size",
        containerElmt,
        uiContext
    ));
    this.addSettingSpecs(Exhibit.SizeCoder._settingSpecs);
    
    this._map = {};
    this._mixedCase = {
        "label": Exhibit._("%coders.mixedCaseLabel"),
        "size": 10
    };
    this._missingCase = {
        "label": Exhibit._("%coders.missingCaseLabel"),
        "size": 10
    };
    this._othersCase = {
        "label": Exhibit._("%coders.othersCaseLabel"),
        "size": 10
    };

    this.register();
};

/**
 * @constant
 */
Exhibit.SizeCoder._settingSpecs = {
};

/**
 * @param {Object} configuration
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.SizeCoder}
 */
Exhibit.SizeCoder.create = function(configuration, uiContext) {
    var coder, div;
    div = Exhibit.jQuery("<div>")
        .hide()
        .appendTo("body");
    coder = new Exhibit.SizeCoder(
        div,
        Exhibit.UIContext.create(configuration, uiContext)
    );
    
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

    Exhibit.jQuery(configElmt).hide();
    
    configuration = Exhibit.getConfigurationFromDOM(configElmt);
    coder = new Exhibit.SizeCoder(
        configElmt,
        Exhibit.UIContext.create(configuration, uiContext)
    );
    
    Exhibit.SettingsUtilities.collectSettingsFromDOM(
        configElmt,
        coder.getSettingSpecs(),
        coder._settings
    );
    
    try {
        Exhibit.jQuery(configElmt).children().each(function(index, elmt) {
            coder._addEntry(
                Exhibit.getAttribute(this,  "case"),
                Exhibit.jQuery(this).text().trim(),
                Exhibit.getAttribute(this, "size")
            );
        });
    } catch (e) {
        Exhibit.Debug.exception(e, Exhibit._("%coders.error.configuration", "SizeCoder"));
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

    Exhibit.SettingsUtilities.collectSettings(
        configuration,
        coder.getSettingSpecs(),
        coder._settings
    );
    
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
    this._map = null;
    this._dispose();
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
    } else if (typeof key === "undefined" || key === null) {
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
