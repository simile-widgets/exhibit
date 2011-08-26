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
    this._containerElmt = containerElmt;
    this._uiContext = uiContext;
    this._settings = {};
    this._customExporters = [];
    
    this._hovering = false;
    this._initializeUI();
};

/**
 * @constant
 */
Exhibit.ToolboxWidget._settingSpecs = {
    "itemID": { type: "text" }
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
        containerElmt !== null ? containerElmt : configElmt, 
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
    $(this._containerElmt).unbind("mouseover mouseout");
    
    this._dismiss();
    this._settings = null;
    this._containerElmt = null;
    this._uiContext = null;
};

/**
 * @param {Exhibit.Exporter} exporter
 */
Exhibit.ToolboxWidget.prototype.addExporter = function(exporter) {
    this._customExporters.push(exporter);
};

/**
 *
 */
Exhibit.ToolboxWidget.prototype._initializeUI = function() {
    var self = this;
    $(this._containerElmt).bind("mouseover", function(evt) {
        self._onContainerMouseOver(evt);
    });
    $(this._containerElmt).bind("mouseout", function(evt) {
        self._onContainerMouseOut(evt);
    });
};

/**
 * @param {jQuery.Event} evt
 */
Exhibit.ToolboxWidget.prototype._onContainerMouseOver = function(evt) {
    var self, coords, docWidth, docHeight, popup;
    if (!this._hovering) {
        self = this;
        coords = $(this._containerElmt).offset();
        docWidth = $(document.body).width();
        docHeight = $(document.body).height();
        
        popup = $("<div>")
            .attr("class", "exhibit-toolboxWidget-popup screen")
            .css("top", coords.top + "px")
            .css("right", (docWidth - coords.left - $(this._containerElmt).width()) + "px");
        
        this._fillPopup(popup.get(0), evt);
        
        $(document.body).append(popup);
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
 * @param {Element} elmt
 * @param {jQuery.Event} evt
 */
Exhibit.ToolboxWidget.prototype._fillPopup = function(elmt, evt) {
    var self, exportImg;
    self = this;
    
    exportImg = Exhibit.UI.createTranslucentImage("images/liveclipboard-icon.png");
    $(exportImg).attr("class", "exhibit-toolboxWidget-button");
    $(exportImg).bind("click", function(evt) {
        self._showExportMenu(exportImg, evt);
    });
    
    $(elmt).append(exportImg);
};

/**
 *
 */
Exhibit.ToolboxWidget.prototype._dismiss = function() {
    if (typeof this._popup !== "undefined" && this._popup !== null) {
        $(this._popup).remove();
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
    coords = $(elmt).offset();
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
    
    exporters = Exhibit.Registry.getKeys(Exhibit.Exporter._registryKey);
    for (i = 0; i < exporters.length; i++) {
        makeMenuItem(Exhibit.Registry.get(Exhibit.Exporter._registryKey, exporters[i]));
    }
    
    if (typeof this.getGeneratedHTML !== "undefined") {
        makeMenuItem({ 
            getLabel:   function() { return Exhibit.l10n.htmlExporterLabel; },
            exportOne:  this.getGeneratedHTML,
            exportMany: this.getGeneratedHTML
        });
    }
    
    /*if (generatedContentElmtRetriever !== null) {
        popupDom.appendMenuItem(
            Exhibit.l10n.htmlExporterLabel,
            null,
            function() {
                Exhibit.UI.createCopyDialogBox(
                    generatedContentElmtRetriever().innerHTML
                        //.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\&/g, "&amp;")
                ).open();
            }
        );
    }*/
    
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
                children:    [ Exhibit.l10n.exportDialogBoxCloseButtonLabel ]
            },
            {   tag:        "p",
                children:   [ Exhibit.l10n.exportDialogBoxPrompt ]
            },
            {   tag:        "div",
                field:      "textAreaContainer"
            }
        ]
    };
    dom = $.simileDOM("template", template);
    $(dom.textAreaContainer).html("<textarea wrap='off' rows='15'>" + string + "</textarea>");
        
    Exhibit.UI.setupDialog(dom, true);

    dom.open = function() {
        var textarea;

        $(dom.elmt).css("top", (document.body.scrollTop + 100) + "px");
        
        $(document.body).append($(dom.elmt));
        $(document).trigger("modalSuperseded.exhibit");
        
        textarea = dom.textAreaContainer.firstChild;
        textarea.select();
        $(dom.closeButton).bind("click", function(evt) {
            dom.close();
        });
        $(textarea).bind("keyup", function(evt) {
            if (evt.keyCode === 27) { // ESC
                dom.close();
            }
        });
    };
    
    return dom;
};
