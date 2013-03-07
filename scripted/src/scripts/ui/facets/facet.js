/**
 * @fileOverview Basic facet component registration.
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @class
 * @constructor
 * @param {String} key
 * @param {Element|jQuery} div
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.Facet = function(key, div, uiContext) {
    var self, _id, _instanceKey, _div, _uiContext, _registered, _expression, _expressionString, _setIdentifier;

    /**
     * @private
     */
    self = this;

    /**
     * @private
     */
    _instanceKey = key;

    /**
     * @private
     */
    _uiContext = uiContext;

    /**
     * @private
     */
    _div = Exhibit.jQuery(div);

    /**
     * @private
     */
    _registered = false;

    /**
     * @private
     */
    _id = null;

    /**
     * @private
     */
    _expression = null;

    /**
     * @private
     */
    _expressionString = "";

    /**
     * @public
     */
    this._settingSpecs = {};

    /**
     * @public
     */
    this._settings = {};

    /**
     * @public
     * @returns {String}
     */
    this.getLabel = function() {
        if (typeof this._settings.facetLabel !== "undefined") {
            return this._settings.facetLabel;
        } else {
            return Exhibit._("%facets.missingLabel", Exhibit.makeExhibitAttribute("facetLabel"));
        }
    };

    /**
     * @public
     * @param {Exhibit.Expression}
     */
    this.setExpression = function(e) {
        _expression = e;
    };

    /**
     * @public
     * @returns {Exhibit.Expression}
     */
    this.getExpression = function() {
        return _expression;
    };

    /**
     * @public
     * @param {String} s
     */
    this.setExpressionString = function(s) {
        _expressionString = s;
        _setIdentifier();
    };

    /**
     * @public
     * @returns {String}
     */
    this.getExpressionString = function() {
        return _expressionString;
    };

    /**
     * @public
     * @param {Object} specs
     */
    this.addSettingSpecs = function(specs) {
        Exhibit.jQuery.extend(true, this._settingSpecs, specs);
    };

    /**
     * @public
     * @returns {Object}
     */
    this.getSettingSpecs = function() {
        return this._settingSpecs;
    };

    /**
     * Returns the programmatic identifier used for this facet.
     * @public
     * @returns {String}
     */
    this.getID = function() {
        return _id;
    };

    /**
     * Returns the UI context for this facet.
     * @public
     * @returns {Exhibit.UIContext}
     */
    this.getUIContext = function() {
        return _uiContext;
    };

    /**
     * Returns the containing element for this facet.
     * @public
     * @returns {jQuery}
     */
    this.getContainer = function() {
        return _div;
    };

    /**
     * Enter this facet into the registry, making it easier to locate.
     * By convention, this should be called at the end of the factory.
     * @example MyFacet.create = function() { ...; this.register(); };
     */
    this.register = function() {
        this.getUIContext().getMain().getRegistry().register(
            Exhibit.Facet.getRegistryKey(),
            this.getID(),
            this
        );
        _registered = true;
    };

    /**
     * Remove this facet from the registry.
     */
    this.unregister = function() {
        self.getUIContext().getMain().getRegistry().unregister(
            Exhibit.Facet.getRegistryKey(),
            self.getID()
        );
        _registered = false;
    };

    /**
     * Free up all references to objects, empty related elements, unregister.
     */
    this.dispose = function() {
        Exhibit.jQuery(_div).empty();
        this.getUIContext().getCollection().removeFacet(this);
        // if instance defines _dispose for localized material, call it
        if (typeof this._dispose !== "undefined") {
            this._dispose();
        }
        this.unregister();

        _id = null;
        _div = null;
        _uiContext = null;
        _expression = null;
        _expressionString = null;
        _settings = null;
        this._settingSpecs = null;
        self = null;
    };

    /**
     * @private
     */
    _setIdentifier = function() {
        _id = Exhibit.jQuery(_div).attr("id");
        if (typeof _id === "undefined" || _id === null) {
            _id = Exhibit.Facet.getRegistryKey()
                + "-"
                + _instanceKey
                + "-"
                + self.getExpressionString()
                + "-"
                + self.getUIContext().getCollection().getID()
                + "-"
                + self.getUIContext().getMain().getRegistry().generateIdentifier(Exhibit.Facet.getRegistryKey());
        }
    };

    _setIdentifier();
    self.addSettingSpecs(Exhibit.Facet._settingSpecs);
};

/**
 * @private
 * @constant
 */
Exhibit.Facet._registryKey = "facet";

Exhibit.Facet._settingSpecs = {
    "facetLabel":       { "type": "text" }
};

/**
 * @public
 * @static
 * @returns {String}
 */
Exhibit.Facet.getRegistryKey = function() {
    return Exhibit.Facet._registryKey;
};

/**
 * @private
 * @param {jQuery.Event} evt
 * @param {Exhibit.Registry} reg
 */
Exhibit.Facet.registerComponent = function(evt, reg) {
    if (!reg.hasRegistry(Exhibit.Facet.getRegistryKey())) {
        reg.createRegistry(Exhibit.Facet.getRegistryKey());
        Exhibit.jQuery(document).trigger("registerFacets.exhibit");
    }
};

Exhibit.jQuery(document).one(
    "registerComponents.exhibit",
    Exhibit.Facet.registerComponent
);
