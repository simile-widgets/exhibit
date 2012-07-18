/**
 * @fileOverview Toolbox widget, the scissors, for exporting data.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @constructor
 * @class
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 */ 
Exhibit.ToolboxWidget = function(containerElmt, uiContext) {
    var self = this;
    this._popup = null;
    this._containerElmt = containerElmt;
    this._uiContext = uiContext;
    this._settings = {};
    this._hovering = false;
};

/**
 * @constant
 */
Exhibit.ToolboxWidget._settingSpecs = {
    "itemID":               { "type": "text" },
    "toolboxHoverReveal":   { "type": "boolean", "defaultValue": false }
};

/**
 * @param {Object} configuration
 * @param {Element} containerElmt
 * @param {Exhibit.UIContexT} uiContext
 * @returns {Exhibit.ToolboxWidget}
 */
Exhibit.ToolboxWidget.create = function(configuration, containerElmt, uiContext) {
    var widget = new Exhibit.ToolboxWidget(
        containerElmt,
        Exhibit.UIContext.create(configuration, uiContext)
    );
    Exhibit.ToolboxWidget._configure(widget, configuration);

    widget._initializeUI();
    return widget;
};

/**
 * @param {Element} configElmt
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.ToolboxWidget}
 */
Exhibit.ToolboxWidget.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var configuration, widget;
    configuration = Exhibit.getConfigurationFromDOM(configElmt);
    widget = new Exhibit.ToolboxWidget(
        (typeof containerElmt !== "undefined" && containerElmt !== null) ?
            containerElmt : configElmt, 
        Exhibit.UIContext.createFromDOM(configElmt, uiContext)
    );

    Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt, Exhibit.ToolboxWidget._settingSpecs, widget._settings);    
    Exhibit.ToolboxWidget._configure(widget, configuration);
    
    widget._initializeUI();
    return widget;
};

/**
 * @param {Exhibit.ToolboxWidget} widget
 * @param {Object} configuration
 */
Exhibit.ToolboxWidget._configure = function(widget, configuration) {
    Exhibit.SettingsUtilities.collectSettings(configuration, Exhibit.ToolboxWidget._settingSpecs, widget._settings);
};

/**
 *
 */
Exhibit.ToolboxWidget.prototype.dispose = function() {
    Exhibit.jQuery(this._containerElmt).unbind("mouseover mouseout");
    this._dismiss();
    this._settings = null;
    this._containerElmt = null;
    this._uiContext = null;
};

/**
 *
 */
Exhibit.ToolboxWidget.prototype._initializeUI = function() {
    var self = this;
    if (this._settings.toolboxHoverReveal) {
        Exhibit.jQuery(this._containerElmt).bind("mouseover", function(evt) {
            self._onContainerMouseOver(evt);
        })
        Exhibit.jQuery(this._containerElmt).bind("mouseout", function(evt) {
            self._onContainerMouseOut(evt);
        });
    } else {
        this._makePopup();
    }
};

/**
 *
 */
Exhibit.ToolboxWidget.prototype._makePopup = function() {
    var coords, docWidth, popup, self, right;
    self = this;

    coords = Exhibit.jQuery(this._containerElmt).offset();
    docWidth = Exhibit.jQuery(document.body).width();

    // Don't widen the page
    right = docWidth - coords.left - Exhibit.jQuery(this._containerElmt).width();
    if (right <= 0) {
        right = 1;
    }

    popup = Exhibit.jQuery("<div>")
        .attr("class", "exhibit-toolboxWidget-popup screen")
        .css("position", "absolute")
        .css("top", coords.top + "px")
        .css("right", right + "px");

    this._popup = popup;
    this._fillPopup(popup);
    Exhibit.jQuery(this._containerElmt).append(popup);
};

/**
 * @param {jQuery.Event}
 */
Exhibit.ToolboxWidget.prototype._onContainerMouseOver = function(evt) {
    var self, coords, docWidth, popup;
    if (!this._hovering) {
        self = this;
        coords = Exhibit.jQuery(this._containerElmt).offset();
        docWidth = Exhibit.jQuery(document.body).width();

        popup = Exhibit.jQuery("<div>")
            .hide()
            .attr("class", "exhibit-toolboxWidget-popup screen")
            .css("position", "absolute")
            .css("top", coords.top + "px")
            .css("right", (docWidth - coords.left - Exhibit.jQuery(this._containerElmt).width()) + "px");
        this._fillPopup(popup);
        Exhibit.jQuery(popup).fadeIn();
        Exhibit.jQuery(document.body).append(popup);
        popup.bind("mouseover", function(evt) {
            self._onPopupMouseOver(evt);
        });
        popup.bind("mouseout", function(evt) {
            self._onPopupMouseOut(evt);
        });
        
        this._popup = popup;
        this._hovering = true;
    } else {
        this._clearTimeout();
    }
};

/**
 * @param {jQuery.Event} evt
 */
Exhibit.ToolboxWidget.prototype._onContainerMouseOut = function(evt) {
    if (Exhibit.ToolboxWidget._mouseOutsideElmt(evt, this._containerElmt)) {
        this._setTimeout();
    }
};

/**
 * @param {jQuery.Event} evt
 */
Exhibit.ToolboxWidget.prototype._onPopupMouseOver = function(evt) {
    this._clearTimeout();
};

/**
 * @param {jQuery.Event} evt
 */
Exhibit.ToolboxWidget.prototype._onPopupMouseOut = function(evt) {
    if (Exhibit.ToolboxWidget._mouseOutsideElmt(evt, this._containerElmt)) {
        this._setTimeout();
    }
};

/**
 *
 */
Exhibit.ToolboxWidget.prototype._setTimeout = function() {
    var self = this;
    this._timer = window.setTimeout(function() {
        self._onTimeout();
    }, 200);
};

/**
 *
 */
Exhibit.ToolboxWidget.prototype._clearTimeout = function() {
    if (this._timer) {
        window.clearTimeout(this._timer);
        this._timer = null;
    }
};

/**
 *
 */
Exhibit.ToolboxWidget.prototype._onTimeout = function() {
    this._dismiss();
    this._hovering = false;
    this._timer = null;
};

/**
 * @param {jQuery} elmt
 */
Exhibit.ToolboxWidget.prototype._fillPopup = function(elmt) {
    var self, exportImg;
    self = this;
    
    exportImg = Exhibit.UI.createTranslucentImage("images/liveclipboard-icon.png");
    Exhibit.jQuery(exportImg).attr("class", "exhibit-toolboxWidget-button");
    Exhibit.jQuery(exportImg).bind("click", function(evt) {
        self._showExportMenu(exportImg, evt);
    });
    Exhibit.jQuery(elmt).append(exportImg);
};

Exhibit.ToolboxWidget.prototype._dismiss = function() {
    if (this._popup !== null) {
        Exhibit.jQuery(this._popup).fadeOut("fast", function() {
            Exhibit.jQuery(this).remove();
        });
        this._popup = null;
    }
};

/**
 * @param {jQuery.Event} evt
 * @param {Element|jQuery} elmt
 * @returns {Boolean}
 * @depends jQuery
 */
Exhibit.ToolboxWidget._mouseOutsideElmt = function(evt, elmt) {
    var eventCoords, coords;
    eventCoords = { "x": evt.pageX, "y": evt.pageY };
    coords = Exhibit.jQuery(elmt).offset();
    return (eventCoords.x < coords.left ||
            eventCoords.x > coords.left + elmt.offsetWidth ||
            eventCoords.y < coords.top ||
            eventCoords.y > coords.top + elmt.offsetHeight);
};

/**
 * @param {Element} elmt
 * @param {jQuery.Event} evt
 */
Exhibit.ToolboxWidget.prototype._showExportMenu = function(elmt, evt) {
    var self, popupDom, makeMenuItem, exporters, i;

    self = this;

    popupDom = Exhibit.UI.createPopupMenuDom(elmt);
    
    makeMenuItem = function(exporter) {
        popupDom.appendMenuItem(
            exporter.getLabel(),
            null,
            function() {
                var database, text;
                database = self._uiContext.getDatabase();
                text = (typeof self._settings.itemID !== "undefined") ?
                    exporter.exportOne(self._settings.itemID, database) :
                    exporter.exportMany(
                        self._uiContext.getCollection().getRestrictedItems(), 
                        database
                    );
                Exhibit.ToolboxWidget.createExportDialogBox(text).open();
            }
        );
    };
    
    exporters = Exhibit.staticRegistry.getKeys(Exhibit.Exporter._registryKey);
    for (i = 0; i < exporters.length; i++) {
        makeMenuItem(Exhibit.staticRegistry.get(
            Exhibit.Exporter._registryKey,
            exporters[i]
        ));
    }
    
    if (typeof this.getGeneratedHTML === "function") {
        makeMenuItem({
            "getLabel":  function() { return Exhibit._("%export.htmlExporterLabel"); },
            "exportOne":  this.getGeneratedHTML,
            "exportMany": this.getGeneratedHTML
        });
    }

    popupDom.open(evt);
};

/**
 * @param {String} string
 * @returns {Object}
 */
Exhibit.ToolboxWidget.createExportDialogBox = function(string) {
    var template, dom;
    template = {
        "tag":      "div",
        "class":    "exhibit-copyDialog exhibit-ui-protection",
        "children": [
            {   tag:        "button",
                field:      "closeButton",
                children:    [ Exhibit._("%export.exportDialogBoxCloseButtonLabel") ]
            },
            {   tag:        "p",
                children:   [ Exhibit._("%export.exportDialogBoxPrompt") ]
            },
            {   tag:        "div",
                field:      "textAreaContainer"
            }
        ]
    };
    dom = Exhibit.jQuery.simileDOM("template", template);
    Exhibit.jQuery(dom.textAreaContainer).html("<textarea wrap='off' rows='15'>" + string + "</textarea>");
        
    Exhibit.UI.setupDialog(dom, true);

    dom.open = function() {
        var textarea;

        Exhibit.jQuery(dom.elmt).css("top", (document.body.scrollTop + 100) + "px");
        
        Exhibit.jQuery(document.body).append(Exhibit.jQuery(dom.elmt));
        Exhibit.jQuery(document).trigger("modalSuperseded.exhibit");
        
        textarea = Exhibit.jQuery(dom.textAreaContainer).children().get(0);
        textarea.select();
        Exhibit.jQuery(dom.closeButton).bind("click", function(evt) {
            dom.close();
        });
        Exhibit.jQuery(textarea).bind("keyup", function(evt) {
            if (evt.keyCode === 27) { // ESC
                dom.close();
            }
        });
    };
    
    return dom;
};
