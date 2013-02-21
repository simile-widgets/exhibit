/**
 * @fileOverview Coder component.
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @class
 * @constructor
 * @param {String} key
 * @param {Element|jQuery} div
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.Coder = function(key, div, uiContext) {
    var self, _instanceKey, _registered, _id, _uiContext, _div, _setIdentifier;

    /**
     * @private
     */
    self = this;

    /**
     * @private
     */
    _div = Exhibit.jQuery(div);

    /**
     * @private
     */
    _uiContext = uiContext;

    /**
     * @private
     */
    _instanceKey = key;

    /**
     * @private
     */
    _registered = false;

    /**
     * @private
     */
    _id = null;

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
     * @public
     * @returns {String}
     */
    this.getID = function() {
        return _id;
    };

    /**
     * @public
     * @returns {Exhibit.UIContext}
     */
    this.getUIContext = function() {
        return _uiContext;
    };

    /**
     * Returns the containing element for this view.
     * @public
     * @returns {jQuery}
     */
    this.getContainer = function() {
        return _div;
    };

    this.register = function() {
        this.getUIContext().getMain().getRegistry().register(
            Exhibit.Coder.getRegistryKey(),
            this.getID(),
            this
        );
        _registered = true;
    };

    this.unregister = function() {
        self.getUIContext().getMain().getRegistry().unregister(
            Exhibit.Coder.getRegistryKey(),
            self.getID()
        );
        _registered = false;
    };

    this._dispose = function() {
        this._settingSpecs = null;

        this._settings = null;
        Exhibit.jQuery(_div).empty();
        _div = null;

        this.unregister();
        _uiContext = null;
    };

    /**
     * @private
     */
    _setIdentifier = function() {
        _id = Exhibit.jQuery(_div).attr("id");
        if (typeof _id === "undefined" || _id === null) {
            _id = _instanceKey
                + "-"
                + self.getUIContext().getCollection().getID()
                + "-"
                + self.getUIContext().getMain().getRegistry().generateIdentifier(Exhibit.Coder.getRegistryKey());
        }
    };

    _setIdentifier();
};

/**
 * @private
 * @constant
 */
Exhibit.Coder._registryKey = "coder";

/**
 * @public
 * @static
 * @returns {String}
 */
Exhibit.Coder.getRegistryKey = function() {
    return Exhibit.Coder._registryKey;
};

/**
 * @static
 * @public
 * @param {jQuery.Event} evt
 * @param {Exhibit.Registry} reg
 */
Exhibit.Coder.registerComponent = function(evt, reg) {
    if (!reg.hasRegistry(Exhibit.Coder.getRegistryKey())) {
        reg.createRegistry(Exhibit.Coder.getRegistryKey());
    }
};

Exhibit.jQuery(document).one(
    "registerComponents.exhibit",
    Exhibit.Coder.registerComponent
);
