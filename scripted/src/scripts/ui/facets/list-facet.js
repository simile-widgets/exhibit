/**
 * @fileOverview List facet functions and UI
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @constructor
 * @class
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.ListFacet = function(containerElmt, uiContext) {
    Exhibit.jQuery.extend(this, new Exhibit.Facet("list", containerElmt, uiContext));
    this.addSettingSpecs(Exhibit.ListFacet._settingSpecs);

    this._colorCoder = null;
    this._valueSet = new Exhibit.Set();
    this._selectMissing = false;
	this._delayedUpdateItems = null;
    this._dom = null;
    this._orderMap = null;
};

Exhibit.ListFacet.prototype = new Exhibit.EnumeratedFacet();

/**
 * @constant
 */
Exhibit.ListFacet._settingSpecs = {
    "fixedOrder":       { "type": "text" },
    "sortMode":         { "type": "text", "defaultValue": "value" },
    "sortDirection":    { "type": "text", "defaultValue": "forward" },
    "showMissing":      { "type": "boolean", "defaultValue": true },
    "missingLabel":     { "type": "text" },
    "scroll":           { "type": "boolean", "defaultValue": true },
    "height":           { "type": "text" },
    "colorCoder":       { "type": "text", "defaultValue": null },
    "collapsible":      { "type": "boolean", "defaultValue": false },
    "collapsed":        { "type": "boolean", "defaultValue": false },
    "formatter":        { "type": "text", "defaultValue": null}
};

/**
 * @static
 * @param {Element} configElmt
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @param {Object} settingsFromDOM
 * @returns {Exhibit.ListFacet}
 */
Exhibit.ListFacet.create = function(configElmt, containerElmt, uiContext, settingsFromDOM) {
 var thisUIContext, facet;

    thisUIContext = Exhibit.UIContext.createFromDOM(configElmt, uiContext);
    facet = new Exhibit.ListFacet(
        (typeof containerElmt !== "undefined" && containerElmt !== null) ?
            containerElmt : configElmt, 
        thisUIContext
    );

    Exhibit.EnumeratedFacet.create(configElmt, facet, settingsFromDOM, thisUIContext);
    return facet;
};

/**
 * @static
 * @param {Element} configElmt
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.ListFacet}
 */
Exhibit.ListFacet.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var settingsFromDOM, facet;

    settingsFromDOM = Exhibit.EnumeratedFacet.buildSettingsFromDOM(configElmt);
    facet = Exhibit.ListFacet.create(configElmt, containerElmt, uiContext, settingsFromDOM);

    return facet;
};

/**
 * @static
 * @private
 * @param {Exhibit.ListFacet} facet
 * @param {Object} configuration
 */
Exhibit.ListFacet._configure = function(facet, configuration) {
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
    
    if (typeof facet._settings.facetLabel === "undefined") {
        if (facet.getExpression() !== null && facet.getExpression().isPath()) {
            segment = facet.getExpression().getPath().getLastSegment();
            property = facet.getUIContext().getDatabase().getProperty(segment.property);
            if (typeof property !== "undefined" && property !== null) {
                facet._settings.facetLabel = segment.forward ? property.getLabel() : property.getReverseLabel();
            }
        }
    }
    if (typeof facet._settings.fixedOrder !== "undefined") {
        values = facet._settings.fixedOrder.split(";");
        orderMap = {};
        for (i = 0; i < values.length; i++) {
            orderMap[values[i].trim()] = i;
        }
        
        facet._orderMap = orderMap;
    }
    
    if (facet._settings.colorCoder !== "undefined") {
        facet._colorCoder = facet.getUIContext().getMain().getComponent(facet._settings.colorCoder);
    }
    
    if (facet._settings.collapsed) {
        facet._settings.collapsible = true;
    }
    
    if (typeof facet._settings.formatter !== "undefined") {
        formatter = facet._settings.formatter;
        if (formatter !== null && formatter.length > 0) {
            try {
                facet._formatter = eval(formatter);
            } catch (e) {
                Exhibit.Debug.log(e);
            }
        }
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
Exhibit.ListFacet.prototype._dispose = function() {
    this._cache.dispose();
    this._cache = null;
    this._colorCoder = null;
    this._dom = null;
    this._valueSet = null;
    this._orderMap = null;
};


/**
 * @param {Exhibit.Set} items
 * @returns {Exhibit.Set}
 */
Exhibit.ListFacet.prototype.restrict = function(items) {
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
 *
 */
Exhibit.ListFacet.prototype.onUncollapse = function() {
	if (this._delayedUpdateItems !== null) {
		this.update(this._delayedUpdateItems);
		this._delayedUpdateItems = null;
	}
};

/**
 * @param {Exhibit.Set} items
 */
Exhibit.ListFacet.prototype.update = function(items) {
	if (Exhibit.FacetUtilities.isCollapsed(this)) {
		this._delayedUpdateItems = items;
		return;
	}
    Exhibit.jQuery(this._dom.valuesContainer)
        .hide()
        .empty();
    this._constructBody(this._computeFacet(items));
    Exhibit.jQuery(this._dom.valuesContainer).show();
};

/**
 * @param {Exhibit.Set} items
 * @returns {Array}
 */
Exhibit.ListFacet.prototype._computeFacet = function(items) {
    var database, r, entries, valueType, selection, labeler, i, entry, count, span;
    database = this.getUIContext().getDatabase();
    r = this._cache.getValueCountsFromItems(items);
    entries = r.entries;
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
 *
 */
Exhibit.ListFacet.prototype._initializeUI = function() {
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

    if (typeof this._settings.height !== "undefined" && this._settings.scroll) {
        Exhibit.jQuery(this._dom.valuesContainer).css("height", this._settings.height);
    }
};

/**
 * @param {Array} entries
 */
Exhibit.ListFacet.prototype._constructBody = function(entries) {
    var self, containerDiv, constructFacetItemFunction, facetHasSelection, constructValue, j;
    self = this;
    containerDiv = this._dom.valuesContainer;
    
    Exhibit.jQuery(containerDiv).hide();
    
    constructFacetItemFunction = Exhibit.FacetUtilities[this._settings.scroll ? "constructFacetItem" : "constructFlowingFacetItem"];
    facetHasSelection = this._valueSet.size() > 0 || this._selectMissing;
    constructValue = function(entry) {
        var onSelect, onSelectOnly, elmt;
        onSelect = function(evt) {
            self._filter(entry.value, entry.actionLabel, false);
            evt.preventDefault();
            evt.stopPropagation();
        };
        onSelectOnly = function(evt) {
            self._filter(entry.value, entry.actionLabel, !(evt.ctrlKey || evt.metaKey));
            evt.preventDefault();
            evt.stopPropagation();
        };
        elmt = constructFacetItemFunction(
            entry.selectionLabel, 
            entry.count, 
            (typeof self._colorCoder !== "undefined" && self._colorCoder !== null) ? self._colorCoder.translate(entry.value) : null,
            entry.selected, 
            facetHasSelection,
            onSelect,
            onSelectOnly,
            self.getUIContext()
        );
        
        if (self._formatter) {
            self._formatter(elmt);
        }
        
        Exhibit.jQuery(containerDiv).append(elmt);
    };
    
    for (j = 0; j < entries.length; j++) {
        constructValue(entries[j]);
    }

    Exhibit.jQuery(containerDiv).show();
    
    this._dom.setSelectionCount(this._valueSet.size() + (this._selectMissing ? 1 : 0));
};
