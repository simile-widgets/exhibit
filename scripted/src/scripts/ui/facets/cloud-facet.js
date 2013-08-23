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
    Exhibit.jQuery.extend(this, new Exhibit.Facet("cloud", containerElmt, uiContext));
    this.addSettingSpecs(Exhibit.CloudFacet._settingSpecs);
    this._colorCoder = null;
    this._valueSet = new Exhibit.Set();
    this._itemToValue = null;
    this._valueToItem = null;
    this._missingItems = null;
    this._valueType = null;
    this._orderMap = null;
    this._selectMissing = false;
    this._dom = null;
};

/**
 * @constant
 */
Exhibit.CloudFacet._settingSpecs = {
    "minimumCount":     { "type": "int", "defaultValue": 1 },
    "showMissing":      { "type": "boolean", "defaultValue": true },
    "missingLabel":     { "type": "text" }
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
    facet.register();
    
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
        (typeof containerElmt !== "undefined" && containerElmt !== null) ?
            containerElmt :
            configElmt, 
        thisUIContext
    );
    
    Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt, facet.getSettingSpecs(), facet._settings);
    
    try {
        expressionString = Exhibit.getAttribute(configElmt, "expression");
        if (typeof expressionString !== "undefined" && expressionString !== null && expressionString.length > 0) {
            facet.setExpression(Exhibit.ExpressionParser.parse(expressionString));
            facet.setExpressionString(expressionString);
        }

        selection = Exhibit.getAttribute(configElmt, "selection", ";");
        if (typeof selection !== "undefined" && selection !== null && selection.length > 0) {
            for (i = 0; i < selection.length; i++) {
                facet._valueSet.add(selection[i]);
            }
        }
        
        selectMissing = Exhibit.getAttribute(configElmt, "selectMissing");
        if (typeof selectMissing !== "undefined" && selectMissing !== null && selectMissing.length > 0) {
            facet._selectMissing = (selectMissing === "true");
        }
    } catch (e) {
        Exhibit.Debug.exception(e, Exhibit._("%facets.error.configuration", "CloudFacet"));
    }
    Exhibit.CloudFacet._configure(facet, configuration);

    facet._initializeUI();
    thisUIContext.getCollection().addFacet(facet);
    facet.register();

    return facet;
};

/**
 * @param {Exhibit.CloudFacet} facet
 * @param {Object} configuration
 */
Exhibit.CloudFacet._configure = function(facet, configuration) {
    var selection, i, segment, property, values, orderMap, formatter;
    Exhibit.SettingsUtilities.collectSettings(configuration, facet.getSettingSpecs(), facet._settings);
    
    if (typeof configuration.expression !== "undefined") {
        facet.setExpressionString(configuration.expression);
        facet.setExpression(Exhibit.ExpressionParser.parse(configuration.expression));
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
};

/**
 *
 */
Exhibit.CloudFacet.prototype._dispose = function() {
    this._dom = null;
    this._valueSet = null;
    this._itemToValue = null;
    this._valueToItem = null;
    this._valueType = null;
    this._missingItems = null;
    this._orderMap = null;
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
    Exhibit.jQuery(this.getContainer()).trigger("onBeforeFacetReset.exhibit");
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
    var set, itemA, i, item, valueToItem, missingItems;

    if (this._valueSet.size() === 0 && !this._selectMissing) {
        return items;
    }
    
    if (this.getExpression().isPath()) {
        set = this.getExpression().getPath().walkBackward(
            this._valueSet, 
            "item",
            items, 
            this.getUIContext().getDatabase()
        ).getSet();
    } else {
        this._buildMaps();
        
        set = new Exhibit.Set();
        
        valueToItem = this._valueToItem;
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
        
        missingItems = this._missingItems;
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
    var database, entries, valueType, self, path, facetValueResult, itemSubcollection, value, itemA, count, i, item, sortValueFunction, orderMap, sortFunction, sortDirectionFunction;
    database = this.getUIContext().getDatabase();
    entries = [];
    valueType = "text";
    self = this;
    if (this.getExpression().isPath()) {
        path = this.getExpression().getPath();
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
            if (this._valueToItem.hasOwnProperty(value)) {
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

        entries.sort(sortDirectionFunction);
    }
    
    if (this._settings.showMissing || this._selectMissing) {
        this._buildMaps();
        
        count = 0;
        for (item in this._missingItems) {
            if (this._missingItems.hasOwnProperty(item)) {
                if (items.contains(item)) {
                    count++;
                }
            }
        }
        
        if (count > 0 || this._selectMissing) {
            span = Exhibit.jQuery("<span>");
            span.html((typeof this._settings.missingLabel !== "undefined") ? 
                         this._settings.missingLabel :
                         Exhibit._("%facets..missingThisField"));
            span.attr("class", "exhibit-facet-value-missingThisField");
            
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
 *
 */
Exhibit.CloudFacet.prototype._notifyCollection = function() {
    this.getUIContext().getCollection().onFacetUpdated(this);
};

/**
 *
 */
Exhibit.CloudFacet.prototype._initializeUI = function() {
    Exhibit.jQuery(this.getContainer()).empty();
    Exhibit.jQuery(this.getContainer()).addClass("exhibit-cloudFacet");

    var dom = Exhibit.jQuery.simileDOM(
        "string",
        this.getContainer(),
        ((typeof this._settings.facetLabel !== "undefined") ?
         (   "<div class='exhibit-cloudFacet-header'>" +
             "<span class='exhibit-cloudFacet-header-title'>" + this.getLabel() + "</span>" +
             "</div>"
         ) :
         ""
        ) +
            '<div class="exhibit-cloudFacet-body" id="valuesContainer"></div>'
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
    
    Exhibit.jQuery(containerDiv).hide();
    Exhibit.jQuery(containerDiv).empty();
    
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
            
            elmt = Exhibit.jQuery("<span>");
            
            Exhibit.jQuery(elmt).append(document.createTextNode("\u00A0"));
            if (typeof entry.selectionLabel === "string") {
                Exhibit.jQuery(elmt).append(document.createTextNode(entry.selectionLabel));
            } else {
                Exhibit.jQuery(elmt).append(entry.selectionLabel);
            }
            Exhibit.jQuery(elmt).append(document.createTextNode("\u00A0"));
            
            Exhibit.jQuery(elmt).attr("class", entry.selected ? 
                         "exhibit-cloudFacet-value exhibit-cloudFacet-value-selected" :
                         "exhibit-cloudFacet-value");
                
            if (entry.count > min) {
                Exhibit.jQuery(elmt).css("fontSize", Math.ceil(100 + 100 * Math.log(1 + 1.5 * (entry.count - min) / range)) + "%");
            }
            
            Exhibit.jQuery(elmt).bind("click", onSelect);
        
            Exhibit.jQuery(containerDiv).append(elmt);
            Exhibit.jQuery(containerDiv).append(document.createTextNode(" "));
        };
    
        for (j = 0; j < entries.length; j++) {
            constructValue(entries[j]);
        }
    
        Exhibit.jQuery(containerDiv).show();
    }
};

/**
 * @param {String} value
 * @param {String} label
 * @param {Boolean} selectOnly
 */
Exhibit.CloudFacet.prototype._filter = function(value, label, selectOnly) {
    var self, selected, select, deselect, oldValues, oldSelectMissing, newValues, newSelectMissing, actionLabel, wasSelected, wasOnlyThingSelected, newRestrictions, facetLabel;
    self = this;
    
    oldValues = new Exhibit.Set(this._valueSet);
    oldSelectMissing = this._selectMissing;
    
    if (typeof value === "undefined" || value === null) {
        // the (missing this field) case
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
    
    facetLabel = this.getLabel();
    Exhibit.History.pushComponentState(
        this,
        Exhibit.Facet.getRegistryKey(),
        newRestrictions,
        (selectOnly && !wasOnlyThingSelected) ?
            Exhibit._("%facets.facetSelectOnlyActionTitle", label, facetLabel) :
            Exhibit._(wasSelected ? "%facets.facetUnselectActionTitle" : "%facets.facetSelectActionTitle", label, facetLabel),
        true
    );
};

Exhibit.CloudFacet.prototype._clearSelections = function() {
    Exhibit.History.pushComponentState(
        this,
        Exhibit.Facet.getRegistryKey(),
        this.exportEmptyState(),
        Exhibit._("%facets.facetClearSelectionsActionTitle", this.getLabel()),
        true
    );
};

Exhibit.CloudFacet.prototype._buildMaps = function() {
    var itemToValue, valueToItem, missingItems, valueType, insert, expression, database;

    if (this._itemToValue === null) {
        itemToValue = {};
        valueToItem = {};
        missingItems = {};
        valueType = "text";
        orderMap = this._orderMap;
        
        insert = function(x, y, map) {
            if (typeof map[x] !== "undefined") {
                map[x].push(y);
            } else {
                map[x] = [ y ];
            }
        };
        
        expression = this.getExpression();
        database = this.getUIContext().getDatabase();
        
        this.getUIContext().getCollection().getAllItems().visit(function(item) {
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
 * @param {Boolean} state.selectMissing
 * @param {Array} state.selection
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
 * is always faster than just going through with the import.
 * 
 * @param {Object} state
 * @param {Boolean} state.selectMissing
 * @param {Array} state.selection
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
