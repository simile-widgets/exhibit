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
};

/**
 * @static
 * @private
 */
Exhibit.ControlPanel._settingSpecs = {
    "showToolbox":          { type: "boolean", defaultValue: true },
    "showBookmark":         { type: "boolean", defaultValue: true },
    "hoverReveal":          { type: "boolean", defaultValue: false }
};

/**
 * @static
 * @param {Object} configuration
 * @param {Element} elmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.ControlPanel}
 */
Exhibit.ControlPanel.create = function(configuration, elmt, uiContext) {
    var widget = new Exhibit.ControlPanel(
        elmt,
        Exhibit.UIContext.create(configuration, uiContext)
    );
    Exhibit.ControlPanel._configure(widget, configuration);
    widget._initializeUI();
    return widget;
};

/**
 * @static
 * @param {Element} div
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.Coordinator}
 */
Exhibit.ControlPanel.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var configuration, widget;
    configuration = Exhibit.getConfigurationFromDOM(configElmt);
    widget = new Exhibit.ControlPanel(
        containerElmt !== null ? containerElmt : configElmt,
        Exhibit.UIContext.createFromDOM(configElmt, uiContext)
    );
    Exhibit.ControlPanel._configure(widget, configuration);
    widget._initializeUI();
    return widget;
};

/**
 * @static
 * @private
 * @param {Exhibit.ControlPanel} widget
 * @param {Object} configuration
 */
Exhibit.ControlPanel._configure = function(widget, configuration) {
    Exhibit.SettingsUtilities.collectSettings(
        configuration,
        Exhibit.ControlPanel._settingSpecs,
        widget._settings
    );
};

/**
 * @private
 */
Exhibit.ControlPanel.prototype._initializeUI = function() {
    var toolbox, bookmark;
    if (this._settings.showToolbox) {
        toolbox = Exhibit.ToolboxWidget.create(
            { "hoverReveal": this._settings.hoverReveal },
            this.getContainer(),
            this._uiContext
        );
        this.addWidget(toolbox);
    }
    if (this._settings.showBookmark) {
        bookmark = Exhibit.BookmarkWidget.create(
            { "hoverReveal": this._settings.hoverReveal },
            this.getContainer(),
            this._uiContext
        );
        this.addWidget(bookmark);
    }
    $(this.getContainer()).addClass("exhibit-controlPanel");
    this.reconstruct();
};

/**
 * @returns {jQuery}
 */
Exhibit.ControlPanel.prototype.getContainer = function() {
    return $(this._div);
};

/**
 *
 */
Exhibit.ControlPanel.prototype.dispose = function() {
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
