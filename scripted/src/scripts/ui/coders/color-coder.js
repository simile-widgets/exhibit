/**
 * @fileOverview Codes values with colors.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @constructor
 * @class
 * @param {Element|jQuery} containerElmt 
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.ColorCoder = function(containerElmt, uiContext) {
    Exhibit.jQuery.extend(this, new Exhibit.Coder(
        "color",
        containerElmt,
        uiContext
    ));
    this.addSettingSpecs(Exhibit.ColorCoder._settingSpecs);

    this._map = {};

    this._mixedCase = { 
        "label": Exhibit._("%coders.mixedCaseLabel"),
        "color": Exhibit.Coders.mixedCaseColor
    };
    this._missingCase = { 
        "label": Exhibit._("%coders.missingCaseLabel"),
        "color": Exhibit.Coders.missingCaseColor 
    };
    this._othersCase = { 
        "label": Exhibit._("%coders.othersCaseLabel"),
        "color": Exhibit.Coders.othersCaseColor 
    };

    this.register();
};

/**
 * @constant
 */
Exhibit.ColorCoder._settingSpecs = {
};

/**
 * @param {Object} configuration
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.ColorCoder}
 */
Exhibit.ColorCoder.create = function(configuration, uiContext) {
    var coder, div;
    div = Exhibit.jQuery("<div>")
        .hide()
        .appendTo("body");
    coder = new Exhibit.ColorCoder(div, Exhibit.UIContext.create(configuration, uiContext));
    
    Exhibit.ColorCoder._configure(coder, configuration);
    return coder;
};

/**
 * @param {Element} configElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.ColorCoder}
 */
Exhibit.ColorCoder.createFromDOM = function(configElmt, uiContext) {
    var configuration, coder;

    Exhibit.jQuery(configElmt).hide();

    configuration = Exhibit.getConfigurationFromDOM(configElmt);
    coder = new Exhibit.ColorCoder(
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
                Exhibit.getAttribute(this, "color")
            );
        });
    } catch (e) {
        Exhibit.Debug.exception(e, "ColorCoder: Error processing configuration of coder");
    }
    
    Exhibit.ColorCoder._configure(coder, configuration);
    return coder;
};

/**
 * @param {Exhibit.ColorCoder} coder
 * @param {Object} configuration
 */
Exhibit.ColorCoder._configure = function(coder, configuration) {
    var entries, i;

    Exhibit.SettingsUtilities.collectSettings(
        configuration,
        coder.getSettingSpecs(),
        coder._settings
    );
    
    if (typeof configuration["entries"] !== "undefined") {
        entries = configuration.entries;
        for (i = 0; i < entries.length; i++) {
            coder._addEntry(entries[i].kase, entries[i].key, entries[i].color);
        }
    }
};

/**
 *
 */
Exhibit.ColorCoder.prototype.dispose = function() {
    this._map = null;
    this._dispose();
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
