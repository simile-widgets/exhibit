/**
 * @fileOverview Codes values with colors.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @constructor
 * @class
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.ColorCoder = function(uiContext) {
    this._div = null;
    this._uiContext = uiContext;
    this._settings = {};

    this._id = null;
    this._registered = false;
    
    this._map = {};
    this._mixedCase = { 
        label: Exhibit.Coders.l10n.mixedCaseLabel, 
        color: Exhibit.Coders.mixedCaseColor
    };
    this._missingCase = { 
        label: Exhibit.Coders.l10n.missingCaseLabel, 
        color: Exhibit.Coders.missingCaseColor 
    };
    this._othersCase = { 
        label: Exhibit.Coders.l10n.othersCaseLabel, 
        color: Exhibit.Coders.othersCaseColor 
    };
};

Exhibit.ColorCoder._settingSpecs = {
};

/**
 * @param {Object} configuration
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.ColorCoder}
 */
Exhibit.ColorCoder.create = function(configuration, uiContext) {
    var coder = new Exhibit.ColorCoder(Exhibit.UIContext.create(configuration, uiContext));
    
    Exhibit.ColorCoder._configure(coder, configuration);
    coder._setIdentifier();
    coder.register();
    return coder;
};

/**
 * @param {Element} configElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.ColorCoder}
 */
Exhibit.ColorCoder.createFromDOM = function(configElmt, uiContext) {
    var configuration, coder;

    $(configElmt).hide();

    configuration = Exhibit.getConfigurationFromDOM(configElmt);
    coder = new Exhibit.ColorCoder(Exhibit.UIContext.create(configuration, uiContext));
    coder._div = configElmt;
    
    Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt, Exhibit.ColorCoder._settingSpecs, coder._settings);
    
    try {
        $(configElmt).children().each(function(index, elmt) {
            coder._addEntry(
                Exhibit.getAttribute(this,  "case"),
                $(this).text().trim(),
                Exhibit.getAttribute(this, "color")
            );
        });
    } catch (e) {
        Exhibit.Debug.exception(e, "ColorCoder: Error processing configuration of coder");
    }
    
    Exhibit.ColorCoder._configure(coder, configuration);
    coder._setIdentifier();
    coder.register();
    return coder;
};

/**
 * @param {Exhibit.ColorCoder} coder
 * @param {Object} configuration
 */
Exhibit.ColorCoder._configure = function(coder, configuration) {
    var entries, i;

    Exhibit.SettingsUtilities.collectSettings(configuration, Exhibit.ColorCoder._settingSpecs, coder._settings);
    
    if (typeof configuration["entries"] !== "undefined") {
        entries = configuration.entries;
        for (i = 0; i < entries.length; i++) {
            coder._addEntry(entries[i].kase, entries[i].key, entries[i].color);
        }
    }
};

/**
 * @private
 */
Exhibit.ColorCoder.prototype._setIdentifier = function() {
    this._id = $(this._div).attr("id");

    if (typeof this._id === "undefined") {
        this._id = "colorCoder"
            + "-"
            + Exhibit.Coder._registryKey
            + "-"
            + this._uiContext.getCollection().getID()
            + "-"
            + this._uiContext.getExhibit().getRegistry().generateIdentifier(
                Exhibit.Coder._registryKey
            );
    }
};

/**
 * @returns {String}
 */
Exhibit.ColorCoder.prototype.getID = function() {
    return this._id;
};

/**
 *
 */
Exhibit.ColorCoder.prototype.register = function() {
    this._uiContext.getExhibit().getRegistry().register(
        Exhibit.Coder._registryKey,
        this.getID(),
        this
    );
    this._registered = true;
};

/**
 *
 */
Exhibit.ColorCoder.prototype.unregister = function() {
    this._uiContext.getExhibit().getRegistry().unregister(
        Exhibit.Coder._registryKey,
        this.getID()
    );
    this._registered = false;
};

/**
 *
 */
Exhibit.ColorCoder.prototype.dispose = function() {
    this._uiContext = null;
    this._settings = null;
};

/**
 * @constant
 */
Exhibit.ColorCoder._colorTable = {
    "red" :     "#ff0000",
    "green" :   "#00ff00",
    "blue" :    "#0000ff",
    "white" :   "#ffffff",
    "black" :   "#000000",
    "gray" :    "#888888"
};

/**
 * @param {String} kase
 * @param {String} key
 * @param {String} color
 */
Exhibit.ColorCoder.prototype._addEntry = function(kase, key, color) {
    if (typeof Exhibit.ColorCoder._colorTable[color] !== "undefined") {
        color = Exhibit.ColorCoder._colorTable[color];
    }
    
    var entry = null;
    switch (kase) {
    case "others":  entry = this._othersCase; break;
    case "mixed":   entry = this._mixedCase; break;
    case "missing": entry = this._missingCase; break;
    }
    if (entry !== null) {
        entry.label = key;
        entry.color = color;
    } else {
        this._map[key] = { color: color };
    }
};

/**
 * @param {String} key
 * @param {Object} flags
 * @param {Boolean} flags.missing
 * @param {Boolean} flags.others
 * @param {Exhibit.Set} flags.keys
 */
Exhibit.ColorCoder.prototype.translate = function(key, flags) {
    if (typeof this._map[key] !== "undefined") {
        if (flags) {
            flags.keys.add(key);
        }
        return this._map[key].color;
    } else if (typeof key === "undefined" || key === null) {
        if (flags) {
            flags.missing = true;
        }
        return this._missingCase.color;
    } else {
        if (flags) {
            flags.others = true;
        }
        return this._othersCase.color;
    }
};

/**
 * @param {Exhibit.Set} keys
 * @param {Object} flags
 * @param {Boolean} flags.missing
 * @param {Boolean} flags.mixed
 * @returns {String}
 */
Exhibit.ColorCoder.prototype.translateSet = function(keys, flags) {
    var color, self;
    color = null;
    self = this;
    keys.visit(function(key) {
        var color2 = self.translate(key, flags);
        if (color === null) {
            color = color2;
        } else if (color !== color2) {
            if (typeof flags !== "undefined" && flags !== null) {
                flags.mixed = true;
            }
            color = self._mixedCase.color;
            return true;
        }
        return false;
    });
    
    if (color !== null) {
        return color;
    } else {
        if (typeof flags !== "undefined" && flags !== null) {
            flags.missing = true;
        }
        return this._missingCase.color;
    }
};

/**
 * @returns {String}
 */
Exhibit.ColorCoder.prototype.getOthersLabel = function() {
    return this._othersCase.label;
};

/**
 * @returns {String}
 */
Exhibit.ColorCoder.prototype.getOthersColor = function() {
    return this._othersCase.color;
};

/**
 * @returns {String}
 */
Exhibit.ColorCoder.prototype.getMissingLabel = function() {
    return this._missingCase.label;
};

/**
 * @returns {String}
 */
Exhibit.ColorCoder.prototype.getMissingColor = function() {
    return this._missingCase.color;
};

/**
 * @returns {String}
 */
Exhibit.ColorCoder.prototype.getMixedLabel = function() {
    return this._mixedCase.label;
};

/**
 * @returns {String}
 */
Exhibit.ColorCoder.prototype.getMixedColor = function() {
    return this._mixedCase.color;
};
