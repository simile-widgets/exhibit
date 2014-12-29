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
    Exhibit.EnumeratedFacet.call(this,"list",containerElmt,uiContext);
    this.addSettingSpecs(Exhibit.ListFacet._settingSpecs);

    this._colorCoder = null;
    this._delayedUpdateItems = null;
    this._dom = null;
};

Exhibit.ListFacet.prototype = new Exhibit.EnumeratedFacet();

/**
 * @constant
 */
Exhibit.ListFacet._settingSpecs = {
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
Exhibit.ListFacet.createFromDOM = function(configElmt, containerElmt, 
                                           uiContext) {
    return Exhibit.EnumeratedFacet.createFromDOM(Exhibit.ListFacet, configElmt, containerElmt, uiContext);
};

/**
 * @static
 * @param {Object} configObj
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.ListFacet}
 */
Exhibit.ListFacet.create = function(configObj, containerElmt, uiContext) {
    var settingsFromDOM, facet;

    return Exhibit.EnumeratedFacet.createFromObj(Exhibit.ListFacet, configObj, containerElmt, uiContext);
};

/**
 * @static
 * @private
 * @param {Exhibit.ListFacet} facet
 * @param {Object} configuration
 */
Exhibit.ListFacet.prototype._configure = function(settings) {
    var selection, i, segment, property, values, orderMap, formatter;

    Exhibit.EnumeratedFacet.prototype._configure.call(this, settings);
    
    if (typeof settings.facetLabel === "undefined") {
        if (this.getExpression() !== null && this.getExpression().isPath()) {
            segment = this.getExpression().getPath().getLastSegment();
            property = this.getUIContext().getDatabase().getProperty(segment.property);
            if (typeof property !== "undefined" && property !== null) {
                settings.facetLabel = segment.forward ? property.getLabel() : property.getReverseLabel();
            }
        }
    }
    if (typeof settings.fixedOrder !== "undefined") {
        values = settings.fixedOrder.split(";");
        orderMap = {};
        for (i = 0; i < values.length; i++) {
            orderMap[values[i].trim()] = i;
        }
        
        this._orderMap = orderMap;
    }
    
    if (settings.colorCoder !== "undefined") {
        this._colorCoder = this.getUIContext().getMain().getComponent(settings.colorCoder);
    }
    
    if (settings.collapsed) {
        settings.collapsible = true;
    }
    
    if (typeof settings.formatter !== "undefined") {
        formatter = settings.formatter;
        if (formatter !== null && formatter.length > 0) {
            try {
                this._formatter = eval(formatter);
            } catch (e) {
                Exhibit.Debug.log(e);
            }
        }
    }
};

/**
 *
 */
Exhibit.ListFacet.prototype.dispose = function() {
    this._colorCoder = null;
    Exhibit.EnumeratedFacet.prototype.dispose.call(this);
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
