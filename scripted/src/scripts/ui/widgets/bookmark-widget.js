/**
 * @fileOverview Widget for acquiring permalink to state of Exhibit.
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

// @@@ integrate bit.ly or some other url shortener?

/**
 * @class
 * @constructor
 * @param {Element} elmt
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.BookmarkWidget = function(elmt, uiContext) {
    this._uiContext = uiContext;
    this._div = elmt;
    this._settings = {};
    this._controlPanel = null;
    this._popup = null;
};

/**
 * @static
 * @param {Object} configuration
 * @param {Element} elmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.BookmarkWidget}
 */
Exhibit.BookmarkWidget.create = function(configuration, elmt, uiContext) {
    var widget = new Exhibit.BookmarkWidget(
        elmt,
        Exhibit.UIContext.create(configuration, uiContext)
    );
    Exhibit.BookmarkWidget._configure(widget, configuration);
    widget._initializeUI();
    return widget;
};

Exhibit.BookmarkWidget.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var configuration, widget;
    configuration = Exhibit.getConfigurationFromDOM(configElmt);
    widget = new Exhibit.BookmarkWidget(
        (typeof containerElmt !== "undefined" && containerElmt !== null) ?
            containerElmt : configElmt,
        Exhibit.UIContext.createFromDOM(configElmt, uiContext)
    );
    Exhibit.BookmarkWidget._configure(widget, configuration);
    widget._initializeUI();
    return widget;
};

/**
 * @static
 * @private
 * @param {Exhibit.BookmarkWidget} widget
 * @param {Object} configuration
 */
Exhibit.BookmarkWidget._configure = function(widget, configuration) {
};

/**
 *
 */
Exhibit.BookmarkWidget.prototype._initializeUI = function() {
    var popup;
    popup = Exhibit.jQuery("<div>")
        .attr("class", "exhibit-bookmarkWidget-popup");
    this._fillPopup(popup);
    Exhibit.jQuery(this.getContainer()).append(popup);
    this._popup = popup;
};

/**
 * @public
 * @param {Exhibit.ControlPanel} panel
 */
Exhibit.BookmarkWidget.prototype.reconstruct = function(panel) {
    this._popup = null;
    this._initializeUI();
};

/**
 * @param {jQuery} popup
 */
Exhibit.BookmarkWidget.prototype._fillPopup = function(popup) {
    var self, img;

    self = this;
    img = Exhibit.UI.createTranslucentImage("images/bookmark-icon.png");
    Exhibit.jQuery(img)
        .addClass("exhibit-bookmarkWidget-button")
        .attr("title", Exhibit._("%widget.bookmark.tooltip"))
        .bind("click", function(evt) {
            self._showBookmark(img, evt);
        })
        .appendTo(popup);
};

/**
 * @param {jQuery} elmt
 * @param {jQuery.Event} evt
 */
Exhibit.BookmarkWidget.prototype._showBookmark = function(elmt, evt) {
    var self, popupDom, el;
    self = this;
    self._controlPanel.childOpened();
    popupDom = Exhibit.UI.createPopupMenuDom(elmt);
    el = Exhibit.jQuery('<input type="text" />').
        attr("value", Exhibit.Bookmark.generateBookmark()).
        attr("size", 40);
    Exhibit.jQuery(popupDom.elmt).append(Exhibit.jQuery(el));
    Exhibit.jQuery(popupDom.elmt).one("closed.exhibit", function(evt) {
        self.dismiss();
    });
    popupDom.open(evt);
    Exhibit.jQuery(el).get(0).select();
};

/**
 * @returns {jQuery}
 */
Exhibit.BookmarkWidget.prototype.getContainer = function() {
    return Exhibit.jQuery(this._div);
};

/**
 *
 */
Exhibit.BookmarkWidget.prototype.dispose = function() {
    this._uiContext.dispose();
    this._uiContext = null;
    this._div = null;
    this._settings = null;
};

/**
 * @param {Exhibit.ControlPanel} panel
 */
Exhibit.BookmarkWidget.prototype.setControlPanel = function(panel) {
    this._controlPanel = panel;
};

/**
 *
 */
Exhibit.BookmarkWidget.prototype.dismiss = function() {
    this._controlPanel.childClosed();
};
