/**
 * @fileOverview Cloud facet functions and UI
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 * @author <a href="mailto:axel@pike.org">Axel Hecht</a>
 */

// Static method stuff
/*
Exhibit.CloudFacet.create = function(containerElmt, uiContext, jsonParams) {
}

Exhibit.CloudFacet.createFromDOM = function(containerElmt, uiContext) {
  var settings = //do something to get settings from dom
  return Exhibit.CloudFacet.create(.., settings);
}

// Constructor

Exhibit.EnumeratedFacet = function(conteinterEl, uiCon) {
  A
}


Exhibit.CloudFacet = function(conteinterEl, uiCon) {
  Exhibit.EnumeratedFacet.call(this, containerEl, uiCon);
  C

}


Exhibit.ListFacet = function(conteinterEl, uiCon) {
  A
  B

}

function buildSettingsFromDOM = function(spec, elem) {
    ret = {}
    for key in spec:
      if key.defaultValue:
        ret[key] = key.defaultValue
      if elem.hasAttr(key):
        str = elem.attr(key)
         if key.hasType and int:
            str = parseInt(str)



    return ret
}

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

Exhibit.CloudFacet.prototype =  new Exhibit.EnumeratedFacet();

/**
 * @constant
 */
Exhibit.CloudFacet._settingSpecs = {
    "minimumCount":     { "type": "int", "defaultValue": 1 },
    "showMissing":      { "type": "boolean", "defaultValue": true },
    "missingLabel":     { "type": "text" }
};

/**
 * @param {Element} configElmt
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @param {Object} settingsFromDOM
 * @returns {Exhibit.CloudFacet}
 */
Exhibit.CloudFacet.create = function(configElmt, containerElmt, uiContext, settingsFromDOM) {
    var facet, thisUIContext, configuration;

    configuration = Exhibit.getConfigurationFromDOM(configElmt);
    thisUIContext = Exhibit.UIContext.createFromDOM(configElmt, uiContext); 
    facet = new Exhibit.CloudFacet(
        (typeof containerElmt !== "undefined" && containerElmt !== null) ?
            containerElmt :
            configElmt, 
        thisUIContext
    );

    Exhibit.CloudFacet.includeSettingsFromDOM(facet, settingsFromDOM);
    Exhibit.CloudFacet._configure(facet, configuration);
    facet._initializeUI();
    thisUIContext.getCollection().addFacet(facet);
    facet.register();

    return facet;
};

/**
 * @param {Exhibit.CloudFacet} facet
 * @param {Object} settingsFromDOM 
 */
Exhibit.CloudFacet.includeSettingsFromDOM = function(configElmt, facet, settingsFromDOM){
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
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.CloudFacet}
 */
Exhibit.CloudFacet.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var settingsFromDOM = Exhibit.CloudFacet.buildSettingsFromDOM(configElmt);
    var facet = Exhibit.CloudFacet.create(configElmt, containerElmt, uiContext, settingsFromDOM);
    return facet;
};

/**
 * @param {Element} configElmt
 * @returns {Object} settingsFromDOM
 */
Exhibit.CloudFacet.buildSettingsFromDOM = function(configElmt) {
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
         Exhibit.Debug.exception(e, Exhibit._("%facets.error.configuration", "CloudFacet"));
    }

    return settingsFromDOM;
}


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
    var database, entries, valueType, self, path, facetValueResult, itemSubcollection, value, itemA, count, i, item
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

        entries.sort(this._createSortFunction(valueType));
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
