/**
 * @fileOverview  Reads the color coder entries as if they were
 *  in order.  Eliminates the mixed case and uses
 *  either the highest or lowest 'color' in any set.
 *  Note the 'other' and 'missing' cases will be
 *  included in the ordering.  If they are not
 *  included in the coder definition, they will be
 *  added as the lowest priority, other, then
 *  missing.
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @constructor
 * @class
 * @param {Element|jQuery} containerElmt
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.OrderedColorCoder = function(containerElmt, uiContext) {
    Exhibit.jQuery.extend(this, new Exhibit.Coder(
        "orderedcolor",
        containerElmt,
        uiContext
    ));
    this.addSettingSpecs(Exhibit.OrderedColorCoder._settingSpecs);
    
    this._map = {};
    this._order = new Exhibit.OrderedColorCoder._OrderedHash();
    this._usePriority = "highest";
    this._mixedCase = { 
        "label": null,
        "color": null,
	    "isDefault": true
    };
    this._missingCase = { 
        "label": Exhibit._("%coders.missingCaseLabel"),
        "color": Exhibit.Coders.missingCaseColor,
	    "isDefault": true
    };
    this._othersCase = { 
        "label": Exhibit._("%coders.othersCaseLabel"),
        "color": Exhibit.Coders.othersCaseColor,
	    "isDefault": true
    };

    this.register();
};

/**
 * @constructor
 * @class
 * @public
 */
Exhibit.OrderedColorCoder._OrderedHash = function() {
    this.size = 0;
    this.hash = {};
};

/**
 * @param {String} key
 */
Exhibit.OrderedColorCoder._OrderedHash.prototype.add = function(key) {
    this.hash[key] = this.size++;
};

/**
 * @returns {Number}
 */
Exhibit.OrderedColorCoder._OrderedHash.prototype.size = function() {
    return this.size;
};

/**
 * @param {String} key
 * @returns {String}
 */
Exhibit.OrderedColorCoder._OrderedHash.prototype.get = function(key) {
    return this.hash[key];
};

/**
 * @constant
 */
Exhibit.OrderedColorCoder._settingSpecs = {
};

/**
 * @param {Object} configuration
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.OrderedColorCoder}
 */
Exhibit.OrderedColorCoder.create = function(configuration, uiContext) {
    var coder, div;
    div = Exhibit.jQuery("<div>")
        .hide()
        .appendTo("body");
    coder = new Exhibit.OrderedColorCoder(
        div,
        Exhibit.UIContext.create(configuration, uiContext)
    );
    
    Exhibit.OrderedColorCoder._configure(coder, configuration);
    return coder;
};

/**
 * @param {Element} configElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.OrderedColorCoder}
 */
Exhibit.OrderedColorCoder.createFromDOM = function(configElmt, uiContext) {
    var configuration, coder;

    Exhibit.jQuery(configElmt).hide();
    
    configuration = Exhibit.getConfigurationFromDOM(configElmt);
    coder = new Exhibit.OrderedColorCoder(
        configElmt,
        Exhibit.UIContext.create(configuration, uiContext)
    );
    
    Exhibit.SettingsUtilities.collectSettingsFromDOM(
        configElmt,
        coder.getSettingSpecs(),
        coder._settings
    );
    
    try {
	    this._usePriority = coder._settings.usePriority;
        Exhibit.jQuery(configElmt).children().each(function(index, element) {
            coder._addEntry(
                Exhibit.getAttribute(this, "case"), 
                Exhibit.jQuery(this).text().trim(), 
                Exhibit.getAttribute(this, "color")
            );
        });
	    if (coder.getOthersIsDefault()) {
	        coder._addEntry(
		        "other",
		        coder.getOthersLabel(),
		        coder.getOthersColor());
	    }
	    if (coder.getMissingIsDefault()) {
	        coder._addEntry(
		        "missing",
		        coder.getMissingLabel(),
		        coder.getMissingColor());
	    }
    } catch (e) {
        Exhibit.Debug.exception(e, Exhibit._("%coders.error.configuration", "OrderedColorCoder"));
    }
    
    Exhibit.OrderedColorCoder._configure(coder, configuration);
    return coder;
};

/**
 * @param {Exhibit.OrderedColorCoder} coder
 * @param {Object} configuration
 */
Exhibit.OrderedColorCoder._configure = function(coder, configuration) {
    var entires, i;

    Exhibit.SettingsUtilities.collectSettings(
        configuration,
        coder.getSettingSpecs(),
        coder._settings
    );
    
    if (typeof configuration.entries !== "undefined") {
        entries = configuration.entries;
        for (i = 0; i < entries.length; i++) {
            coder._addEntry(entries[i].kase, entries[i].key, entries[i].color);
        }
	    if (this.getOthersIsDefault()) {
	        coder._addEntry(
		        "other",
		        this.getOthersLabel(),
		        this.getOthersColor());
	    }
	    if (this.getMissingIsDefault()) {
	        coder._addEntry(
		    "missing",
		        this.getMissingLabel(),
		        this.getMissingColor());
	    }
    }
};

/**
 *
 */
Exhibit.OrderedColorCoder.prototype.dispose = function() {
    this._map = null;
    this._order = null;
    this._dispose();
};

/**
 * @constant
 */
Exhibit.OrderedColorCoder._colorTable = {
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
Exhibit.OrderedColorCoder.prototype._addEntry = function(kase, key, color) {
    var entry, mixed;

    if (typeof Exhibit.OrderedColorCoder._colorTable[color] !== "undefined") {
        color = Exhibit.OrderedColorCoder._colorTable[color];
    }
    
    entry = null;
    mixed = false;
    switch (kase) {
    case "others":  entry = this._othersCase; break;
    case "missing": entry = this._missingCase; break;
    case "mixed": mixed = true; break;
    }
    if (entry !== null) {
        entry.label = key;
        entry.color = color;
	    entry.isDefault = false;
	    this._order.add(key);
    } else {
	    // the 'mixed' case will be entirely ignored
        if (!mixed) {
            this._map[key] = { color: color };
	        this._order.add(key);
	    }
    }
};

/**
 * @param {String} key
 * @param {Object} flags
 * @returns {String}
 */
Exhibit.OrderedColorCoder.prototype.translate = function(key, flags) {
    if (typeof this._map[key] !== "undefined") {
        if (typeof flags !== "undefined" && flags !== null) {
            flags.keys.add(key);
        }
        return this._map[key].color;
    } else if (typeof key === "undefined" || key === null) {
        if (typeof flags !== "undefined" && flags !== null) {
            flags.missing = true;
        }
        return this._missingCase.color;
    } else {
        if (typeof flags !== "undefined" && flags !== null) {
            flags.others = true;
        }
        return this._othersCase.color;
    }
};

/**
 * @param {Exhibit.Set} key
 * @param {Object} flags
 * @returns {String}
 */
Exhibit.OrderedColorCoder.prototype.translateSet = function(keys, flags) {
    var color, lastKey, self, keyOrder, lastKeyOrder;
    color = null;
    lastKey = null;
    self = this;
    keys.visit(function(key) {
        var color2 = self.translate(key, flags);
        if (color === null) {
            color = color2;
	        lastKey = key;
        } else if (color !== color2) {
	        if (key === null) {
	            key = self.getMissingLabel();
	        } else if (typeof self._map[key] === "undefined") {
	            key = self.getOthersLabel();
	        }
	        keyOrder = self._order.get(key);
	        lastKeyOrder = self._order.get(lastKey);
	        if (self._usePriority === "highest") {
		        if (keyOrder < lastKeyOrder) {
		            color = color2;
		            lastKey = key;
		        }
	        } else if (self._usePriority === "lowest") {
		        if (keyOrder > lastKeyOrder) {
		            color = color2;
		            lastKey = key;
		        }
	        } else {
		        // an incorrect setting value will cause problems
		        return false;
	        }
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
Exhibit.OrderedColorCoder.prototype.getOthersLabel = function() {
    return this._othersCase.label;
};

/**
 * @returns {String}
 */
Exhibit.OrderedColorCoder.prototype.getOthersColor = function() {
    return this._othersCase.color;
};

/**
 * @returns {Boolean}
 */
Exhibit.OrderedColorCoder.prototype.getOthersIsDefault = function() {
    return this._othersCase.isDefault;
};

/**
 * @returns {String}
 */
Exhibit.OrderedColorCoder.prototype.getMissingLabel = function() {
    return this._missingCase.label;
};

/**
 * @returns {String}
 */
Exhibit.OrderedColorCoder.prototype.getMissingColor = function() {
    return this._missingCase.color;
};

/**
 * @returns {Boolean}
 */
Exhibit.OrderedColorCoder.prototype.getMissingIsDefault = function() {
    return this._missingCase.isDefault;
};

/**
 * @returns {String}
 */
Exhibit.OrderedColorCoder.prototype.getMixedLabel = function() {
    return this._mixedCase.label;
};

/**
 * @returns {String}
 */
Exhibit.OrderedColorCoder.prototype.getMixedColor = function() {
    return this._mixedCase.color;
};

/**
 * @returns {Boolean}
 */
Exhibit.OrderedColorCoder.prototype.getMixedIsDefault = function() {
    return this._mixedCase.isDefault;
};
