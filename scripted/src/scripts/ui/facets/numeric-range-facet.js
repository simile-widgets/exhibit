/**
 * @fileOverview Numeric range facet functions and UI
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @class
 * @constructor
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.NumericRangeFacet = function(containerElmt, uiContext) {
    var self = this;
    Exhibit.jQuery.extend(
        this,
        new Exhibit.Facet("numericrange", containerElmt, uiContext)
    );
    this.addSettingSpecs(Exhibit.NumericRangeFacet._settingSpecs);

    this._dom = null;
    this._ranges = [];
    
    this._onRootItemsChanged = function() {
        if (typeof self._rangeIndex !== "undefined") {
            delete self._rangeIndex;
        }
    };
    Exhibit.jQuery(uiContext.getCollection().getElement()).bind(
        "onRootItemsChanged.exhibit",
        this._onRootItemsChanged
    );
};

/**
 * @private
 * @constant
 */
Exhibit.NumericRangeFacet._settingSpecs = {
    "scroll":           { "type": "boolean", "defaultValue": true },
    "height":           { "type": "text" },
    "interval":         { "type": "float", "defaultValue": 10 },
    "collapsible":      { "type": "boolean", "defaultValue": false },
    "collapsed":        { "type": "boolean", "defaultValue": false }
};

/**
 * @static
 * @param {Object} configuration
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.NumericRangeFacet}
 */
Exhibit.NumericRangeFacet.create = function(configuration, containerElmt, uiContext) {
    var uiContext, facet;
    uiContext = Exhibit.UIContext.create(configuration, uiContext);
    facet = new Exhibit.NumericRangeFacet(
        containerElmt,
        uiContext
    );
    
    Exhibit.NumericRangeFacet._configure(facet, configuration);
    
    facet._initializeUI();
    uiContext.getCollection().addFacet(facet);
    facet.register();

    return facet;
};

/**
 * @static
 * @param {Element} configElmt
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.NumericRangeFacet}
 */
Exhibit.NumericRangeFacet.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var configuration, uiContext, facet, expressionString;
    configuration = Exhibit.getConfigurationFromDOM(configElmt);
    uiContext = Exhibit.UIContext.createFromDOM(configElmt, uiContext);
    facet = new Exhibit.NumericRangeFacet(
        (typeof containerElmt !== "undefined" && containerElmt !== null) ? containerElmt : configElmt, 
        uiContext
    );
    
    Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt, facet.getSettingSpecs(), facet._settings);
    
    try {
        expressionString = Exhibit.getAttribute(configElmt, "expression");
        if (expressionString !== null && expressionString.length > 0) {
            facet.setExpressionString(expressionString);
            facet.setExpression(Exhibit.ExpressionParser.parse(expressionString));
        }
    } catch (e) {
        Exhibit.Debug.exception(e, Exhibit._("%facets.error.configuration", "NumericRangeFacet"));
    }
    Exhibit.NumericRangeFacet._configure(facet, configuration);
    
    facet._initializeUI();
    uiContext.getCollection().addFacet(facet);
    facet.register();
    
    return facet;
};

/**
 * @static
 * @private
 * @param {Exhibit.NumericRangeFacet} facet
 * @param {Object} configuration
 */
Exhibit.NumericRangeFacet._configure = function(facet, configuration) {
    var segment, property;
    Exhibit.SettingsUtilities.collectSettings(configuration, facet.getSettingSpecs(), facet._settings);
    
    if (typeof configuration.expression !== "undefined") {
        facet.setExpression(Exhibit.ExpressionParser.parse(configuration.expression));
        facet.setExpressionString(configuration.expression);
    }
    
    if (typeof facet._settings.facetLabel === "undefined") {
        if (facet.getExpression() !== null && facet.getExpression().isPath()) {
            segment = facet.getExpression().getPath().getLastSegment();
            property = facet.getUIContext().getDatabase().getProperty(segment.property);
            if (property !== null) {
                facet._settings.facetLabel = segment.forward ? property.getLabel() : property.getReverseLabel();
            }
        }
    }
    
    if (facet._settings.collapsed) {
        facet._settings.collapsible = true;
    }
};

/**
 *
 */
Exhibit.NumericRangeFacet.prototype.dispose = function() {
    this.getUIContext().getCollection().removeFacet(this);
    Exhibit.jQuery(this.getUIContext().getCollection().getElement()).unbind(
        "onRootItemsChanged.exhibit",
        this._onRootItemsChanged
    );
    this._dom = null;
    this._ranges = null;
    this._rangeIndex = null;
    this._dispose();
};

/**
 * @returns {Boolean}
 */
Exhibit.NumericRangeFacet.prototype.hasRestrictions = function() {
    return this._ranges.length > 0;
};

/**
 *
 */
Exhibit.NumericRangeFacet.prototype.clearAllRestrictions = function() {
    Exhibit.jQuery(this.getContainer()).trigger("onBeforeFacetReset.exhibit");
    if (this._ranges.length > 0) {
        this._ranges = [];
        this._notifyCollection();
    }
};

/**
 * @param {Array} restrictions
 */
Exhibit.NumericRangeFacet.prototype.applyRestrictions = function(restrictions) {
    this._ranges = restrictions;
    this._notifyCollection();
};

/**
 * @param {Numeric} from
 * @param {Numeric} to
 * @param {Boolean} selected
 * @param {Array} ranges
 * @returns {Array}
 */
Exhibit.NumericRangeFacet.prototype.setRange = function(from, to, selected, ranges) {
    var i, range;
    if (selected) {
        for (i = 0; i < ranges.length; i++) {
            range = ranges[i];
            if (range.from === from && range.to === to) {
                return;
            }
        }
        ranges.push({ "from": from, "to": to });
    } else {
        for (i = 0; i < ranges.length; i++) {
            range = ranges[i];
            if (range.from === from && range.to === to) {
                ranges.splice(i, 1);
                break;
            }
        }
    }
    return ranges;
};

/**
 * @param {Exhibit.Set} items
 * @returns {Exhibit.Set}
 */
Exhibit.NumericRangeFacet.prototype.restrict = function(items) {
    var path, database, set, i, range;
    if (this._ranges.length === 0) {
        return items;
    } else if (this.getExpression().isPath()) {
        path = this.getExpression().getPath();
        database = this.getUIContext().getDatabase();
        
        set = new Exhibit.Set();
        for (i = 0; i < this._ranges.length; i++) {
            range = this._ranges[i];
            set.addSet(path.rangeBackward(range.from, range.to, false, items, database).values);
        }
        return set;
    } else {
        this._buildRangeIndex();
        
        set = new Exhibit.Set();
        for (i = 0; i < this._ranges.length; i++) {
            range = this._ranges[i];
            this._rangeIndex.getSubjectsInRange(range.from, range.to, false, set, items);
        }
        return set;
    }
};

/**
 * @param {Exhibit.Set} items
 */
Exhibit.NumericRangeFacet.prototype.update = function(items) {
    Exhibit.jQuery(this._dom.valuesContainer).hide().empty();
    
    this._reconstruct(items);
    Exhibit.jQuery(this._dom.valuesContainer).show();
};

/**
 * @private
 * @param {Exhibit.Set} items
 * @returns {Array}
 */
Exhibit.NumericRangeFacet.prototype._reconstruct = function(items) {
    var self, ranges, rangeIndex, computeItems, database, path, propertyId, property, min, max, x, range, i, range2, facetHasSelection, containerDiv, constructFacetItemFunction, makeFacetValue;
    self = this;
    ranges = [];

    if (this.getExpression().isPath()) {
        database = this.getUIContext().getDatabase();
        path = this.getExpression().getPath();
        
        propertyID = path.getLastSegment().property;
        property = database.getProperty(propertyID);
        if (property === null) {
            return null;
        }
       
        rangeIndex = property.getRangeIndex();
        countItems = function(range) {
            return path.rangeBackward(range.from, range.to, false, items, database).values.size();
        }
    } else {
        this._buildRangeIndex();
        
        rangeIndex = this._rangeIndex;
        countItems = function(range) {
            return rangeIndex.getSubjectsInRange(range.from, range.to, false, null, items).size();
        }
    }
    
    min = rangeIndex.getMin();
    max = rangeIndex.getMax();
    min = Math.floor(min / this._settings.interval) * this._settings.interval;
    max = Math.ceil((max + this._settings.interval) / this._settings.interval) * this._settings.interval;
    
    for (x = min; x < max; x += this._settings.interval) {
        range = { 
            from:       x, 
            to:         x + this._settings.interval, 
            selected:   false
        };
        range.count = countItems(range);
        
        for (i = 0; i < this._ranges.length; i++) {
            range2 = this._ranges[i];
            if (range2.from === range.from && range2.to === range.to) {
                range.selected = true;
                facetHasSelection = true;
                break;
            }
        }
        
        ranges.push(range);
    }
    
    facetHasSelection = this._ranges.length > 0;
    containerDiv = this._dom.valuesContainer;
    Exhibit.jQuery(containerDiv).hide();
    constructFacetItemFunction = Exhibit.FacetUtilities[this._settings.scroll ? "constructFacetItem" : "constructFlowingFacetItem"];
    makeFacetValue = function(from, to, count, selected) {
        var onSelect, onSelectOnly, elmt;
        onSelect = function(evt) {
            self._toggleRange(from, to, selected, false);
            evt.preventDefault();
            evt.stopPropagation();
        };
        onSelectOnly = function(evt) {
            self._toggleRange(from, to, selected, !(evt.ctrlKey || evt.metaKey));
            evt.preventDefault();
            evt.stopPropagation();
        };
        elmt = constructFacetItemFunction(
            Exhibit._("%facets.numeric.rangeShort", from, to), 
            count, 
            null,
            selected, 
            facetHasSelection,
            onSelect,
            onSelectOnly,
            self.getUIContext()
        );
        Exhibit.jQuery(containerDiv).append(elmt);
    };
        
    for (i = 0; i < ranges.length; i++) {
        range = ranges[i];
        if (range.selected || range.count > 0) {
            makeFacetValue(range.from, range.to, range.count, range.selected);
        }
    }
    
    Exhibit.jQuery(containerDiv).show();
    
    this._dom.setSelectionCount(this._ranges.length);
};

/**
 * @private
 */
Exhibit.NumericRangeFacet.prototype._notifyCollection = function() {
    this.getUIContext().getCollection().onFacetUpdated(this);
};

/**
 * @private
 */
Exhibit.NumericRangeFacet.prototype._initializeUI = function() {
    var self = this;
    this._dom = Exhibit.FacetUtilities[this._settings.scroll ? "constructFacetFrame" : "constructFlowingFacetFrame"](
		this,
        this.getContainer(),
        this.getLabel(),
        function(elmt, evt, target) { self._clearSelections(); },
        this.getUIContext(),
        this._settings.collapsible,
        this._settings.collapsed
    );
    
    if (typeof this._settings.height !== "undefined" && this._settings.height !== null) {
        Exhibit.jQuery(this._dom.valuesContainer).css("height", this._settings.height);
    }
};

/**
 * @private
 * @param {Numeric} from
 * @param {Numeric} to
 * @param {Boolean} wasSelected
 * @param {Boolean} singleSelection
 */
Exhibit.NumericRangeFacet.prototype._toggleRange = function(from, to, wasSelected, singleSelection) {
    var self, label, wasOnlyThingSelected, newRestrictions, oldRestrictions;
    self = this;
    label = Exhibit._("%facets.numeric.rangeWords", from, to);
    wasOnlyThingSelected = (this._ranges.length === 1 && wasSelected);
    if (singleSelection && !wasOnlyThingSelected) {
        newRestrictions = { "ranges": [ { from: from, to: to } ] };
        Exhibit.History.pushComponentState(
            this,
            Exhibit.Facet.getRegistryKey(),
            newRestrictions,
            Exhibit._("%facets.facetSelectOnlyActionTitle", label, this.getLabel()),
            true
        );
    } else {
        oldRestrictions = [].concat(this._ranges);
        newRestrictions = { "ranges": self.setRange(from, to, !wasSelected, oldRestrictions) };
        Exhibit.History.pushComponentState(
            this,
            Exhibit.Facet.getRegistryKey(),
            newRestrictions,
            Exhibit._(wasSelected ? "%facets.facetUnselectActionTitle" : "%facets.facetSelectActionTitle", label, this.getLabel()),
            true
        );
    }
};

/**
 * @private
 */
Exhibit.NumericRangeFacet.prototype._clearSelections = function() {
    Exhibit.History.pushComponentState(
        this,
        Exhibit.Facet.getRegistryKey(),
        this.exportEmptyState(),
        Exhibit._("%facets.facetClearSelectionsActionTitle", this.getLabel()),
        true
    );
};

/**
 * @private
 */
Exhibit.NumericRangeFacet.prototype._buildRangeIndex = function() {
    var expression, database, getter;
    if (typeof this._rangeIndex !== "undefined") {
        expression = this.getExpression();
        database = this.getUIContext().getDatabase();
        getter = function(item, f) {
            expression.evaluateOnItem(item, database).values.visit(function(value) {
                if (typeof value !== "number") {
                    value = parseFloat(value);
                }
                if (!isNaN(value)) {
                    f(value);
                }
            });
        };
    
        this._rangeIndex = new Exhibit.Database._RangeIndex(
            this.getUIContext().getCollection().getAllItems(),
            getter
        );    
    }
};

/**
 *
 */
Exhibit.NumericRangeFacet.prototype.exportEmptyState = function() {
    return this._exportState(true);
};

/**
 *
 */
Exhibit.NumericRangeFacet.prototype.exportState = function() {
    return this._exportState(false);
};

/**
 * @param {Boolean} empty
 * @returns {Object}
 */
Exhibit.NumericRangeFacet.prototype._exportState = function(empty) {
    var r = [];

    if (!empty) {
        r = this._ranges;
    }

    return {
        "ranges": r
    };
};

/**
 * @param {Object} state
 * @param {Array} state.ranges
 */
Exhibit.NumericRangeFacet.prototype.importState = function(state) {
    if (this.stateDiffers(state)) {
        if (state.ranges.length === 0) {
            this.clearAllRestrictions();
        } else {
            this.applyRestrictions(state.ranges);
        }
    }
};

/**
 * @param {Object} state
 * @param {Array} state.ranges
 */
Exhibit.NumericRangeFacet.prototype.stateDiffers = function(state) {
    var rangeStartCount, stateStartCount, stateSet;

    stateStartCount = state.ranges.length;
    rangeStartCount = this._ranges.length;

    if (stateStartCount !== rangeStartCount) {
        return true;
    } else {
        stateSet = new Exhibit.Set(state.ranges);
        stateSet.addSet(this._ranges);
        if (stateSet.size() !== stateStartCount) {
            return true;
        }
    }

    return false;
};
