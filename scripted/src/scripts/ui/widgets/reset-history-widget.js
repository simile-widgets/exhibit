/**
 * @fileOverview Development widget to assist with resetting history, which
 *     can get in an odd state if the Exhibit is being designed.
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @constructor
 * @class
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext 
 */
Exhibit.ResetHistoryWidget = function(containerElmt, uiContext) {
    this._containerElmt = containerElmt;
    this._uiContext = uiContext;
    this._settings = {};
};

/**
 * @static
 * @param {Object} configuration
 * @param {Element} elmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.ResetHistoryWidget}
 */
Exhibit.ResetHistoryWidget.create = function(configuration, elmt, uiContext) {
    var widget = new Exhibit.ResetHistoryWidget(
        elmt,
        Exhibit.UIContext.create(configuration, uiContext)
    );
    Exhibit.ResetHistoryWidget._configure(widget, configuration);
    widget._initializeUI();
    return widget;
};

/**
 * @static
 * @param {Element} configElmt
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.ResetHistoryWidget}
 */
Exhibit.ResetHistoryWidget.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var configuration, widget;
    configuration = Exhibit.getConfigurationFromDOM(configElmt);
    widget = new Exhibit.ResetHistoryWidget(
        (typeof containerElmt !== "undefined" && containerElmt !== null) ?
            containerElmt : configElmt,
        Exhibit.UIContext.createFromDOM(configElmt, uiContext)
    );
    Exhibit.ResetHistoryWidget._configure(widget, configuration);
    widget._initializeUI();
    return widget;
};

/**
 * @static
 * @private
 * @param {Exhibit.ResetHistoryWidget} widget
 * @param {Object} configuration
 */
Exhibit.ResetHistoryWidget._configure = function(widget, configuration) {
};

/**
 * Sets the history to its initial, empty state and reloads the page.
 * @static
 */
Exhibit.ResetHistoryWidget.resetHistory = function() {
    Exhibit.History.eraseState();
    window.location.reload();
};

/**
 *
 */
Exhibit.ResetHistoryWidget.prototype._initializeUI = function() {
    var img;

    img = Exhibit.UI.createTranslucentImage("images/reset-history-icon.png");
    Exhibit.jQuery(img)
        .attr("class", "exhibit-resetHistoryWidget-button")
        .attr("title", "Click to clear state and refresh window")
        .bind("click", function(evt) {
            Exhibit.ResetHistoryWidget.resetHistory();
        });
    Exhibit.jQuery(this._containerElmt).append(img);
};

/**
 * @public
 * @param {Exhibit.ControlPanel} panel
 */
Exhibit.ResetHistoryWidget.prototype.reconstruct = function(panel) {
    this._initializeUI();
};

/**
 *
 */
Exhibit.ResetHistoryWidget.prototype.dispose = function() {
    this._uiContext.dispose();
    this._uiContext = null;
    this._div = null;
    this._settings = null;
};
