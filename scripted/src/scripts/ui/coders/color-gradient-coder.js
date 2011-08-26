/**
 * @fileOverview Code values along a color gradient.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @constructor
 * @class
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.ColorGradientCoder = function(uiContext) {
    this._uiContext = uiContext;
    this._settings = {};
    
    this._gradientPoints = [];
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

Exhibit.ColorGradientCoder._settingSpecs = {
};

/**
 * @param {Object} configuration
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.ColorGradientCoder}
 */
Exhibit.ColorGradientCoder.create = function(configuration, uiContext) {
    var coder = new Exhibit.ColorGradientCoder(Exhibit.UIContext.create(configuration, uiContext));
    
    Exhibit.ColorGradientCoder._configure(coder, configuration);
    return coder;
};

/**
 * @param {Element} configElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.ColorGradientCoder}
 */
Exhibit.ColorGradientCoder.createFromDOM = function(configElmt, uiContext) {
    var configuration, coder, gradientPoints, i, point, value, colorIndex, red, green, blue;

    $(configElmt).hide();
    
    configuration = Exhibit.getConfigurationFromDOM(configElmt);
    coder = new Exhibit.ColorGradientCoder(Exhibit.UIContext.create(configuration, uiContext));
    
    Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt, Exhibit.ColorGradientCoder._settingSpecs, coder._settings);
    
    try {
		gradientPoints = Exhibit.getAttribute(configElmt, "gradientPoints", ";");
		for (i = 0; i < gradientPoints.length; i++) {
			point = gradientPoints[i];
			value = parseFloat(point);
			colorIndex = point.indexOf("#") + 1;
			red = parseInt(point.slice(colorIndex, colorIndex + 2), 16);
			green = parseInt(point.slice(colorIndex + 2, colorIndex + 4), 16);
			blue = parseInt(point.slice(colorIndex + 4), 16);
			coder._gradientPoints.push({ value: value, red: red, green: green, blue: blue });
		}
		
        $(configElmt).children().each(function(index, elmt) {
            coder._addEntry(
                Exhibit.getAttribute(this,  "case"),
                $(this).text().trim(),
                Exhibit.getAttribute(this, "color")
            );
        });
    } catch (e) {
        Exhibit.Debug.exception(e, "ColorGradientCoder: Error processing configuration of coder");
    }
    
    Exhibit.ColorGradientCoder._configure(coder, configuration);
    return coder;
};

/**
 * @param {Exhibit.ColorGradientCoder} coder
 * @param {Object} configuration
 */
Exhibit.ColorGradientCoder._configure = function(coder, configuration) {
    var entries, i;
    Exhibit.SettingsUtilities.collectSettings(configuration, Exhibit.ColorGradientCoder._settingSpecs, coder._settings);
    
    if (typeof configuration.entries !== "undefined") {
        entries = configuration.entries;
        for (i = 0; i < entries.length; i++) {
            coder._addEntry(entries[i].kase, entries[i].key, entries[i].color);
        }
    }
};

/**
 *
 */
Exhibit.ColorGradientCoder.prototype.dispose = function() {
    this._uiContext = null;
    this._settings = null;
};

/**
 * @param {String} kase
 * @param {String} key
 * @param {String} color
 */
Exhibit.ColorGradientCoder.prototype._addEntry = function(kase, key, color) {
    var entry = null;
    switch (kase) {
    case "others":  entry = this._othersCase; break;
    case "mixed":   entry = this._mixedCase; break;
    case "missing": entry = this._missingCase; break;
    }
    if (entry !== null) {
        entry.label = key;
        entry.color = color;
	}
};

/**
 * @param {String} key
 * @param {Object} flags
 * @returns {String}
 */
Exhibit.ColorGradientCoder.prototype.translate = function(key, flags) {
    var gradientPoints, getColor, rgbToHex;
	gradientPoints = this._gradientPoints;
	getColor = function(key) {
        var j, fraction, newRed, newGreen, newBlue;
		if (key.constructor !== Number) {
			key = parseFloat(key);
		}
		for (j = 0; j < gradientPoints.length; j++) {
			if (key === gradientPoints[j].value) {
				return rgbToHex(gradientPoints[j].red, gradientPoints[j].green, gradientPoints[j].blue);
			} else if (gradientPoints[j+1] !== null) {
				if (key < gradientPoints[j+1].value) {
					fraction = (key - gradientPoints[j].value)/(gradientPoints[j+1].value - gradientPoints[j].value);
					newRed = Math.floor(gradientPoints[j].red + fraction*(gradientPoints[j+1].red - gradientPoints[j].red));
					newGreen = Math.floor(gradientPoints[j].green + fraction*(gradientPoints[j+1].green - gradientPoints[j].green));
					newBlue = Math.floor(gradientPoints[j].blue + fraction*(gradientPoints[j+1].blue - gradientPoints[j].blue));
					return rgbToHex(newRed, newGreen, newBlue);
				}
			}
		}
	};

	rgbToHex = function(r, g, b) {
        var decToHex;
		decToHex = function(n) {
			if (n === 0) {
                return "00";
            }
			else {
                return n.toString(16);
            }
		};
		return "#" + decToHex(r) + decToHex(g) + decToHex(b);
	};
	
    if (key >= gradientPoints[0].value & key <= gradientPoints[gradientPoints.length-1].value) {
        if (typeof flags !== "undefined" && flags !==  null) {
            flags.keys.add(key);
        }
        return getColor(key);
    } else if (key === null) {
        if (typeof flags !== "undefined" && flags !==  null) {
            flags.missing = true;
        }
        return this._missingCase.color;
    } else {
        if (typeof flags !== "undefined" && flags !==  null) {
            flags.others = true;
        }
        return this._othersCase.color;
    }
};

/**
 * @param {Exhibit.Set} keys
 * @param {Object} flags
 * @returns {String}
 */
Exhibit.ColorGradientCoder.prototype.translateSet = function(keys, flags) {
    var color, self;
    color = null;
    self = this;
    keys.visit(function(key) {
        var color2 = self.translate(key, flags);
        if (color === null) {
            color = color2;
        } else if (color !== color2) {
            if (typeof flags !== "undefined" && flags !==  null) {
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
        if (typeof flags !== "undefined" && flags !==  null) {
            flags.missing = true;
        }
        return this._missingCase.color;
    }
};

/**
 * @returns {String}
 */
Exhibit.ColorGradientCoder.prototype.getOthersLabel = function() {
    return this._othersCase.label;
};

/**
 * @returns {String}
 */
Exhibit.ColorGradientCoder.prototype.getOthersColor = function() {
    return this._othersCase.color;
};

/**
 * @returns {String}
 */
Exhibit.ColorGradientCoder.prototype.getMissingLabel = function() {
    return this._missingCase.label;
};

/**
 * @returns {String}
 */
Exhibit.ColorGradientCoder.prototype.getMissingColor = function() {
    return this._missingCase.color;
};

/**
 * @returns {String}
 */
Exhibit.ColorGradientCoder.prototype.getMixedLabel = function() {
    return this._mixedCase.label;
};

/**
 * @returns {String}
 */
Exhibit.ColorGradientCoder.prototype.getMixedColor = function() {
    return this._mixedCase.color;
};
