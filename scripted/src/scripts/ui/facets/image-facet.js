/*==================================================
 *  Exhibit.ImageFacet
 *==================================================
 */

Exhibit.ImageFacet = function(containerElmt, uiContext) {
    Exhibit.EnumeratedFacet.call(this,"image",containerElmt,uiContext);
    this.addSettingSpecs(Exhibit.ImageFacet._settingSpecs);
    this._div = containerElmt;
    this._colorCoder = null;
    
    this._expression = null;
    this._valueSet = new Exhibit.Set();
    this._selectMissing = false;
    
    this._settings = {};
    this._dom = null;
};
Exhibit.ImageFacet.prototype = new Exhibit.EnumeratedFacet();

Exhibit.ImageFacet._settingSpecs = {
    "image":            { type: "text" },
    "tooltip":          { type: "text" },
    "thumbNail":        { type: "uri" },
    "overlayCounts":    { type: "boolean", defaultValue: true },
    "scroll":           { type: "boolean", defaultValue: true },
    "height":           { type: "text" },
    "colorCoder":       { type: "text", defaultValue: null },
    "collapsible":      { type: "boolean", defaultValue: false },
    "collapsed":        { type: "boolean", defaultValue: false }
};


/**
 * @static
 * @param {Element} configElmt
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @param {Object} settingsFromDOM
 * @returns {Exhibit.ListFacet}
 */
Exhibit.ImageFacet.createFromDOM = function(configElmt, containerElmt, 
                                           uiContext) {
    return Exhibit.EnumeratedFacet.createFromDOM(Exhibit.ImageFacet, configElmt, containerElmt, uiContext);
};

/**
 * @static
 * @param {Object} configObj
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.ListFacet}
 */
Exhibit.ImageFacet.create = function(configObj, containerElmt, uiContext) {
    var settingsFromDOM, facet;

    return Exhibit.EnumeratedFacet.createFromObj(Exhibit.ImageFacet, configObj, containerElmt, uiContext);
};


Exhibit.ImageFacet.prototype._configure = function(configuration) {
    var i, segment, property, selection, values, orderMap;
    Exhibit.SettingsUtilities.collectSettings(configuration, Exhibit.ImageFacet._settingSpecs, this._settings);
    
    if ("expression" in configuration) {
        this._expression = Exhibit.ExpressionParser.parse(configuration.expression);
    }
    if ("image" in configuration) {
        this._imageExpression = Exhibit.ExpressionParser.parse(configuration.image);
    }
    if ("tooltip" in configuration) {
        this._tooltipExpression = Exhibit.ExpressionParser.parse(configuration.tooltip);
    }

	if (!(this._imageExpression)) {
        this._imageExpression = Exhibit.ExpressionParser.parse("value");
	}
	if (!(this._tooltipExpression)) {
        this._tooltipExpression = Exhibit.ExpressionParser.parse("value");
	}
	
    if ("selection" in configuration) {
        selection = configuration.selection;
        for (i = 0; i < selection.length; i++) {
            this._valueSet.add(selection[i]);
        }
    }
    if ("selectMissing" in configuration) {
        this._selectMissing = configuration.selectMissing;
    }
    
    if (!("facetLabel" in this._settings)) {
        this._settings.facetLabel = "missing ex:facetLabel";
        if (this._expression != null && this._expression.isPath()) {
            segment = this._expression.getPath().getLastSegment();
            property = this.getUIContext().getDatabase().getProperty(segment.property);
            if (property != null) {
                this._settings.facetLabel = segment.forward ? property.getLabel() : property.getReverseLabel();
            }
        }
    }
    if ("fixedOrder" in this._settings) {
        values = this._settings.fixedOrder.split(";");
        orderMap = {};
        for (i = 0; i < values.length; i++) {
            orderMap[values[i].trim()] = i;
        }
        
        this._orderMap = orderMap;
    }
    
    if ("colorCoder" in this._settings) {
        this._colorCoder = this.getUIContext().getMain().getComponent(this._settings.colorCoder);
    }
    
    if (this._settings.collapsed) {
        this._settings.collapsible = true;
    }
    
    this._cache = new Exhibit.FacetUtilities.Cache(
        this.getUIContext().getDatabase(),
        this.getUIContext().getCollection(),
        this._expression
    );
}

Exhibit.ImageFacet.prototype.dispose = function() {
    this._cache.dispose();
    this._cache = null;
    
    this.getUIContext().getCollection().removeFacet(this);
    this.getUIContext() = null;
    this._colorCoder = null;
    
    this._div.innerHTML = "";
    this._div = null;
    this._dom = null;
    
    this._expression = null;
    this._valueSet = null;
    this._settings = null;
    Exhibit.EnumeratedFacet.dispose.call(this);
};


Exhibit.ImageFacet.prototype.update = function(items) {
    this._dom.valuesContainer.hide();
    this._dom.valuesContainer.innerHTML = "";
    this._constructBody(this._computeFacet(items));
    this._dom.valuesContainer.show();
};

Exhibit.ImageFacet.prototype._computeFacet = function(items) {
    var database, r, entries, valueType, selection, labeler, i, entry, count, span;
    database = this.getUIContext().getDatabase();
    r = this._cache.getValueCountsFromItems(items);
    entries = r.entries;

    valueType = r.valueType;
    
    if (entries.length > 0) {
        selection = this._valueSet;
        labeler = valueType == "item" ?
            function(v) { var l = database.getObject(v, "label"); 
                          return l != null ? l : v; } :
            function(v) { return v; }
        
        for (i = 0; i < entries.length; i++) {
            entry = entries[i];
            entry.actionLabel = entry.selectionLabel = labeler(entry.value);
	    entry.image = this._imageExpression.evaluateSingleOnItem(entry.value, database).value;
	    entry.tooltip = this._tooltipExpression.evaluateSingleOnItem(entry.value, database).value;
            entry.selected = selection.contains(entry.value);
        }
        
        entries.sort(this._createSortFunction(valueType));
    }
    /* should display something to account for items that don't have this field

       if (this._settings.showMissing || this._selectMissing) {
       var count = this._cache.countItemsMissingValue(items);
        if (count > 0 || this._selectMissing) {
            var span = document.createElement("span");
            span.innerHTML = ("missingLabel" in this._settings) ? 
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
    */
    return entries;
}

Exhibit.ImageFacet.prototype._initializeUI = function() {
    var self = this;
    this._dom = Exhibit.FacetUtilities[this._settings.scroll ? "constructFacetFrame" : "constructFlowingFacetFrame"](
		this,
        this._div,
        this._settings.facetLabel,
        function(elmt, evt, target) { self._clearSelections(); },
        this.getUIContext(),
        this._settings.collapsible,
        this._settings.collapsed
    );
    
    if ("height" in this._settings && this._settings.scroll) {
        this._dom.valuesContainer.style.height = this._settings.height;
    }
};

Exhibit.ImageFacet.prototype._constructBody = function(entries) {
    var wrapper, self = this;
    var shouldOverlayCounts = this._settings.overlayCounts;
    var containerDiv = this._dom.valuesContainer;
    
    containerDiv.hide().empty();
    var facetHasSelection = this._valueSet.size() > 0 || this._selectMissing;
    var constructValue = function(entry) {
        var onSelectOnly = function(evt) {
            self._filter(entry.value, entry.actionLabel, !(evt.ctrlKey || evt.metaKey));
            evt.preventDefault();
            evt.stopPropagation();
        };
        wrapper = Exhibit.jQuery("<img>")
            .attr("src",entry.image)
            .wrap("<div>").parent()
            .addClass("wrapper");

	if(shouldOverlayCounts == true) {
	    var countDiv = document.createElement("div");
	    countDiv.className = "countDiv";
	    var countBackground = document.createElement("div");
	    countBackground.className = "countBackground";
	    countDiv.appendChild(countBackground);
	    var innerCount = document.createElement("div");
	    innerCount.className = "text";
	    innerCount.innerHTML = entry.count;
	    countDiv.appendChild(innerCount);
	    wrapper.append(countDiv);
	}
	
	Exhibit.jQuery("<span>")
            .append(wrapper)
            .addClass("inline-block exhibit-imageFacet-value" +
                     (entry.selected ? " exhibit-imageFacet-value-selected" 
                      : "" ))
            .prop("title", entry.count + " " + entry.tooltip)
            .click(onSelectOnly)
            .appendTo(containerDiv);
    };
    
    for (var j = 0; j < entries.length; j++) {
        constructValue(entries[j]);
    }
    containerDiv.show();
    
    this._dom.setSelectionCount(this._valueSet.size() + (this._selectMissing ? 1 : 0));
};

