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
    this._customExporters = [];
    this._generators = [];
    this._addGeneratorListener = function(evt, generator) {
        self._generators.push(generator);
    };
    this._removeGeneratorListener = function(evt, generator) {
        var i;
        for (i = 0; i < self._generators.length; i++) {
            if (self._generators[i] === generator) {
                self._generators.splice(i, 1);
                break;
            }
        }
    };
    $(document).bind("addGenerator.exhibit", this._addGeneratorListener);
    $(document).bind("removeGenerator.exhibit", this._removeGeneratorListener);
};

/**
 * @constant
 */
Exhibit.ToolboxWidget._settingSpecs = {
    "itemID": { type: "text" },
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
    $(document).unbind("addGenerators.exhibit", this._addGeneratorListener);
    $(document).unbind("removeGenerators.exhibit", this._removeGeneratorListener);
    this._popup = null;
    this._settings = null;
    this._containerElmt = null;
    this._uiContext = null;
    this._generators = null;
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
    this._makePopup();
};

Exhibit.ToolboxWidget.prototype._makePopup = function() {
    var coords, docWidth, docHeight, popup;
    self = this;
    
    popup = $("<div>")
        .attr("class", "exhibit-toolboxWidget-popup screen");

    this._fillPopup(popup);
    $(this._containerElmt).append(popup);
    this._popup = popup;
};

/**
 * @param {jQuery} elmt
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
    
    if (this._generators.length > 0) {
        for (i = 0; i < this._generators.length; i++) {
            generator = this._generators[i];
            makeMenuItem({
                getLabel: function() {
                    return Exhibit.l10n.htmlExporterLabel
                        + " "
                        + generator.getLabel();
                },
                exportOne: function() {
                    return generator.getContent();
                },
                exportMany: function() {
                    return generator.getContent();
                }
            });
        }
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
        
        textarea = $(dom.textAreaContainer).children().get(0);
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
