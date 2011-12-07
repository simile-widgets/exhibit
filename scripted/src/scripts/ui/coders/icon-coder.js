/**
 * @fileOverview Code values with icons.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @constructor
 * @class
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.IconCoder = function(uiContext) {
    this._uiContext = uiContext;
    this._settings = {};
    
    this._map = {};
    this._mixedCase = { label: "mixed", icon: null };
    this._missingCase = { label: "missing", icon: null };
    this._othersCase = { label: "others", icon: null };
};

Exhibit.IconCoder._settingSpecs = {
};

Exhibit.IconCoder._iconTable = {
    // add built-in icons?
};

/**
 * @param {Object} configuration
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.IconCoder}
 */
Exhibit.IconCoder.create = function(configuration, uiContext) {
    var coder = new Exhibit.IconCoder(Exhibit.UIContext.create(configuration, uiContext));
    
    Exhibit.IconCoder._configure(coder, configuration);
    return coder;
};

/**
 * @param {Element} configElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.IconCoder}
 */
Exhibit.IconCoder.createFromDOM = function(configElmt, uiContext) {
    var configuration, coder;

    $(configElmt).hide();
    
    configuration = Exhibit.getConfigurationFromDOM(configElmt);
    coder = new Exhibit.IconCoder(Exhibit.UIContext.create(configuration, uiContext));
    
    Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt, Exhibit.IconCoder._settingSpecs, coder._settings);
    
    try {
        $(configElmt).children().each(function(index, elmt) {
            coder._addEntry(
                Exhibit.getAttribute(this,  "case"),
                $(this).text().trim(),
                Exhibit.getAttribute(this, "icon")
            );
        });
    } catch (e) {
        Exhibit.Debug.exception(e, "IconCoder: Error processing configuration of coder");
    }
    
    Exhibit.IconCoder._configure(coder, configuration);
    return coder;
};

/**
 * @param {Exhibit.IconCoder} coder
 * @param {Object} configuration
 */ 
Exhibit.IconCoder._configure = function(coder, configuration) {
    var entries, i;

    Exhibit.SettingsUtilities.collectSettings(configuration, Exhibit.IconCoder._settingSpecs, coder._settings);
    
    if (typeof configuration.entries !== "undefined") {
        entries = configuration.entries;
        for (i = 0; i < entries.length; i++) {
            coder._addEntry(entries[i].kase, entries[i].key, entries[i].icon);
        }
    }
};

/**
 *
 */
Exhibit.IconCoder.prototype.dispose = function() {
    this._uiContext = null;
    this._settings = null;
};

/**
 * @param {String} kase
 * @param {String} key
 * @param {String} icon
 */
Exhibit.IconCoder.prototype._addEntry = function(kase, key, icon) {
    var entry;

    // used if there are built-in icons
    if (typeof Exhibit.IconCoder._iconTable[icon] !== "undefined") {
        icon = Exhibit.IconCoder._iconTable[icon];
    }
    
    entry = null;
    switch (kase) {
    case "others":  entry = this._othersCase; break;
    case "mixed":   entry = this._mixedCase; break;
    case "missing": entry = this._missingCase; break;
    }
    if (entry !== null) {
        entry.label = key;
        entry.icon = icon;
    } else {
        this._map[key] = { icon: icon };
    }
};

/**
 * @param {String} key
 * @param {Object} flags
 * @returns {String}
 */
Exhibit.IconCoder.prototype.translate = function(key, flags) {
    if (typeof this._map[key] !== "undefined") {
        if (typeof flags !== "undefined" && flags !== null) {
            flags.keys.add(key);
        }
        return this._map[key].icon;
    } else if (typeof key === "undefined" || key === null) {
        if (typeof flags !== "undefined" && flags !== null) {
            flags.missing = true;
        }
        return this._missingCase.icon;
    } else {
        if (typeof flags !== "undefined" && flags !== null) {
            flags.others = true;
        }
        return this._othersCase.icon;
    }
};

/**
 * @param {Exhibit.Set} keys
 * @param {Object} flags
 * @returns {String}
 */
Exhibit.IconCoder.prototype.translateSet = function(keys, flags) {
    var icon, self;
    icon = null;
    self = this;
    keys.visit(function(key) {
        var icon2 = self.translate(key, flags);
        if (icon === null) {
            icon = icon2;
        } else if (icon !== icon2) {
            if (typeof flags !== "undefined" && flags !== null) {
                flags.mixed = true;
            }
            icon = self._mixedCase.icon;
            return true;
        }
        return false;
    });
    
    if (icon !== null) {
        return icon;
    } else {
        if (typeof flags !== "undefined" && flags !== null) {
            flags.missing = true;
        }
        return this._missingCase.icon;
    }
};

/**
 * @returns {String}
 */
Exhibit.IconCoder.prototype.getOthersLabel = function() {
    return this._othersCase.label;
};

/**
 * @returns {String}
 */
Exhibit.IconCoder.prototype.getOthersIcon = function() {
    return this._othersCase.icon;
};

/**
 * @returns {String}
 */
Exhibit.IconCoder.prototype.getMissingLabel = function() {
    return this._missingCase.label;
};

/**
 * @returns {String}
 */
Exhibit.IconCoder.prototype.getMissingIcon = function() {
    return this._missingCase.icon;
};

/**
 * @returns {String}
 */
Exhibit.IconCoder.prototype.getMixedLabel = function() {
    return this._mixedCase.label;
};

/**
 * @returns {String}
 */
Exhibit.IconCoder.prototype.getMixedIcon = function() {
    return this._mixedCase.icon;
};
