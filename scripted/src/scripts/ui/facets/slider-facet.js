/* global Exhibit */
/**
 * @fileOverview Slider facet functions and UI
 * @author SkyeWM
 * @author David Karger
 * @author <a href="mailto:axel@pike.org">Axel Hecht</a>
 */

/**
 * @class
 * @constructor
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.SliderFacet = function(containerElmt, uiContext) {
    Exhibit.jQuery.extend(this, new Exhibit.Facet("cloud", containerElmt, uiContext));
    this.addSettingSpecs(Exhibit.SliderFacet._settingSpecs);

//  this._selection = {min: null, max: null};
    this._range = {min: null, max: null}; //currently selected range
    this._maxRange = {min: null, max: null}; //total range of slider
};

/**
 * @private
 * @constant
 */
Exhibit.SliderFacet._settingSpecs = {
    "precision":        { "type": "float", "defaultValue": 1 },
    "histogram":        { "type": "boolean", "defaultValue": true },
    "horizontal":       { "type": "boolean", "defaultValue": true },
    "showMissing":      { "type": "boolean", "defaultValue": true},
    "inputText":        { type: "boolean", defaultValue: true },
    "selection":        { "type": "float", "dimensions": 2}
};

/**
 * @static
 * @param {Object} configuration
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.SliderFacet}
 */
Exhibit.SliderFacet.create = function(configuration, containerElmt, uiContext) {
    var facet, thisUIContext;
    thisUIContext = Exhibit.UIContext.create(configuration, uiContext);
    facet = new Exhibit.SliderFacet(containerElmt, thisUIContext);

    Exhibit.SliderFacet._configure(facet, configuration);

    facet._initializeUI();
    thisUIContext.getCollection().addFacet(facet);
    facet.register();

    return facet;
};

/**
 * @static
 * @param {Element} configElmt
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.SliderFacet}
 */
Exhibit.SliderFacet.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var configuration, thisUIContext, facet, expressionString, selection, showMissing;
    configuration = Exhibit.getConfigurationFromDOM(configElmt);
    thisUIContext = Exhibit.UIContext.createFromDOM(configElmt, uiContext);
    facet = new Exhibit.SliderFacet(
    (typeof containerElmt !== "undefined" && containerElmt !== null) ?
            containerElmt :
            configElmt,
    thisUIContext
    );
    
    //fills facet with configuration information
    Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt, facet.getSettingSpecs(), facet._settings);

    try {
        expressionString = Exhibit.getAttribute(configElmt, "expression");
        if (typeof expressionString !== "undefined" && expressionString !== null && expressionString.length > 0) {
            facet.setExpression(Exhibit.ExpressionParser.parse(expressionString));
        facet.setExpressionString(expressionString);
        }
        
        showMissing = Exhibit.getAttribute(configElmt, "showMissing");
        
        if (showMissing !== null && showMissing.length > 0) {
            facet._showMissing = (showMissing == "true");
        }
        else {
            facet._showMissing=true;
        }

    if ("selection" in facet._settings) {
        selection = facet._settings.selection;
        facet._range = {min: selection[0], max: selection[1]};
    }

    } catch (e) {
        Exhibit.Debug.exception(e, Exhibit._("%facets.error.configuration", "SliderFacet"));
    }
    
    Exhibit.SliderFacet._configure(facet, configuration);
    facet._initializeUI();
    thisUIContext.getCollection().addFacet(facet);
    facet.register();

    return facet;
};

/**
 * @static
 * @private
 * @param {Exhibit.SliderFacet} facet
 * @param {Object} configuration
 */
Exhibit.SliderFacet._configure = function(facet, configuration) {
    var selection, segment, property;
    Exhibit.SettingsUtilities.collectSettings(configuration, facet.getSettingSpecs(), facet._settings);

    if (typeof configuration.expression !== "undefined") {
        facet.setExpressionString(configuration.expression);
        facet.setExpression(Exhibit.ExpressionParser.parse(configuration.expression));
    }
    if (typeof configuration.selection !== "undefined") {
        selection = configuration.selection;
        facet._range = {min: selection[0], max: selection[1]};
    }
    if (typeof configuration.showMissing !== "undefined") {
        facet._showMissing = configuration.showMissing;   
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

    facet._cache = new Exhibit.FacetUtilities.Cache(
        facet.getUIContext().getDatabase(),
        facet.getUIContext().getCollection(),
        facet.getExpression()
    );
    
    facet._maxRange = facet._getMaxRange();
};

/**
 *
 */
Exhibit.SliderFacet.prototype._dispose = function() {    
    this._cache.dispose();
    this._cache = null;
//  this._selection = null;
    this._range = null; //currently selected range
    this._maxRange = null; //total range of slider
};

/**
 * @returns {Boolean}
 */
Exhibit.SliderFacet.prototype.hasRestrictions = function() {
    return (this._range.min && this._range.min != this._maxRange.min) ||
           (this._range.max && this._range.max != this._maxRange.max);
};

/**
 *
 */
Exhibit.SliderFacet.prototype.clearAllRestrictions = function() {
    Exhibit.jQuery(this.getContainer()).trigger("onBeforeFacetReset.exhibit");
    this._range = this._maxRange;
    this._notifyCollection();
};

/**
 * @param {Exhibit.Set} items
 * @returns {Exhibit.Set}
 */
Exhibit.SliderFacet.prototype.restrict = function(items) {
    if (!this.hasRestrictions()) {
        return items;
    }

    var set = new Exhibit.Set();

    if (this.getExpression().isPath()){
        var path = this.getExpression().getPath();
        var database = this.getUIContext().getDatabase();
        set=path.rangeBackward(this._range.min, this._range.max, false, items, database).values;
    }    
    else {
        this._buildRangeIndex();
        var rangeIndex=this._rangeIndex;
        set=rangeIndex.getSubjectsInRange(this._range.min, this._range.max, false, null, items);
    }
    
    if (this._showMissing){
        this._cache.getItemsMissingValue(items, set);
    }

    return set;
};


/**
 * @param {Exhibit.Set} items
 */
Exhibit.SliderFacet.prototype.update = function(items) {
    if (this._settings.histogram) {
        var data = [];
        var n = 75; //number of bars on histogram
        var range = (this._maxRange.max - this._maxRange.min)/n; //range represented by each bar
        var missingCount = 0;
        var database = this.getUIContext().getDatabase();

        if (this._selectMissing){
            missingCount = this._cache.getItemsMissingValue(items).size();
        }

        if (this.getExpression().isPath()){
            var path = this.getExpression().getPath();

            for (var i=0; i<n; i++) {
                data[i] = path.rangeBackward(this._maxRange.min+i*range, this._maxRange.min+(i+1)*range, (i+1) === n, items,database).values.size()+missingCount;
            }
        }

        else {
            this._buildRangeIndex();
            var rangeIndex=this._rangeIndex;

            for (var i=0; i<n; i++){
                data[i] = rangeIndex.getSubjectsInRange(this._maxRange.min+i*range, this._maxRange.min+(i+1)*range, (i+1) === n, null, items).size()+missingCount;
            }

        }
        this._slider.updateHistogram(data);
    }
    this._slider._setMin(this._range.min);
    this._slider._setMax(this._range.max);
};

/**
 * @private
 */
Exhibit.SliderFacet.prototype._initializeUI = function() {
    Exhibit.jQuery(this.getContainer()).empty();
    Exhibit.jQuery(this.getContainer()).addClass("exhibit-cloudFacet");

    var dom = Exhibit.jQuery.simileDOM(
        "string",
        this.getContainer(),
        ((typeof this._settings.facetLabel !== "undefined") ?
         (   "<div class='exhibit-facet-header'>" +
             "<span class='exhibit-facet-header-title'>" + this.getLabel() + "</span>" +
             "</div>"
         ) :
         ""
        ) +
            '<div class="exhibit-slider" id="slider"></div>'
    );

    this._dom = dom;

    this._slider = new Exhibit.SliderFacet.slider(this._dom.slider, this, this._settings.precision, this._settings.horizontal);
};


/**
 * @private
 * @returns {Object}
 */
//gets maximum range? need to construct a range index for this...
Exhibit.SliderFacet.prototype._getMaxRange = function() {
    var rangeIndex;
    if (this.getExpression().isPath()){
        var path = this.getExpression().getPath();
        var database = this.getUIContext().getDatabase();
        var propertyID = path.getLastSegment().property;
        var property = database.getProperty(propertyID);
        rangeIndex = property.getRangeIndex();
    }
    else {
        this._buildRangeIndex();
        rangeIndex = this._rangeIndex;    
    }

    return {min: rangeIndex.getMin(), max: rangeIndex.getMax()};
};

/**
 * @private
 */
Exhibit.SliderFacet.prototype._buildRangeIndex = function() {
    if (typeof this._rangeIndex === "undefined") {
        var expression = this.getExpression();
        var database = this.getUIContext().getDatabase();
        var getter = function(item, f) {
            expression.evaluateOnItem(item, database).values.visit(function(value) {
                if (typeof value != "number") {
                    value = parseFloat(value);
                }
                if (!isNaN(value)) {
                    f(value);
                }
            });
        };
    
        this._rangeIndex = new Exhibit.Database.RangeIndex(
            this.getUIContext().getCollection().getAllItems(),
            getter
        );    
    }
};


/**
 * Used by the actual slider to set the facet values
 */
Exhibit.SliderFacet.prototype.changeRange = function(range) {
    Exhibit.History.pushComponentState(
        this,
        Exhibit.Facet.getRegistryKey(),
        range,
        Exhibit._("%facets.numeric.rangeShort", range.min, range.max),
        true
    );
};

//clear
Exhibit.SliderFacet.prototype._notifyCollection = function() {
    this.getUIContext().getCollection().onFacetUpdated(this);
};

/**
 * @returns {Object}
 */
Exhibit.SliderFacet.prototype.exportEmptyState = function() {
    return {};
};

/**
 * @returns {Object}
 */
Exhibit.SliderFacet.prototype.exportState = function() {
    return this._range;
};

/**
 * @param {Object} state
 */
Exhibit.SliderFacet.prototype.importState = function(state) {
    if (this.stateDiffers(state)) {
        if (typeof state.min === 'undefined' || state.min === null) {
            this._range.min = this._maxRange.min;
        }
        else {
            this._range.min = state.min;
        }
        this._slider._setMin(this._range.min);
        if (typeof state.max === 'undefined' || state.max === null) {
            this._range.max = this._maxRange.max;
        }
        else {
            this._range.max = state.max;
        }
        this._slider._setMax(this._range.max);
    }
    this._notifyCollection();
};

/**
 * @param {Object} state
 */
Exhibit.SliderFacet.prototype.stateDiffers = function(state) {
    if (typeof state.min === 'undefined') {
        if (this._range.min && this._range.min != this._maxRange.min) {
            return true;
        }
    }
    else {
        if (this._range.min !== state.min) {
            return true;
        }
    }
    if (typeof state.max === 'undefined') {
        if (this._range.max && this._range.max != this._maxRange.max) {
            return true;
        }
    }
    else {
        if (this._range.max !== state.min) {
            return true;
        }
    }
    return false;
};
