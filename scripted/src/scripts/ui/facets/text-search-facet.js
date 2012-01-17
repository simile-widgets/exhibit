/**
 * @fileOverview Text search facet functions and UI
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @constructor
 * @class
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.TextSearchFacet = function(containerElmt, uiContext) {
    this._div = containerElmt;
    this._uiContext = uiContext;
    
    this._expressions = [];
    this._expressionsStrings = [];
    this._text = null;
    
    this._settings = {};
    this._dom = null;
    this._timerID = null;
    
    this._registered = false;

    var self = this;
    this._onRootItemsChanged = function(evt) {
        if (typeof self._itemToValue !== "undefined") {
            delete self._itemToValue;
        }
    };
    $(uiContext.getCollection().getElement()).bind(
        "onRootItemsChanged.exhibit",
        this._onRootItemsChanged
    );
};

/**
 * @private
 * @constant
 */ 
Exhibit.TextSearchFacet._settingSpecs = {
    "facetLabel":       { "type": "text" },
    "queryParamName":   { "type": "text" },
    "requiresEnter":    { "type": "boolean", "defaultValue": false}
};

/**
 * @param {Object} configuration
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.TextSearchFacet}
 */
Exhibit.TextSearchFacet.create = function(configuration, containerElmt, uiContext) {
    var uiContext = Exhibit.UIContext.create(configuration, uiContext);
    var facet = new Exhibit.TextSearchFacet(containerElmt, uiContext);
    
    Exhibit.TextSearchFacet._configure(facet, configuration);
    
    facet._initializeUI();
    uiContext.getCollection().addFacet(facet);
    
    return facet;
};

/**
 * @param {Element} configElmt
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.TextSearchFacet}
 */
Exhibit.TextSearchFacet.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var configuration = Exhibit.getConfigurationFromDOM(configElmt);
    var uiContext = Exhibit.UIContext.createFromDOM(configElmt, uiContext);
    var facet = new Exhibit.TextSearchFacet(
        (typeof containerElmt !== "undefined" && containerElmt !== null) ? containerElmt : configElmt, 
        uiContext
    );
    
    Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt, Exhibit.TextSearchFacet._settingSpecs, facet._settings);
    
    try {
        var s = Exhibit.getAttribute(configElmt, "expressions");
        if (typeof s !== "undefined" && s !== null && s.length > 0) {
            facet._expressionsStrings.push(s);
            facet._expressions = Exhibit.ExpressionParser.parseSeveral(s);
        }
        
        var query = Exhibit.getAttribute(configElmt, "query");
        if (typeof query !== "undefined" && query !== null && query.length > 0) {
            facet._text = query;
        }
    } catch (e) {
        Exhibit.Debug.exception(e, "TextSearchFacet: Enor processing configuration of list facet");
    }
    Exhibit.TextSearchFacet._configure(facet, configuration);
    
    facet._initializeUI();
    uiContext.getCollection().addFacet(facet);
    
    return facet;
};

/**
 * @param {Exhibit.TextSearchFacet} facet
 * @param {Object} configuration
 */
Exhibit.TextSearchFacet._configure = function(facet, configuration) {
    Exhibit.SettingsUtilities.collectSettings(configuration, Exhibit.TextSearchFacet._settingSpecs, facet._settings);
    
    if (typeof configuration.expressions !== "undefined") {
        for (var i = 0; i < configuration.expressions.length; i++) {
            facet._expressionsStrings.push(configuration.expressions[i]);
            facet._expressions.push(Exhibit.ExpressionParser.parse(configuration.expressions[i]));
        }
    }
    if (typeof configuration.selection !== "undefined") {
        var selection = configuration.selection;
        for (var i = 0; i < selection.length; i++) {
            facet._valueSet.add(selection[i]);
        }
    }
    if (typeof configuration.query !== "undefined") {
        facet._text = configuration.query;
    }
    if (typeof facet._settings.queryParamName !== "undefined") {
        var params = Exhibit.parseURLParameters();
        if (typeof params[facet._settings.queryParamName] !== "undefined") {
            facet._text = params[facet._settings.queryParamName];
        }
    }
    
    if (typeof facet._settings.facetLabel === "undefined") {
        facet._settings.facetLabel = "";
    }

    facet._setIdentifier();
    facet.register();
};

/**
 *
 */
Exhibit.TextSearchFacet.prototype._setIdentifier = function() {
    this._id = $(this._div).attr("id");

    if (typeof this._id === "undefined") {
        this._id = Exhibit.Facet._registryKey
            + "-textSearch-"
            + this._expressionsStrings.join(",").replace(/ /g, "")
            + "-"
            + this._uiContext.getCollection().getID()
            + "-"
            + this._uiContext.getMain().getRegistry().generateIdentifier(
                Exhibit.Facet._registryKey
            );
    }
};

/**
 * @returns {String}
 */
Exhibit.TextSearchFacet.prototype.getID = function() {
    return this._id;
};

/**
 *
 */
Exhibit.TextSearchFacet.prototype.register = function() {
    if (this._uiContext.getMain().getRegistry().hasRegistry(
        Exhibit.Facet._registryKey
    )) {
        this._uiContext.getMain().getRegistry().register(
            Exhibit.Facet._registryKey,
            this.getID(),
            this
        );
        this._registered = true;
    }   
};

/**
 *
 */
Exhibit.TextSearchFacet.prototype.unregister = function() {
    this._uiContext.getMain().getRegistry().unregister(
        Exhibit.Facet._registryKey,
        this.getID()
    );
    this._registered = false;
};

/**
 *
 */
Exhibit.TextSearchFacet.prototype.dispose = function() {
    this._uiContext.getCollection().removeFacet(this);
    
    $(this._uiContext.getCollection().getElement()).unbind(
        "onRootItemsChanged.exhibit",
        this._onRootItemsChanged
    );
    this.unregister();
    this._uiContext = null;
    
    $(this._div).empty();
    this._div = null;
    this._dom = null;
    
    this._expressions = null;
    this._expressionsStrings = null;
    this._itemToValue = null;
    this._settings = null;
};

/**
 * @returns {Boolean}
 */
Exhibit.TextSearchFacet.prototype.hasRestrictions = function() {
    return this._text !== null;
};

/**
 *
 */
Exhibit.TextSearchFacet.prototype.clearAllRestrictions = function() {
    var restrictions = this._text;
    if (this._text !== null) {
        this._text = null;
        this._notifyCollection();
    }
    $(this._dom.input).val("");
};

/**
 * @param {Object} restrictions
 * @param {String} restrictions.text
 */
Exhibit.TextSearchFacet.prototype.applyRestrictions = function(restrictions) {
    this.setText(restrictions.text);
};

/**
 * @param {String} text
 */
Exhibit.TextSearchFacet.prototype.setText = function(text) {
    if (typeof text !== "undefined" && text !== null) {
        text = text.trim();
        $(this._dom.input).val(text);
        
        text = text.length > 0 ? text : null;
    } else {
        $(this._dom.input).val("");
    }
    
    if (text !== this._text) {
        this._text = text;
        this._notifyCollection();
    }
};

/**
 * @param {Exhibit.Set} items
 * @returns {Exhibit.Set}
 */
Exhibit.TextSearchFacet.prototype.restrict = function(items) {
    var set, itemToValue, text;
    if (this._text === null) {
        return items;
    } else {
        this._buildMaps();
        
        set = new Exhibit.Set();
        itemToValue = this._itemToValue;
        text = this._text.toLowerCase();
        
        items.visit(function(item) {
            var values, v;
            if (typeof itemToValue[item] !== "undefined") {
                values = itemToValue[item];
                for (v = 0; v < values.length; v++) {
                    if (values[v].indexOf(text) >= 0) {
                        set.add(item);
                        break;
                    }
                }
            }
        });
        return set;
    }
};

/**
 * @param {Exhibit.Set} items
 */
Exhibit.TextSearchFacet.prototype.update = function(items) {
    // nothing to do
};

/**
 *
 */
Exhibit.TextSearchFacet.prototype._notifyCollection = function() {
    this._uiContext.getCollection().onFacetUpdated(this);
};

/**
 *
 */
Exhibit.TextSearchFacet.prototype._initializeUI = function() {
    var self = this;
    this._dom = Exhibit.TextSearchFacet.constructFacetFrame(this._div, this._settings.facetLabel);

    if (this._text !== null) {
        $(this._dom.input).val(this._text);
    }

    $(this._dom.input).bind("keyup", function(evt) {
        self._onTextInputKeyUp(evt);
    });
};

/**
 * @param {Element} div
 * @param {String} facetLabel
 */
Exhibit.TextSearchFacet.constructFacetFrame = function(div, facetLabel) {
    if (typeof facetLabel !== "undefined"
        && facetLabel !== null
        && facetLabel !== "") {
        return $.simileDOM("string",
            div,
            '<div class="exhibit-facet-header">' +
                '<span class="exhibit-facet-header-title">' + facetLabel + '</span>' +
            '</div>' +
            '<div class="exhibit-text-facet"><input type="text" id="input"></div>'
        );
    } else {
        return $.simileDOM(
            "string",
            div,
            '<div class="exhibit-text-facet"><input type="text" id="input"></div>'
        );
    }
};

/**
 * @param {jQuery.Event} evt
 */
Exhibit.TextSearchFacet.prototype._onTextInputKeyUp = function(evt) {
    var self, newText;
    if (this._timerID !== null) {
        window.clearTimeout(this._timerID);
    }
    self = this;
    if (this._settings.requiresEnter === false) {
        this._timerID = window.setTimeout(function() {
            self._onTimeout();
        }, 500);
    } else {
        newText = $(this._dom.input).val().trim(); 
        if (newText.length === 0 || evt.which === 13) { // arbitrary
            this._timerID = window.setTimeout(function() {
                self._onTimeout();
            }, 0);
        }
    }
};

/**
 *
 */
Exhibit.TextSearchFacet.prototype._onTimeout = function() {
    var newText, self, oldText;

    this._timerID = null;
    
    newText = $(this._dom.input).val().trim();
    if (newText.length === 0) {
        newText = null;
    }
    
    if (newText !== this._text) {
        self = this;
        oldText = this._text;
        
        Exhibit.History.pushComponentState(
            this,
            Exhibit.Facet._registryKey,
            { "text": newText },
            newText !== null ?
                String.substitute(
                    Exhibit.FacetUtilities.l10n["facetTextSearchActionTitle"],
                    [ newText ]) :
                Exhibit.FacetUtilities.l10n["facetClearTextSearchActionTitle"],
            true
        );
    }
};

/**
 *
 */
Exhibit.TextSearchFacet.prototype._buildMaps = function() {
    var itemToValue, allItems, database, expressions, propertyIDs;
    if (typeof this._itemToValue === "undefined") {
        itemToValue = {};
        allItems = this._uiContext.getCollection().getAllItems();
        database = this._uiContext.getDatabase();
        
        if (this._expressions.length > 0) {
            expressions = this._expressions;
            allItems.visit(function(item) {
                var values, x, expression;
                values = [];
                for (x = 0; x < expressions.length; x++) {
                    expression = expressions[x];
                    expression.evaluateOnItem(item, database).values.visit(function(v) { values.push(v.toLowerCase()); });
                }
                itemToValue[item] = values;
            });
        } else {
            propertyIDs = database.getAllProperties();
            allItems.visit(function(item) {
                var values, p;
                values = [];
                for (p = 0; p < propertyIDs.length; p++) {
                    database.getObjects(item, propertyIDs[p]).visit(function(v) { values.push(v.toLowerCase()); });
                }
                itemToValue[item] = values;
            });
        }
        
        this._itemToValue = itemToValue;
    }
};

/**
 * @returns {Object}
 */
Exhibit.TextSearchFacet.prototype.exportState = function() {
    return this._exportState(false);
};

/**
 * @returns {Object}
 */
Exhibit.TextSearchFacet.prototype.exportEmptyState = function() {
    return this._exportState(true);
};

/**
 * @private
 * @param {Boolean} empty
 @ returns {Object}
 */
Exhibit.TextSearchFacet.prototype._exportState = function(empty) {
    return {
        "text": empty ? null : this._text
    };
};

/**
 * @param {Object} state
 * @param {String} state.text
 */
Exhibit.TextSearchFacet.prototype.importState = function(state) {
    this.applyRestrictions(state);
};
