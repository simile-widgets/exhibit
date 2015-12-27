/*==================================================
 *  Exhibit.ImageFacet
 * @fileOverview List facet functions and UI
 * @author David Huynh
 * @author <a href="mailto:karger@mit.edu">David Karger</a>
 *==================================================
 */

/**
 * @constructor
 * @class
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.ImageFacet = function(containerElmt, uiContext) {
    Exhibit.EnumeratedFacet.call(this,"image",containerElmt,uiContext);
    this.addSettingSpecs(Exhibit.ImageFacet._settingSpecs);
    this._colorCoder = null;
    
    this._settings = {};
    this._dom = null;
};
Exhibit.ImageFacet.prototype = new Exhibit.EnumeratedFacet();

/**
 * @constant
 */
Exhibit.ImageFacet._settingSpecs = {
    "scroll":           { type: "boolean", defaultValue: true },
    "image":            { type: "text" },
    "height":           { type: "text" },
    "colorCoder":       { type: "text", defaultValue: null },
    "collapsible":      { type: "boolean", defaultValue: false },
    "collapsed":        { type: "boolean", defaultValue: false },
    "tooltip":          { type: "text" },
    "thumbNail":        { type: "uri" },
    "overlayCounts":    { type: "boolean", defaultValue: true }
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

/**
 * @static
 * @private
 * @param {Exhibit.ImageFacet} facet
 * @param {Object} configuration
 */
Exhibit.ImageFacet.prototype._configure = function(settings) {
    var i, segment, property, selection, values;
    
    Exhibit.EnumeratedFacet.prototype._configure.call(this, settings);

    if ("image" in settings) {
        this._imageExpression = Exhibit.ExpressionParser.parse(settings.image);
    }
    if ("tooltip" in settings) {
        this._tooltipExpression = Exhibit.ExpressionParser.parse(settings.tooltip);
    }

    if (!(this._imageExpression)) {
        this._imageExpression = Exhibit.ExpressionParser.parse("value");
	}
    if (!(this._tooltipExpression)) {
        this._tooltipExpression = Exhibit.ExpressionParser.parse("value");
	}

    if ("colorCoder" in settings) {
        this._colorCoder = this.getUIContext().getMain().getComponent(settings.colorCoder);
    }
    
    if (settings.collapsed) {
        settings.collapsible = true;
    }
};

Exhibit.ImageFacet.prototype.dispose = function() {
    this._colorCoder = null;
    Exhibit.EnumeratedFacet.dispose.call(this);
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
Exhibit.ImageFacet.prototype.update = function(items) {
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
 * Have to override computeFacet to insert images for each item
 * todo: refactor to let any enumerated facet specify a function
 * to generate the "representation" for each item in the facet
 * some day, maybe even using a lens
 */
Exhibit.ImageFacet.prototype._computeFacet = function(items) {
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
};

Exhibit.ImageFacet.prototype._initializeUI = function() {
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
    
    if ("height" in this._settings && this._settings.scroll) {
        this._dom.valuesContainer.style.height = this._settings.height;
    }
};

/**
 * @param {Array} entries
 */
Exhibit.ImageFacet.prototype._constructBody = function(entries) {
    var wrapper, self = this, facetHasSelection, constructValue;
    var shouldOverlayCounts = this._settings.overlayCounts;
    var containerDiv = this._dom.valuesContainer, j;
    
    containerDiv.hide().empty();
    facetHasSelection = this._valueSet.size() > 0 || this._selectMissing;
    constructValue = function(entry) {
        var onSelectOnly = function(evt) {
            self._filter(entry.value, entry.actionLabel, !(evt.ctrlKey || evt.metaKey));
            evt.preventDefault();
            evt.stopPropagation();
        };
        wrapper = Exhibit.jQuery("<img>")
            .attr("src",entry.image)
            .wrap("<div>").parent()
            .addClass("wrapper");

	if(shouldOverlayCounts === true) {
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
    
    for (j = 0; j < entries.length; j++) {
        constructValue(entries[j]);
    }
    containerDiv.show();
    
    this._dom.setSelectionCount(this._valueSet.size() + (this._selectMissing ? 1 : 0));
};

