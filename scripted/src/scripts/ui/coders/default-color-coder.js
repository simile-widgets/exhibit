/**
 * @fileOverview Color coder to use when none is provided but one is needed.
 *     Does NOT extend Exhibit.Coder as it cannot be configured and has no
 *     need to inherit any of the structure used by other user-configured
 *     coders.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @class
 * @constructor
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.DefaultColorCoder = function(uiContext) {
};

/**
 * @constant
 */
Exhibit.DefaultColorCoder.colors = [
    "#FF9000",
    "#5D7CBA",
    "#A97838",
    "#8B9BBA",
    "#FFC77F",
    "#003EBA",
    "#29447B",
    "#543C1C"
];

/**
 * @private
 */
Exhibit.DefaultColorCoder._map = {};

/**
 * @private
 */
Exhibit.DefaultColorCoder._nextColor = 0;

/**
 * @param {String} key
 * @param {Object} flags
 * @param {Boolean} flags.missing
 * @param {Exhibit.Set} flags.keys
 * @returns {String}
 * @depends Exhibit.Coders
 */
Exhibit.DefaultColorCoder.prototype.translate = function(key, flags) {
    if (typeof key === "undefined" || key === null) {
        if (typeof flags !== "undefined" && flags !== null) {
            flags.missing = true;
        }
        return Exhibit.Coders.missingCaseColor;
    } else {
        if (typeof flags !== "undefined" && flags !== null) {
            flags.keys.add(key);
        }
        if (typeof Exhibit.DefaultColorCoder._map[key] !== "undefined") {
            return Exhibit.DefaultColorCoder._map[key];
        } else {
            var color = Exhibit.DefaultColorCoder.colors[Exhibit.DefaultColorCoder._nextColor];
            Exhibit.DefaultColorCoder._nextColor = 
                (Exhibit.DefaultColorCoder._nextColor + 1) % Exhibit.DefaultColorCoder.colors.length;
                
            Exhibit.DefaultColorCoder._map[key] = color;
            return color;
        }
    }
};

/**
 * @param {Exhibit.Set} keys
 * @param {Object} flags
 * @param {Boolean} flags.missing
 * @param {Boolean} flags.mixed
 * @returns {String}
 */
Exhibit.DefaultColorCoder.prototype.translateSet = function(keys, flags) {
    var color, self;
    color = null;
    self = this;
    keys.visit(function(key) {
        var color2 = self.translate(key, flags);
        if (color === null) {
            color = color2;
        } else if (color !== color2) {
            color = Exhibit.Coders.mixedCaseColor;
            flags.mixed = true;
            return true; // exit visitation
        }
        return false;
    });
    
    if (color !== null) {
        return color;
    } else {
        flags.missing = true;
        return Exhibit.Coders.missingCaseColor;
    }
};

/**
 * @returns {String}
 */
Exhibit.DefaultColorCoder.prototype.getOthersLabel = function() {
    return Exhibit._("%coders.othersCaseLabel");
};

/**
 * @returns {String}
 */
Exhibit.DefaultColorCoder.prototype.getOthersColor = function() {
    return Exhibit.Coders.othersCaseColor;
};

/**
 * @returns {String}
 */
Exhibit.DefaultColorCoder.prototype.getMissingLabel = function() {
    return Exhibit._("%coders.missingCaseLabel");
};

/**
 * @returns {String}
 */
Exhibit.DefaultColorCoder.prototype.getMissingColor = function() {
    return Exhibit.Coders.missingCaseColor;
};

/**
 * @returns {String}
 */
Exhibit.DefaultColorCoder.prototype.getMixedLabel = function() {
    return Exhibit._("%coders.mixedCaseLabel");
};

/**
 * @returns {String}
 */
Exhibit.DefaultColorCoder.prototype.getMixedColor = function() {
    return Exhibit.Coders.mixedCaseColor;
};
