/**
 * @fileOverview Cloud facet functions and UI
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 * @author <a href="mailto:axel@pike.org">Axel Hecht</a>
 */

/**
 * @constructor
 * @class
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.CloudFacet = function(containerElmt, uiContext) {
    this._div = containerElmt;
    this._uiContext = uiContext;
    this._colorCoder = null;
    
    this._expression = null;
    this._expressionString = null;
    this._valueSet = new Exhibit.Set();
    this._selectMissing = false;
    
    this._settings = {};
    this._dom = null;
    
    var self = this;
};

/**
 * @constant
 */
Exhibit.CloudFacet._settingSpecs = {
    "facetLabel":       { type: "text" },
    "minimumCount":     { type: "int", defaultValue: 1 },
    "showMissing":      { type: "boolean", defaultValue: true },
    "missingLabel":     { type: "text" }
};

/**
 * @param {Object} configuration
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.CloudFacet}
 */
Exhibit.CloudFacet.create = function(configuration, containerElmt, uiContext) {
    var facet, thisUIContext;
    thisUIContext = Exhibit.UIContext.create(configuration, uiContext);
    facet = new Exhibit.CloudFacet(containerElmt, thisUIContext);
    
    Exhibit.CloudFacet._configure(facet, configuration);
    
    facet._initializeUI();
    thisUIContext.getCollection().addFacet(facet);
    
    return facet;
};

/**
 * @param {Element} configElmt
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.CloudFacet}
 */
Exhibit.CloudFacet.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var configuration, thisUIContext, facet, expressionString, selection, selectMissing, i;
    configuration = Exhibit.getConfigurationFromDOM(configElmt);
    thisUIContext = Exhibit.UIContext.createFromDOM(configElmt, uiContext);
    facet = new Exhibit.CloudFacet(
        containerElmt !== null ? containerElmt : configElmt, 
        thisUIContext
    );
    
    Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt, Exhibit.CloudFacet._settingSpecs, facet._settings);
    
    try {
        expressionString = Exhibit.getAttribute(configElmt, "expression");
        if (expressionString !== null && expressionString.length > 0) {
            facet._expression = Exhibit.ExpressionParser.parse(expressionString);
            facet._expressionString = expressionString;
        }

        selection = Exhibit.getAttribute(configElmt, "selection", ";");
        if (selection !== null && selection.length > 0) {
            for (i = 0; i < selection.length; i++) {
                facet._valueSet.add(selection[i]);
            }
        }
        
        selectMissing = Exhibit.getAttribute(configElmt, "selectMissing");
        if (selectMissing !== null && selectMissing.length > 0) {
            facet._selectMissing = (selectMissing === "true");
        }
    } catch (e) {
        Exhibit.Debug.exception(e, "CloudFacet: Error processing configuration of list facet");
    }
    Exhibit.CloudFacet._configure(facet, configuration);

    facet._initializeUI();
    thisUIContext.getCollection().addFacet(facet);

    return facet;
};

/**
 * @param {Exhibit.CloudFacet}
 * @param {Object} configuration
 */
Exhibit.CloudFacet._configure = function(facet, configuration) {
    var selection, i, segment, property, values, orderMap, formatter;
    Exhibit.SettingsUtilities.collectSettings(configuration, Exhibit.CloudFacet._settingSpecs, facet._settings);
    
    if (typeof configuration.expression !== "undefined") {
        facet._expressionString = configuration.expression;
        facet._expression = Exhibit.ExpressionParser.parse(configuration.expression);
    }
    if (typeof configuration.selection !== "undefined") {
        selection = configuration.selection;
        for (i = 0; i < selection.length; i++) {
            facet._valueSet.add(selection[i]);
        }
    }
    if (typeof configuration.selectMissing !== "undefined") {
        facet._selectMissing = configuration.selectMissing;
    }

    facet._setIdentifier();
    Exhibit.Registry.register(Exhibit.Facet._registryKey, facet.getID(), facet);
};

/**
 * Set the identifier to the HTML element ID or generate a
 * non-random, deterministic hash for this component.
 */
Exhibit.CloudFacet.prototype._setIdentifier = function() {
    var id, self, rank;

    id = $(this._div).attr("id");
    self = this;

    if (typeof id === "undefined") {
        // @@@ should this be bothered with?  just warn if the generated ID
        //     produces a collision that author needs to add their own IDs?
        /**
        rank = < number of processed components >
        */
        id = Exhibit.Facet._registryKey
            + "-"
            + this._expressionString
            + "-"
            + this._uiContext.getCollection().getID();
    }

    this._id = id;
};

/**
 * @returns {String}
 */
Exhibit.CloudFacet.prototype.getID = function() {
    return this._id;
};

/**
 *
 */
Exhibit.CloudFacet.prototype.dispose = function() {
    this._uiContext.getCollection().removeFacet(this);
    
    this._uiContext.getCollection().removeListener(this._listener);
    this._uiContext = null;
    
    this._div.innerHTML = "";
    this._div = null;
    this._dom = null;
    
    this._expression = null;
    this._valueSet = null;
    this._settings = null;
    
    this._itemToValue = null;
    this._valueToItem = null;
    this._missingItems = null;
};

/**
 * @returns {Boolean}
 */
Exhibit.CloudFacet.prototype.hasRestrictions = function() {
    return this._valueSet.size() > 0 || this._selectMissing;
};

/**
 *
 */
Exhibit.CloudFacet.prototype.clearAllRestrictions = function() {
    this._valueSet = new Exhibit.Set();
    this._selectMissing = false;
    this._notifyCollection();
};

/**
 * @param {Array} restrictions
 */
Exhibit.CloudFacet.prototype.applyRestrictions = function(restrictions) {
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
Exhibit.CloudFacet.prototype.setSelection = function(value, selected) {
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
Exhibit.CloudFacet.prototype.setSelectMissing = function(selected) {
    if (selected !== this._selectMissing) {
        this._selectMissing = selected;
        this._notifyCollection();
    }
};

/**
 * @param {Exhibit.Set} items
 * @returns {Exhibit.Set}
 */
Exhibit.CloudFacet.prototype.restrict = function(items) {
    if (this._valueSet.size() === 0 && !this._selectMissing) {
        return items;
    }
    
    var set, itemA, i, item;
    if (this._expression.isPath()) {
        set = this._expression.getPath().walkBackward(
            this._valueSet, 
            "item", items, 
            this._uiContext.getDatabase()
        ).getSet();
    } else {
        this._buildMaps();
        
        set = new Exhibit.Set();
        
        var valueToItem = this._valueToItem;
        this._valueSet.visit(function(value) {
            if (typeof valueToItem[value] !== "undefined") {
                itemA = valueToItem[value];
                for (i = 0; i < itemA.length; i++) {
                    item = itemA[i];
                    if (items.contains(item)) {
                        set.add(item);
                    }
                }
            }
        });
    }
    
    if (this._selectMissing) {
        this._buildMaps();
        
        var missingItems = this._missingItems;
        items.visit(function(item) {
            if (typeof missingItems[item] !== "undefined") {
                set.add(item);
            }
        });
    }
    
    return set;
};

/**
 * @param {Exhibit.Set} items
 */
Exhibit.CloudFacet.prototype.update = function(items) {
    this._constructBody(this._computeFacet(items));
};

/**
 * @param {Exhibit.Set} items
 * @returns {Array}
 */
Exhibit.CloudFacet.prototype._computeFacet = function(items) {
    var database, entries, valueType, self, path, facetValueResult, itemSubcollection, value, itemA, count, i, item;
    database = this._uiContext.getDatabase();
    entries = [];
    valueType = "text";
    self = this;
    if (this._expression.isPath()) {
        path = this._expression.getPath();
        facetValueResult = path.walkForward(items, "item", database);
        valueType = facetValueResult.valueType;
        if (facetValueResult.size > 0) {
            facetValueResult.forEachValue(function(facetValue) {
                itemSubcollection = path.evaluateBackward(facetValue, valueType, items, database);
                if (itemSubcollection.size >= self._settings.minimumCount || self._valueSet.contains(facetValue)) {
                    entries.push({ value: facetValue, count: itemSubcollection.size });
                }
            });
        }
    } else {
        this._buildMaps();
        
        valueType = this._valueType;
        for (value in this._valueToItem) {
            itemA = this._valueToItem[value];
            count = 0;
            for (i = 0; i < itemA.length; i++) {
                if (items.contains(itemA[i])) {
                    count++;
                }
            }
            
            if (count >= this._settings.minimumCount || this._valueSet.contains(value)) {
                entries.push({ value: value, count: count });
            }
        }
    }
    
    if (entries.length > 0) {
        selection = this._valueSet;
        labeler = valueType === "item" ?
            function(v) { var l = database.getObject(v, "label"); return l !== null ? l : v; } :
            function(v) { return v; };
            
        for (i = 0; i < entries.length; i++) {
            entry = entries[i];
            entry.actionLabel = entry.selectionLabel = labeler(entry.value);
            entry.selected = selection.contains(entry.value);
        }
        
        var sortValueFunction = function(a, b) { return a.selectionLabel.localeCompare(b.selectionLabel); };
        if (typeof this._orderMap !== "undefined") {
            var orderMap = this._orderMap;
            
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
        
        var sortFunction = sortValueFunction;
        if (this._settings.sortMode === "count") {
            sortFunction = function(a, b) {
                var c = b.count - a.count;
                return c !== 0 ? c : sortValueFunction(a, b);
            };
        }

        var sortDirectionFunction = sortFunction;
        if (this._settings.sortDirection === "reverse"){
            sortDirectionFunction = function(a, b) {
                return sortFunction(b, a);
            };
        }

        entries.sort(sortDirectionFunction);
    }
    
    if (this._settings.showMissing || this._selectMissing) {
        this._buildMaps();
        
        count = 0;
        for (item in this._missingItems) {
            if (items.contains(item)) {
                count++;
            }
        }
        
        if (count > 0 || this._selectMissing) {
            span = document.createElement("span");
            span.innerHTML = (typeof this._settings.missingLabel !== "undefined") ? 
                this._settings.missingLabel : Exhibit.FacetUtilities.l10n.missingThisField;
            span.className = "exhibit-facet-value-missingThisField";
            
            entries.unshift({
                value:          null, 
                count:          count,
                selected:       this._selectMissing,
                selectionLabel: span,
                actionLabel:    Exhibit.FacetUtilities.l10n.missingThisField
            });
        }
    }
    
    return entries;
};

/**
 *
 */
Exhibit.CloudFacet.prototype._notifyCollection = function() {
    this._uiContext.getCollection().onFacetUpdated(this);
};

/**
 *
 */
Exhibit.CloudFacet.prototype._initializeUI = function() {
    this._div.innerHTML = "";
    this._div.className = "exhibit-cloudFacet";

    var dom = $.simileDOM("string", this._div,
        ((typeof this._settings.facetLabel !== "undefined") ?
            (   "<div class='exhibit-cloudFacet-header'>" +
                    "<span class='exhibit-cloudFacet-header-title'>" + this._settings.facetLabel + "</span>" +
                "</div>"
            ) :
            ""
        ) +
        "<div class='exhibit-cloudFacet-body' id='valuesContainer'></div>"
    );

    this._dom = dom;
};

/**
 * @param {Array} entries
 */
Exhibit.CloudFacet.prototype._constructBody = function(entries) {
    var self, containerDiv, constructFacetItemFunction, facetHasSelection, constructValue, j, min, max, entry, range;
    self = this;
    containerDiv = this._dom.valuesContainer;
    
    $(containerDiv).hide();
    containerDiv.innerHTML = "";
    
    if (entries.length > 0) {
        min = Number.POSITIVE_INFINITY;
        max = Number.NEGATIVE_INFINITY;
        for (j = 0; j < entries.length; j++) {
            entry = entries[j];
            min = Math.min(min, entry.count);
            max = Math.max(max, entry.count);
        }
        range = max - min;
        
        constructValue = function(entry) {
            var onSelect, onSelectOnly, elmt;
            onSelect = function(evt) {
                    self._filter(entry.value, entry.actionLabel, !(evt.ctrlKey || evt.metaKey));
                    evt.preventDefault();
                    evt.stopPropagation();
            };
            
            elmt = document.createElement("span");
            
            elmt.appendChild(document.createTextNode("\u00A0"));
            if (typeof entry.selectionLabel === "string") {
                elmt.appendChild(document.createTextNode(entry.selectionLabel));
            } else {
                elmt.appendChild(entry.selectionLabel);
            }
            elmt.appendChild(document.createTextNode("\u00A0"));
            
            elmt.className = entry.selected ? 
                "exhibit-cloudFacet-value exhibit-cloudFacet-value-selected" :
                "exhibit-cloudFacet-value";
                
            if (entry.count > min) {
                elmt.style.fontSize = Math.ceil(100 + 100 * Math.log(1 + 1.5 * (entry.count - min) / range)) + "%";
            }
            
            $(elmt).bind("click", onSelect);
        
            $(containerDiv).append(elmt);
            $(containerDiv).append(document.createTextNode(" "));
        };
    
        for (j = 0; j < entries.length; j++) {
            constructValue(entries[j]);
        }
    
        $(containerDiv).show();
    }
};

/**
 * @param {String} value
 * @param {String} label
 * @param {Boolean} selectOnly
 */
Exhibit.CloudFacet.prototype._filter = function(value, label, selectOnly) {
    var self, selected, select, deselect, oldValues, oldSelectMissing, newValues, newSelectMissing, actionLabel, wasSelected, wasOnlyThingSelected, newRestrictions;
    self = this;
    
    oldValues = new Exhibit.Set(this._valueSet);
    oldSelectMissing = this._selectMissing;
    
    if (value === null) { // the (missing this field) case
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
    
    var facetLabel = (typeof this._settings.facetLabel !== "undefined") ? this._settings.facetLabel : "";
    Exhibit.History.pushComponentState(
        this,
        Exhibit.Facet._registryKey,
        newRestrictions,
        (selectOnly && !wasOnlyThingSelected) ?
            String.substitute(
                Exhibit.FacetUtilities.l10n["facetSelectOnlyActionTitle"],
                [ label, facetLabel ]) :
            String.substitute(
                Exhibit.FacetUtilities.l10n[wasSelected ? "facetUnselectActionTitle" : "facetSelectActionTitle"],
                [ label, facetLabel ]),
        true
    );
};

Exhibit.CloudFacet.prototype._clearSelections = function() {
    Exhibit.History.pushComponentState(
        this,
        Exhibit.Facet._registryKey,
        this.exportEmptyState(),
        String.substitute(
            Exhibit.FacetUtilities.l10n["facetClearSelectionsActionTitle"],
            [ this._settings.facetLabel ]),
        true
    );
};

Exhibit.CloudFacet.prototype._buildMaps = function() {
    if (typeof this._itemToValue === "undefined") {
        var itemToValue = {};
        var valueToItem = {};
        var missingItems = {};
        var valueType = "text";
        orderMap = this._orderMap;
        
        var insert = function(x, y, map) {
            if (typeof map[x] !== "undefined") {
                map[x].push(y);
            } else {
                map[x] = [ y ];
            }
        };
        
        var expression = this._expression;
        var database = this._uiContext.getDatabase();
        
        this._uiContext.getCollection().getAllItems().visit(function(item) {
            var results = expression.evaluateOnItem(item, database);
            if (results.values.size() > 0) {
                valueType = results.valueType;
                results.values.visit(function(value) {
                    insert(item, value, itemToValue);
                    insert(value, item, valueToItem);
                });
            } else {
                missingItems[item] = true;
            }
        });

        this._itemToValue = itemToValue;
        this._valueToItem = valueToItem;
        this._missingItems = missingItems;
        this._valueType = valueType;
    }
};

/**
 * @returns {Object}
 */
Exhibit.CloudFacet.prototype.exportState = function() {
    return this._exportState(false);
};

/**
 * @returns {Object}
 */
Exhibit.CloudFacet.prototype.exportEmptyState = function() {
    return this._exportState(true);
};

/**
 * @private
 * @param {Boolean} empty
 */
Exhibit.CloudFacet.prototype._exportState = function(empty) {
    var s = [];

    if (!empty) {
        s = this._valueSet.toArray();
    }

    return {
        "selection": s,
        "selectMissing": this._selectMissing
    };
};

/**
 * @param {Object} state
 */
Exhibit.CloudFacet.prototype.importState = function(state) {
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
 * is always faster than just going through with thei mport.
 * 
 * @param {Object} state
 */
Exhibit.CloudFacet.prototype.stateDiffers = function(state) {
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
