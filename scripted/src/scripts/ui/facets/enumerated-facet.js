//@ sourceURL=foo.js
/**
* @fileOverview generalized for cloud and list facet functions and UI
* @author Tochukwu Okoro
*/

/**
* EnumeratedFacet class consolidates methods that are used in CloudFacet and ListFacet. 
* @constructor
* @class
*/
Exhibit.EnumeratedFacet = function (key, div, uiContext){
    Exhibit.Facet.call(this, key, div, uiContext);
    this._valueSet = new Exhibit.Set();
    this._selectMissing = false;
    this.addSettingSpecs(Exhibit.EnumeratedFacet._settingSpecs);
    this._orderMap = null;
};

Exhibit.EnumeratedFacet.prototype = new Exhibit.Facet();

Exhibit.EnumeratedFacet._settingSpecs = {
    "expression":        { "type": "text" },
    "selection":         { "type": "text", "dimensions": "*",
                           "separator": ";"},
    "selectMissing":     { "type": "boolean", "defaultValue": false},
    "showMissing":       { "type": "boolean", "defaultValue": true },
    "missingLabel":      { "type": "text" },
    "minimumCount":      { "type": "int", "defaultValue": 1 },
    "fixedOrder":        { "type": "text" },
    "sortMode":          { "type": "text", "defaultValue": "value" },
    "sortDirection":     { "type": "text", "defaultValue": "forward" }
};

Exhibit.EnumeratedFacet.create = function (FacetType,
                                           containerElmt,
                                           uiContext,
                                           collectSettings) {
    var configuration = {}
    , facet = new FacetType(containerElmt, uiContext)
    ;

    collectSettings(facet, configuration);
    facet._configure(configuration);    
    facet._initializeUI();
    uiContext.getCollection().addFacet(facet);
    facet.register();
    return facet;
};
                                         

/**
 * @param {Element} configElmt
 * @param {Element} containerElmt
 * @param {Object} settingsFromDOM
 * @param {Exhibit.UIContext} uiContext
 * @returns {facetType}
 */
Exhibit.EnumeratedFacet.createFromDOM = function (FacetType,
                                                  configElmt, containerElmt,
                                                  uiContext) {
    return Exhibit.EnumeratedFacet.create(
        FacetType,
        (typeof containerElmt !== "undefined" && containerElmt !== null) ?
            containerElmt : configElmt, 
        Exhibit.UIContext.createFromDOM(configElmt, uiContext),
        function(facet, configuration) {
            Exhibit.SettingsUtilities
                .collectSettingsFromDOM(configElmt, 
                                        facet.getSettingSpecs(), 
                                        configuration);
        });
};

/**
 * @param {Object} configObj
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {facetType}
 */
Exhibit.EnumeratedFacet.createFromObj = function (FacetType, 
                                                  configObj, containerElmt, 
                                                  uiContext) {
    return Exhibit.EnumeratedFacet.create(
        FacetType,
        configObj,
        Exhibit.UIContext.create(configObj, uiContext),
        function(facet, configuration) {
            Exhibit.SettingsUtilities
                .collectSettings(configObj, 
                                 facet.getSettingSpecs(), configuration);
        });
};

Exhibit.EnumeratedFacet.prototype.dispose = function () {
    this._cache.dispose();
    this._cache = null;
    this._dom = null;
    this._valueSet = null;
    this._orderMap = null;
    Exhibit.Facet.prototype.dispose.call(this);
};

/**
 * @param {Object} configuration
 */
Exhibit.EnumeratedFacet.prototype._configure = function(configuration) {
    var selection, i;

    this._settings = configuration;
    if (typeof configuration.expression !== "undefined") {
        this.setExpressionString(configuration.expression);
        this.setExpression(Exhibit.ExpressionParser.parse(configuration.expression));
    }
    if (typeof configuration.selection !== "undefined") {
        selection = configuration.selection;
        for (i = 0; i < selection.length; i++) {
            this._valueSet.add(selection[i]);
        }
    }
    if (typeof configuration.selectMissing !== "undefined") {
        this._selectMissing = configuration.selectMissing;
    }

    this._cache = new Exhibit.FacetUtilities.Cache(
        this.getUIContext().getDatabase(),
        this.getUIContext().getCollection(),
        this.getExpression()
    );
};


/**
 * @param {Exhibit.Set} items
 * @returns {Exhibit.Set}
 */
Exhibit.EnumeratedFacet.prototype.restrict = function(items) {
    if (this._valueSet.size() === 0 && !this._selectMissing) {
        return items;
    }

    var set = this._cache.getItemsFromValues(this._valueSet, items);
    if (this._selectMissing) {
        this._cache.getItemsMissingValue(items, set);
    }
    
    
    return set;
};


/**
* @returns {Boolean}
*/
Exhibit.EnumeratedFacet.prototype.hasRestrictions = function() {
       return this._valueSet.size() > 0 || this._selectMissing;
};

/**
 *
 */
Exhibit.EnumeratedFacet.prototype.clearAllRestrictions = function() {
    Exhibit.jQuery(this.getContainer()).trigger("onBeforeFacetReset.exhibit");
    this._valueSet = new Exhibit.Set();
    this._selectMissing = false;
    this._notifyCollection();
};

/**
 * @param {Array} restrictions
 */
Exhibit.EnumeratedFacet.prototype.applyRestrictions = function(restrictions) {
    var i;
    this._valueSet = new Exhibit.Set();
    for (i = 0; i < restrictions.selection.length; i++) {
        this._valueSet.add(restrictions.selection[i]);
    }
    this._selectMissing = restrictions.selectMissing;
    
    this._notifyCollection();
};

/**
 * @param {String} value
 * @param {Boolean} selected
 */
Exhibit.EnumeratedFacet.prototype.setSelection = function(value, selected) {
    if (selected) {
        this._valueSet.add(value);
    } else {
        this._valueSet.remove(value);
    }
    this._notifyCollection();
};

/**
 * @param {Boolean} selected
 */
Exhibit.EnumeratedFacet.prototype.setSelectMissing = function(selected) {
    if (selected !== this._selectMissing) {
        this._selectMissing = selected;
        this._notifyCollection();
    }
};

/**
 *
 */
Exhibit.EnumeratedFacet.prototype._notifyCollection = function() {
    this.getUIContext().getCollection().onFacetUpdated(this);
};

/**
 *
 */
Exhibit.EnumeratedFacet.prototype._clearSelections = function() {
    Exhibit.History.pushComponentState(
        this,
        Exhibit.Facet.getRegistryKey(),
        this.exportEmptyState(),
        Exhibit._("%facets.facetClearSelectionsActionTitle", this.getLabel()),
        true
    );
};


/**
 * @param {Exhibit.Set} items
 * @returns {Array}
 */
Exhibit.EnumeratedFacet.prototype._computeFacet = function(items) {
    var database, r, entries, valueType, selection, labeler, i, entry, count, span;
    database = this.getUIContext().getDatabase();
    r = this._cache.getValueCountsFromItems(items);
    entries = [];

    for (i=0; i < r.entries.length; i++) {
        if ((r.entries[i].count >= this._settings.minimumCount) ||
            (this._valueSet.countains(r.entries[i].value))) {
            entries.push(r.entries[i]);
        }
    }
    
    valueType = r.valueType;

    if (entries.length > 0) {
        selection = this._valueSet;
        labeler = valueType === "item" ?
            function(v) { var l = database.getObject(v, "label"); 
                          return l !== null ? l : v; } :
            function(v) { return v; };
            
        for (i = 0; i < entries.length; i++) {
            entry = entries[i];
            entry.actionLabel = entry.selectionLabel = labeler(entry.value);
            entry.selected = selection.contains(entry.value);
        }
        
        entries.sort(this._createSortFunction(valueType));
    }
    
    if (this._settings.showMissing || this._selectMissing) {
        count = this._cache.countItemsMissingValue(items);
        if (count > 0 || this._selectMissing) {
            span = Exhibit.jQuery("<span>")
                .attr("class", "exhibit-facet-value-missingThisField")
                .html((typeof this._settings.missingLabel !== "undefined") ? 
                      this._settings.missingLabel :
                      Exhibit._("%facets.missingThisField"));
            
            entries.unshift({
                value:          null, 
                count:          count,
                selected:       this._selectMissing,
                selectionLabel: Exhibit.jQuery(span).get(0),
                actionLabel:    Exhibit._("%facets.missingThisField")
            });
        }
    }
    
    return entries;
};


/**
 * @returns {Object}
 */
Exhibit.EnumeratedFacet.prototype.exportState = function() {
    return this._exportState(false);
};

/**
 * @returns {Object}
 */
Exhibit.EnumeratedFacet.prototype.exportEmptyState = function() {
    return this._exportState(true);
};

/**
 * @private
 * @param {Boolean} empty
 * @returns {Object}
 */
Exhibit.EnumeratedFacet.prototype._exportState = function(empty) {
    var s = [];

    if (!empty) {
        s = this._valueSet.toArray();
    }

    return {
        "selection": s,
        "selectMissing": empty ? false : this._selectMissing
    };
};

/**
 * @param {Object} state
 * @param {Boolean} state.selectMissing
 * @param {Array} state.selection
 */
Exhibit.EnumeratedFacet.prototype.importState = function(state) {
    if (this.stateDiffers(state)) {
        if (state.selection.length === 0 && !state.selectMissing) {
            this.clearAllRestrictions();
        } else {
            this.applyRestrictions(state);
        }
    }
};

/**
 * Check if the state being requested for import is any different from the
 * current state.  This is only a worthwhile function to call if the check
 * is always faster than just going through with the import.
 * 
 * @param {Object} state
 * @param {Boolean} state.selectMissing
 * @param {Array} state.selection
 */
Exhibit.EnumeratedFacet.prototype.stateDiffers = function(state) {
    var stateSet, stateStartCount, valueStartCount;

    if (state.selectMissing !== this._selectMissing) {
        return true;
    }

    stateStartCount = state.selection.length;
    valueStartCount = this._valueSet.size();

    if (stateStartCount !== valueStartCount) {
        return true;
    } else {
        stateSet = new Exhibit.Set(state.selection);
        stateSet.addSet(this._valueSet);
        if (stateSet.size() !== stateStartCount) {
            return true;
        }
    }

    return false;
};

/**
 * @param {String} value
 * @param {String} label
 * @param {Boolean} selectOnly
 */
Exhibit.EnumeratedFacet.prototype._filter = function(value, label, selectOnly) {
    var self, selected, select, deselect, oldValues, oldSelectMissing, newValues, newSelectMissing, actionLabel, wasSelected, wasOnlyThingSelected, newRestrictions;
    self = this;
    
    oldValues = new Exhibit.Set(this._valueSet);
    oldSelectMissing = this._selectMissing;
    
    if (typeof value === "undefined" || value === null) { // the (missing this field) case
        wasSelected = oldSelectMissing;
        wasOnlyThingSelected = wasSelected && (oldValues.size() === 0);
        
        if (selectOnly) {
            if (oldValues.size() === 0) {
                newSelectMissing = !oldSelectMissing;
            } else {
                newSelectMissing = true;
            }
            newValues = new Exhibit.Set();
        } else {
            newSelectMissing = !oldSelectMissing;
            newValues = new Exhibit.Set(oldValues);
        }
    } else {
        wasSelected = oldValues.contains(value);
        wasOnlyThingSelected = wasSelected && (oldValues.size() === 1) && !oldSelectMissing;
        
        if (selectOnly) {
            newSelectMissing = false;
            newValues = new Exhibit.Set();
            
            if (!oldValues.contains(value)) {
                newValues.add(value);
            } else if (oldValues.size() > 1 || oldSelectMissing) {
                newValues.add(value);
            }
        } else {
            newSelectMissing = oldSelectMissing;
            newValues = new Exhibit.Set(oldValues);
            if (newValues.contains(value)) {
                newValues.remove(value);
            } else {
                newValues.add(value);
            }
        }
    }
    
    newRestrictions = { selection: newValues.toArray(), selectMissing: newSelectMissing };

    Exhibit.History.pushComponentState(
        this,
        Exhibit.Facet.getRegistryKey(),
        newRestrictions,
        (selectOnly && !wasOnlyThingSelected) ?
            Exhibit._("%facets.facetSelectOnlyActionTitle", label, this.getLabel()) :
            Exhibit._(wasSelected ? "%facets.facetUnselectActionTitle" : "%facets.facetSelectActionTitle", label, this.getLabel()),
        true
    );
};

/**
 * @param {String} valueType
 * @returns {Function}
 */
Exhibit.EnumeratedFacet.prototype._createSortFunction = function(valueType) {
    var sortValueFunction, orderMap, sortFunction, sortDirectionFunction;
    sortValueFunction = function(a, b) { return a.selectionLabel.localeCompare(b.selectionLabel); };
    if (this._orderMap !== null) {
        orderMap = this._orderMap;
        
        sortValueFunction = function(a, b) {
            if (typeof orderMap[a.selectionLabel] !== "undefined") {
                if (typeof orderMap[b.selectionLabel] !== "undefined") {
                    return orderMap[a.selectionLabel] - orderMap[b.selectionLabel];
                } else {
                    return -1;
                }
            } else if (typeof orderMap[b.selectionLabel] !== "undefined") {
                return 1;
            } else {
                return a.selectionLabel.localeCompare(b.selectionLabel);
            }
        };
    } else if (valueType === "number") {
        sortValueFunction = function(a, b) {
            a = parseFloat(a.value);
            b = parseFloat(b.value);
            return a < b ? -1 : a > b ? 1 : 0;
        };
    }
    
    sortFunction = sortValueFunction;
    if (this._settings.sortMode === "count") {
        sortFunction = function(a, b) {
            var c = b.count - a.count;
            return c !== 0 ? c : sortValueFunction(a, b);
        };
    }

    sortDirectionFunction = sortFunction;
    if (this._settings.sortDirection === "reverse"){
        sortDirectionFunction = function(a, b) {
            return sortFunction(b, a);
        };
    }
    
    return sortDirectionFunction;
};

