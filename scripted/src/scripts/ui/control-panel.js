/**
 * @fileOverview Provides a holding place for Exhibit-wide controls.
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @class
 * @constructor
 * @param {Element} elmt
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.ControlPanel = function(elmt, uiContext) {
    this._uiContext = uiContext;
    this._widgets = [];
    this._div = elmt;
    this._settings = {};
    this._id = null;
    this._registered = false;
};

/**
 * @static
 * @private
 */
Exhibit.ControlPanel._settingSpecs = {
    "showToolbox":          { type: "boolean", defaultValue: true },
    "showBookmark":         { type: "boolean", defaultValue: true },
    "developerMode":        { type: "boolean", defaultvalue: false },
    "hoverReveal":          { type: "boolean", defaultValue: false }
};

/**
 * @private
 * @constant
 */
Exhibit.ControlPanel._registryKey = "controlPanel";

/**
 * @static
 * @param {Object} configuration
 * @param {Element} elmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.ControlPanel}
 */
Exhibit.ControlPanel.create = function(configuration, elmt, uiContext) {
    var panel = new Exhibit.ControlPanel(
        elmt,
        Exhibit.UIContext.create(configuration, uiContext)
    );
    Exhibit.ControlPanel._configure(panel, configuration);
    panel._setIdentifier();
    panel.register();
    panel._initializeUI();
    return panel;
};

/**
 * @static
 * @param {Element} div
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.Coordinator}
 */
Exhibit.ControlPanel.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var configuration, panel;
    configuration = Exhibit.getConfigurationFromDOM(configElmt);
    panel = new Exhibit.ControlPanel(
        (typeof containerElmt !== "undefined" && containerElmt !== null) ?
            containerElmt :
            configElmt,
        Exhibit.UIContext.createFromDOM(configElmt, uiContext)
    );
    Exhibit.ControlPanel._configureFromDOM(panel, configuration);
    panel._setIdentifier();
    panel.register();
    panel._initializeUI();
    return panel;
};

/**
 * @static
 * @private
 * @param {Exhibit.ControlPanel} panel
 * @param {Object} configuration
 */
Exhibit.ControlPanel._configure = function(panel, configuration) {
    Exhibit.SettingsUtilities.collectSettings(
        configuration,
        Exhibit.ControlPanel._settingSpecs,
        panel._settings
    );
};

/**
 * @static
 * @private
 * @param {Exhibit.ControlPanel} panel
 * @param {Object} configuration
 */
Exhibit.ControlPanel._configureFromDOM = function(panel, configuration) {
    Exhibit.SettingsUtilities.collectSettingsFromDOM(
        panel._div,
        Exhibit.ControlPanel._settingSpecs,
        panel._settings
    );
};

/**
 * @private
 * @param {jQuery.Event} evt
 * @param {Exhibit.Registry} reg
 */
Exhibit.ControlPanel._registerComponent = function(evt, reg) {
    if (!reg.hasRegistry(Exhibit.ControlPanel._registryKey)) {
        reg.createRegistry(Exhibit.ControlPanel._registryKey);
    }
};

/**
 * @private
 */
Exhibit.ControlPanel.prototype._initializeUI = function() {
    var widget;
    if (this._settings.showToolbox) {
        widget = Exhibit.ToolboxWidget.create(
            { "hoverReveal": this._settings.hoverReveal },
            this.getContainer(),
            this._uiContext
        );
        this.addWidget(widget);
    }
    if (this._settings.showBookmark) {
        widget = Exhibit.BookmarkWidget.create(
            { "hoverReveal": this._settings.hoverReveal },
            this.getContainer(),
            this._uiContext
        );
        this.addWidget(widget);
    }
    if (this._settings.developerMode) {
        widget = Exhibit.ResetHistoryWidget.create(
            { },
            this.getContainer(),
            this._uiContext
        );
        this.addWidget(widget);
    }
    $(this.getContainer()).addClass("exhibit-controlPanel");
    this.reconstruct();
};

/**
 *
 */
Exhibit.ControlPanel.prototype._setIdentifier = function() {
    this._id = $(this._div).attr("id");
    if (typeof this._id === "undefined" || this._id === null) {
        this._id = Exhibit.ControlPanel._registryKey
            + "-"
            + this._uiContext.getCollection().getID()
            + "-"
            + this._uiContext.getExhibit().getRegistry().generateIdentifier(
                Exhibit.ControlPanel._registryKey
            );
    }
};

/**
 *
 */
Exhibit.ControlPanel.prototype.register = function() {
    if (!this._uiContext.getExhibit().getRegistry().isRegistered(
        Exhibit.ControlPanel._registryKey,
        this.getID()
    )) {
        this._uiContext.getExhibit().getRegistry().register(
            Exhibit.ControlPanel._registryKey,
            this.getID(),
            this
        );
        this._registered = true;
    }
};

/**
 *
 */
Exhibit.ControlPanel.prototype.unregister = function() {
    this._uiContext.getExhibit().getRegistry().unregister(
        Exhibit.ControlPanel._registryKey,
        this.getID()
    );
    this._registered = false;
};

/**
 * @returns {jQuery}
 */
Exhibit.ControlPanel.prototype.getContainer = function() {
    return $(this._div);
};

/**
 * @returns {String}
 */
Exhibit.ControlPanel.prototype.getID = function() {
    return this._id;
};

/**
 *
 */
Exhibit.ControlPanel.prototype.dispose = function() {
    this.unregister();
    this._uiContext.dispose();
    this._uiContext = null;
    this._div = null;
    this._widgets = null;
    this._settings = null;
};

/**
 * @param {Object} widget
 */
Exhibit.ControlPanel.prototype.addWidget = function(widget) {
    this._widgets.push(widget);
    this.reconstruct();
};

/**
 * @param {Object} widget
 * @returns {Object}
 */
Exhibit.ControlPanel.prototype.removeWidget = function(widget) {
    var i, removed;
    removed = null;
    for (i = 0; i < this._widgets.length; i++) {
        if (this._widgets[i] === widget) {
            removed = this._widgets.splice(i, 1);
            break;
        }
    }
    this.reconstruct();
    return removed;
};

/**
 *
 */
Exhibit.ControlPanel.prototype.reconstruct = function() {
    var i;
    //$(this._div).empty();
    for (i = 0; i < this._widgets.length; i++) {
        // @@@
        //this._widgets[i].reconstruct(this);
    }
};

$(document).one("registerComponents.exhibit",
                Exhibit.ControlPanel._registerComponent);
