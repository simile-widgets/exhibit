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

Exhibit.CloudFacet.prototype = new Exhibit.EnumeratedFacet();

/**
 * @constant
 */
Exhibit.CloudFacet._settingSpecs = {
    "minimumCount":     { "type": "int", "defaultValue": 1 },
    "showMissing":      { "type": "boolean", "defaultValue": true },
    "missingLabel":     { "type": "text" },
    "maxFontSize":      { "type": "text" },
    "minFontSize":      { "type": "text" } 
};

/**
 * @param {Element} configElmt
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @param {Object} settingsFromDOM
 * @returns {Exhibit.CloudFacet}
 */
Exhibit.CloudFacet.create = function(configElmt, containerElmt, uiContext, settingsFromDOM) {
    var facet, thisUIContext;

    thisUIContext = Exhibit.UIContext.createFromDOM(configElmt, uiContext); 
    facet = new Exhibit.CloudFacet(
        (typeof containerElmt !== "undefined" && containerElmt !== null) ?
            containerElmt :
            configElmt, 
        thisUIContext
    );

    Exhibit.EnumeratedFacet.create(configElmt, facet, settingsFromDOM, thisUIContext);
    return facet;
};

/**
 * @param {Element} configElmt
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.CloudFacet}
 */
Exhibit.CloudFacet.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var settingsFromDOM, facet;

    settingsFromDOM = Exhibit.EnumeratedFacet.buildSettingsFromDOM(configElmt);
    facet = Exhibit.CloudFacet.create(configElmt, containerElmt, uiContext, settingsFromDOM);
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

    facet._cache = new Exhibit.FacetUtilities.Cache(
        facet.getUIContext().getDatabase(),
        facet.getUIContext().getCollection(),
        facet.getExpression()
    );

};

/**
 *
 */
Exhibit.CloudFacet.prototype._dispose = function() {
    this._cache.dispose();
    this._cache = null;
    this._dom = null;
    this._valueSet = null;
    this._valueType = null;
    this._orderMap = null;
};

/**
 * @param {Exhibit.Set} items
 * @returns {Exhibit.Set}
 */
Exhibit.CloudFacet.prototype.restrict = function(items) {
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
    var database, entries, valueType, self, path, facetValueResult, r, itemSubcollection, value, itemA, count, i, item, sortValueFunction, orderMap, sortFunction, sortDirectionFunction;
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
        count = this._cache.countItemsMissingValue(items);
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
                var fontsize = Math.ceil(100 + 100 * Math.log(1 + 1.5 * (entry.count - min) / range));
                var minFontSize = null;
                var maxFontSize = null;
                if (typeof this._settings.maxFontSize != "undefined" && typeof this._settings.minFontSize != "undefined") {
                    minFontSize = parseInt(this._settings.minFontSize);
                    maxFontSize = parseInt(this._settings.maxFontSize);
                    fontsize = Math.ceil(minFontSize + 100 * Math.log(1 + 1.5 * (entry.count - min) / range));
                    fontsize = Math.min(maxFontSize, fontsize);
                } else if (typeof this._settings.maxFontSize != "undefined") {
                    maxFontSize = parseInt(this._settings.maxFontSize);
                    if (maxFontSize <= 100) {
                        fontSize = Math.ceil(100 * Math.log(1 + 1.5 * (entry.count - min) / range));
                    }
                    fontSize = Math.min(maxFontSize, fontSize);
                } else if (typeof this._settings.minFontSize != "undefined") {
                    minFontSize = parseInt(this.settings.minFontSize);
                    if (minFontSize > 100) {
                        fontsize = Math.ceil(minFontSize + 100 * Math.log(1 + 1.5 * (entry.count - min) / range));
                    }
                } 

                Exhibit.jQuery(elmt).css("fontSize",  fontsize + "%");           
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
