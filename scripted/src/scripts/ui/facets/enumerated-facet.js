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
Exhibit.EnumeratedFacet = function(){
};

// eob
Exhibit.EnumeratedFacet.ConfigurationSpecJson = {
};
Exhibit.EnumeratedFacet.Spec = new ConfigurationSpec(
  Exhibit.EnumeratedFacet.ConfigurationSpecJson
);


/**
 * @param {Element} configElmt
 * @param {Element} containerElmt
 * @param {Object} settingsFromDOM
 * @param {Exhibit.UIContext} thisUIContext
 * @returns {Exhibit.CloudFacet}
 */
Exhibit.EnumeratedFacet.create = function (configElmt, facet, settingsFromDOM, thisUIContext) {
    var configuration = Exhibit.getConfigurationFromDOM(configElmt);

    // eob
    // facet.configuration =
    //    Exhibit.EnumeratedFacet.Spec.createInstance(
    //       null, configElmt);
    //
    Exhibit.EnumeratedFacet.includeSettingsFromDOM(configElmt, facet, settingsFromDOM);
    (facet instanceof Exhibit.CloudFacet) ? Exhibit.CloudFacet._configure(facet, configuration) : Exhibit.ListFacet._configure(facet, configuration);
    facet._initializeUI();
    thisUIContext.getCollection().addFacet(facet);
    facet.register();
}

/**
 * @param {Element} configElmt
 * @param {Exhibit.EnumeratedFacet} facet
 * @param {Object} settingsFromDOM
 */
Exhibit.EnumeratedFacet.includeSettingsFromDOM = function(configElmt, facet, settingsFromDOM){
    if (settingsFromDOM["expression"] !== "undefined" && settingsFromDOM["expressionString"] !== "undefined") {
        facet.setExpression(Exhibit.ExpressionParser.parse(settingsFromDOM["expressionString"]));
        facet.setExpressionString(settingsFromDOM["expressionString"]);
    }

    if (settingsFromDOM["valueSet"] !== "undefined") {
        for (i = 0; i < settingsFromDOM["valueSet"].length; i++){
            facet._valueSet.add(settingsFromDOM["valueSet"][i]);
        }
    }

    if (settingsFromDOM["selectMissing"] !== "undefined") {
        facet._selectMissing = (settingsFromDOM["selectMissing"] === "true");
    }
    Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt, facet.getSettingSpecs(), facet._settings);
}

/**
 * @param {Element} configElmt
 * @returns {Object} settingsFromDOM
 */
Exhibit.EnumeratedFacet.buildSettingsFromDOM = function(configElmt) {
    var settingsFromDOM = {
        "expression": "undefined",
        "expressionString" : "undefined",
        "valueSet" : "undefined",
        "selectMissing" : "undefined"
    };

    try {
        expressionString = Exhibit.getAttribute(configElmt, "expression");
        if (typeof expressionString !== "undefined" && expressionString !== null && expressionString.length > 0){
            settingsFromDOM["expression"] = Exhibit.ExpressionParser.parse(expressionString);
            settingsFromDOM["expressionString"] = expressionString
        }

        selection = Exhibit.getAttribute(configElmt, "selection", ";");
        if (typeof selection !== "undefined" && selection !== null && selection.length > 0) {
            settingsFromDOM["valueSet"] = [];
            for (i = 0; i < selection.length; i++) {
                settingsFromDOM.push(selection[i]);
            }
        }

        selectMissing = Exhibit.getAttribute(configElmt, "selectMissing");
        if (typeof selectMissing !== "undefined" && selectMissing !== null && selectMissing.length > 0) {
            settingsFromDOM["selectMissing"] = (selectMissing === "true");
        }

    } catch (e) {
         Exhibit.Debug.exception(e, Exhibit._("%facets.error.configuration", "EnumeratedFacet"));
    }

    return settingsFromDOM;
}

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
 * @returns {Object}
 */
 Exhibit.EnumeratedFacet.prototype.exportState = function() {
    return this._exportState(false);
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
