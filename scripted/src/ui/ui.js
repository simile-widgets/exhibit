/**
 * @fileOverview
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace
 */
Exhibit.UI = {
    /**
     *
     */
    componentMap: {},
// @@@ validator will have to be a configured option unavailable by default
//    validator: Exhibit.Babel + "validator";
    validator: ""
};

/**
 * Augment with Exhibit.Registry?
 * @param {String} name
 * @param {String} comp
 */
Exhibit.UI.registerComponent = function(name, comp) {
    var msg = "Cannot register component " + name + " -- ";
    if (Exhibit.UI.componentMap.hasOwnProperty(name)) {
        Exhibit.Debug.warn(msg + 'another component has taken that name');
    } else if (!comp) {
        Exhibit.Debug.warn(msg + 'no component object provided');
    } else if (!comp.create) {
        Exhibit.Debug.warn(msg + "component has no create function");
    } else if (!comp.createFromDOM) {
        Exhibit.Debug.warn(msg + "component has no createFromDOM function");
    } else {
        Exhibit.UI.componentMap[name] = comp;
    }
};

/**
 * @param {Object} configuration
 * @param {Element} elmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Object}
 */
Exhibit.UI.create = function(configuration, elmt, uiContext) {
    var role, createFunc;

    if (configuration.hasOwnProperty("role")) {
        role = configuration.role;
        if (role !== null && role.startsWith("exhibit-")) {
            role = role.substr("exhibit-".length);
        }
        
        if (Exhibit.UI.componentMap.hasOwnProperty(role)) {
            createFunc = Exhibit.UI.componentMap[role].create;
            return createFunc(configuration, elmt, uiContext);
        }
        
        switch (role) {
        case "lens":
        case "edit-lens":
            Exhibit.UIContext.registerLens(configuration, uiContext.getLensRegistry());
            return null;
        case "view":
            return Exhibit.UI.createView(configuration, elmt, uiContext);
        case "facet":
            return Exhibit.UI.createFacet(configuration, elmt, uiContext);
        case "coordinator":
            return Exhibit.UI.createCoordinator(configuration, uiContext);
        case "coder":
            return Exhibit.UI.createCoder(configuration, uiContext);
        case "viewPanel":
            return Exhibit.ViewPanel.create(configuration, elmt, uiContext);
        case "logo":
            return Exhibit.Logo.create(configuration, elmt, uiContext);
        case "hiddenContent":
            elmt.style.display = "none";
            return null;
        }
    }
    return null;
};

/**
 * @param {Element} elmt
 * @param {Exhibit.UIContext} uiContext
 * returns {Object}
 */
Exhibit.UI.createFromDOM = function(elmt, uiContext) {
    var role, createFromDOMFunc;

    role = Exhibit.getRoleAttribute(elmt);
    
    if (Exhibit.UI.componentMap.hasOwnProperty(role)) {
        createFromDOMFunc = Exhibit.UI.componentMap[role].createFromDOM;
        return createFromDOMFunc(elmt, uiContext);
    }
    
    switch (role) {
    case "lens":
    case "edit-lens":
        Exhibit.UIContext.registerLensFromDOM(elmt, uiContext.getLensRegistry());
        return null;
    case "view":
        return Exhibit.UI.createViewFromDOM(elmt, null, uiContext);
    case "facet":
        return Exhibit.UI.createFacetFromDOM(elmt, null, uiContext);
    case "coordinator":
        return Exhibit.UI.createCoordinatorFromDOM(elmt, uiContext);
    case "coder":
        return Exhibit.UI.createCoderFromDOM(elmt, uiContext);
    case "viewPanel":
        return Exhibit.ViewPanel.createFromDOM(elmt, uiContext);
    case "logo":
        return Exhibit.Logo.createFromDOM(elmt, uiContext);
    case "hiddenContent":
        elmt.style.display = "none";
        return null;
    }
    return null;
};

/**
 * @param {Object} constructor
 * @returns {Object}
 */
Exhibit.UI.generateCreationMethods = function(constructor) {
    constructor.create = function(configuration, elmt, uiContext) {
        var newContext, settings;
        newContext = Exhibit.UIContext.create(configuration, uiContext);
        settings = {};
        
        Exhibit.SettingsUtilities.collectSettings(
            configuration, 
            constructor._settingSpecs || {}, 
            settings);
            
        return new constructor(elmt, newContext, settings);
    };
    constructor.createFromDOM = function(elmt, uiContext) {
        var newContext, settings;
        newContext = Exhibit.UIContext.createFromDOM(elmt, uiContext);
        settings = {};
        
        Exhibit.SettingsUtilities.collectSettingsFromDOM(
            elmt, 
            constructor._settingSpecs || {},
            settings);
        
        return new constructor(elmt, newContext, settings);
    };
};

/**
 * @param {Object} configuration
 * @param {Element} elmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Object}
 */
Exhibit.UI.createView = function(configuration, elmt, uiContext) {
    var viewClass = configuration.hasOwnProperty("viewClass") ?
        configuration.viewClass :
        Exhibit.TileView;
    if (typeof viewClass === "string") {
        viewClass = Exhibit.UI.viewClassNameToViewClass(viewClass);
    }
    return viewClass.create(configuration, elmt, uiContext);
};

/**
 * @param {Element} elmt
 * @param {Element} container
 * @param {Exhibit.UIContext} uiContext
 * @returns {Object}
 */
Exhibit.UI.createViewFromDOM = function(elmt, container, uiContext) {
    var viewClass = Exhibit.UI.viewClassNameToViewClass(Exhibit.getAttribute(elmt, "viewClass"));
    return viewClass.createFromDOM(elmt, container, uiContext);
};

/**
 * @param {String} name
 * @returns {Object}
 */
Exhibit.UI.viewClassNameToViewClass = function(name) {
    if (name !== null && name.length > 0) {
        try {
            return Exhibit.UI._stringToObject(name, "View");
        } catch (e) {
            Exhibit.Debug.warn("Unknown viewClass " + name);
        }
    }
    return Exhibit.TileView;
};

/**
 * @param {Object} configuration
 * @param {Element} elmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Object}
 */
Exhibit.UI.createFacet = function(configuration, elmt, uiContext) {
    var facetClass = configuration.hasOwnProperty("facetClass") ?
        configuration.facetClass :
        Exhibit.ListFacet;
    if (typeof facetClass === "string") {
        facetClass = Exhibit.UI.facetClassNameToFacetClass(facetClass);
    }
    return facetClass.create(configuration, elmt, uiContext);
};

/**
 * @param {Element} elmt
 * @param {Element} container
 * @param {Exhibit.UIContext} uiContext
 * @returns {Object}
 */
Exhibit.UI.createFacetFromDOM = function(elmt, container, uiContext) {
    var facetClass = Exhibit.UI.facetClassNameToFacetClass(Exhibit.getAttribute(elmt, "facetClass"));
    return facetClass.createFromDOM(elmt, container, uiContext);
};

/**
 * @param {String} name
 * @returns {Object
 */
Exhibit.UI.facetClassNameToFacetClass = function(name) {
    if (name !== null && name.length > 0) {
        try {
            return Exhibit.UI._stringToObject(name, "Facet");
        } catch (e) {
            Exhibit.Debug.warn("Unknown facetClass " + name);
        }
    }
    return Exhibit.ListFacet;
};

/**
 * @param {Object} configuration
 * @param {Exhibit.UIContext} uiContext
 * @returns {Object}
 */
Exhibit.UI.createCoder = function(configuration, uiContext) {
    var coderClass = configuration.hasOwnProperty("coderClass") ?
        configuration.coderClass :
        Exhibit.ColorCoder;
    if (typeof coderClass === "string") {
        coderClass = Exhibit.UI.coderClassNameToCoderClass(coderClass);
    }
    return coderClass.create(configuration, uiContext);
};

/**
 * @param {Element} elmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Object}
 */
Exhibit.UI.createCoderFromDOM = function(elmt, uiContext) {
    var coderClass = Exhibit.UI.coderClassNameToCoderClass(Exhibit.getAttribute(elmt, "coderClass"));
    return coderClass.createFromDOM(elmt, uiContext);
};

/**
 * @param {String} name
 * @returns {Object}
 */
Exhibit.UI.coderClassNameToCoderClass = function(name) {
    if (name !== null && name.length > 0) {
        try {
            return Exhibit.UI._stringToObject(name, "Coder");
        } catch (e) {
            Exhibit.Debug.warn("Unknown coderClass " + name);
        }
    }
    return Exhibit.ColorCoder;
};

/**
 * @param {Object} configuration
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.Coordinator}
 */
Exhibit.UI.createCoordinator = function(configuration, uiContext) {
    return Exhibit.Coordinator.create(configuration, uiContext);
};

/**
 * @param {Element} elmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.Coordinator}
 */
Exhibit.UI.createCoordinatorFromDOM = function(elmt, uiContext) {
    return Exhibit.Coordinator.createFromDOM(elmt, uiContext);
};

/**
 * @private
 * @param {String} name
 * @param {String} suffix
 * @returns {Object}
 * @throws {Error}
 */
Exhibit.UI._stringToObject = function(name, suffix) {
    if (!name.startsWith("Exhibit.")) {
        if (!name.endsWith(suffix)) {
            try {
                return eval("Exhibit." + name + suffix);
            } catch (ex1) {
                // ignore
            }
        }
        
        try {
            return eval("Exhibit." + name);
        } catch (ex2) {
            // ignore
        }
    }
    
    if (!name.endsWith(suffix)) {
        try {
            return eval(name + suffix);
        } catch (ex3) {
            // ignore
        }
    }
    
    try {
        return eval(name);
    } catch (ex4) {
        // ignore
    }
    
    throw new Error("Unknown class " + name);
};

/*----------------------------------------------------------------------
 *  Help and Debugging
 *----------------------------------------------------------------------
 */

/**
 * @static
 * @param {String} message
 * @param {String} url
 * @param {String} target
 */
Exhibit.UI.showHelp = function(message, url, target) {
    target = (target) ? target : "_blank";
    if (url !== null) {
        if (window.confirm(message + "\n\n" + Exhibit.l10n.showDocumentationMessage)) {
            window.open(url, target);
        }
    } else {
        window.alert(message);
    }
};

/**
 * @static
 * @param {String} message
 * @param {String} expression
 */
Exhibit.UI.showJavascriptExpressionValidation = function(message, expression) {
    var target = "_blank";
    if (window.confirm(message + "\n\n" + Exhibit.l10n.showJavascriptValidationMessage)) {
        window.open(Exhibit.UI.validator + "?expresson=" + encodeURIComponent(expression), target);
    }
};

/**
 * @static
 * @param {String} message
 * @param {String} url
 */
Exhibit.UI.showJsonFileValidation = function(message, url) {
    var target = "_blank";
    if (url.indexOf("file:") === 0) {
        if (window.confirm(message + "\n\n" + Exhibit.l10n.showJsonValidationFormMessage)) {
            window.open(Exhibit.UI.validator, target);
        }
    } else {
        if (window.confirm(message + "\n\n" + Exhibit.l10n.showJsonValidationMessage)) {
            window.open(Exhibit.UI.validator + "?url=" + url, target);
        }
    }
};

/*----------------------------------------------------------------------
 *  Status Indication and Feedback
 *----------------------------------------------------------------------
 */
Exhibit.UI._busyIndicator = null;
Exhibit.UI._busyIndicatorCount = 0;

/**
 * @static
 */
Exhibit.UI.showBusyIndicator = function() {
    var scrollTop, height, top;

    Exhibit.UI._busyIndicatorCount++;
    if (Exhibit.UI._busyIndicatorCount > 1) {
        return;
    }
    
    if (Exhibit.UI._busyIndicator === null) {
        Exhibit.UI._busyIndicator = Exhibit.UI.createBusyIndicator();
    }
    
    scrollTop = document.body.hasOwnProperty("scrollTop") ?
        document.body.scrollTop :
        document.body.parentNode.scrollTop;
    height = window.hasOwnProperty("innerHeight") ?
        window.innerHeight :
        (document.body.hasOwnProperty("clientHeight") ?
            document.body.clientHeight :
            document.body.parentNode.clientHeight);
        
    top = Math.floor(scrollTop + height / 3);
    
    Exhibit.UI._busyIndicator.style.top = top + "px";
    document.body.appendChild(Exhibit.UI._busyIndicator);
};

/**
 * @static
 */
Exhibit.UI.hideBusyIndicator = function() {
    Exhibit.UI._busyIndicatorCount--;
    if (Exhibit.UI._busyIndicatorCount > 0) {
        return;
    }
    
    try {
        document.body.removeChild(Exhibit.UI._busyIndicator);
    } catch(e) {
        // silent
    }
};

/*----------------------------------------------------------------------
 *  Common UI Generation
 *----------------------------------------------------------------------
 */

/**
 * @static
 * @param {Element|jQuery} elmt
 */
Exhibit.UI.protectUI = function(elmt) {
    $(elmt).addClass("exhibit-ui-protection");
};

/**
 * @static
 * @param {String} text
 * @param {Function} handler
 * @returns {jQuery}
 */
Exhibit.UI.makeActionLink = function(text, handler) {
    var a, handler2;

    a = $("<a>" + text + "</a>").
        attr("href", "#").
        addClass("exhibit-action");
    
    handler2 = function(event) {
        if (typeof $(this).attr("disabled") === "undefined") {
            handler(event);
        }
    };

    a.bind("click", handler2);
    
    return a;
};

/**
 * @static
 * @param {Element} a
 * @param {Boolean} enabled
 */
Exhibit.UI.enableActionLink = function(a, enabled) {
    if (enabled) {
        $(a).removeAttr("disabled");
        $(a).addClass("exhibit-action").removeClass("exhibit-action-disabled");
    } else {
        $(a).attr("disabled", true);
        $(a).removeClass("exhibit-action").addClass("exhibit-action-disabled");
    }
};

/**
 * @static
 * @param {String} itemID
 * @param {String} label
 * @param {Exhibit.UIContext} uiContext
 * @returns {jQuery}
 */
Exhibit.UI.makeItemSpan = function(itemID, label, uiContext) {
    var database, a, handler;

    database = uiContext.getDatabase();

    if (label === null) {
        label = database.getObject(itemID, "label");
        if (label === null) {
            label = itemID;
        }
    }
    
    a = $("<a>" + label + "</a>").
        attr("href", Exhibit.Persistence.getItemLink(itemID)).
        addClass("exhibit-item");
        
    handler = function(event) {
        Exhibit.UI.showItemInPopup(itemID, this, uiContext);
    };

    a.bind("click", handler);

    return a;
};

/**
 * @static
 * @param {String} label
 * @param {String} valueType
 * @param {Object} layer
 */
Exhibit.UI.makeValueSpan = function(label, valueType, layer) {
    var span, url;

    span = $("<span></span>").addClass("exhibit-value")
;
    if (valueType === "url") {
        url = label;
        if (Exhibit.params.safe && url.trim().startsWith("javascript:")) {
            span.text(url);
        } else {
            span.html("<a href=\"" + url + "\" target=\"_blank\">" +
                      (label.length > 50 ? 
                       label.substr(0, 20) + " ... " + label.substr(label.length - 20) :
                       label) +
                      "</a>");
        }
    } else {
        if (Exhibit.params.safe) {
            label = Exhibit.Formatter.encodeAngleBrackets(label);
        }
        span.html(label);
    }
    return span;
};

/**
 * @static
 * @param {Element} elmt
 */
Exhibit.UI.calculatePopupPosition = function(elmt) {
    coords = $(elmt).offset();
    return {
        x: coords.left + Math.round($(elmt).outerWidth() / 2),
        y: coords.top + Math.round($(elmt).outerHeight() / 2)
    };
};

/**
 * @@@
 * @static
 * @param {String} itemID
 * @param {Element} elmt
 * @param {Exhibit.UIContext} uiContext
 * @param {Object} opts
 */
Exhibit.UI.showItemInPopup = function(itemID, elmt, uiContext, opts) {
    var itemLensDiv, lensOpts;

    SimileAjax.WindowManager.popAllLayers();
    
    opts = opts || {};
    opts.coords = opts.coords || Exhibit.UI.calculatePopupPosition(elmt);
    
    itemLensDiv = $("<div></div>");

    lensOpts = {
        inPopup: true,
        coords: opts.coords
    };

    if (opts.lensType === "normal") {
        lensOpts.lensTemplate = uiContext.getLensRegistry().getNormalLens(itemID, uiContext);
    } else if (opts.lensType === "edit") {
        lensOpts.lensTemplate = uiContext.getLensRegistry().getEditLens(itemID, uiContext);
    } else if (opts.lensType) {
        Exhibit.Debug.warn("Unknown Exhibit.UI.showItemInPopup opts.lensType: " + opts.lensType);
    }

    uiContext.getLensRegistry().createLens(itemID, itemLensDiv, uiContext, lensOpts);
    
    SimileAjax.Graphics.createBubbleForContentAndPoint(
        itemLensDiv, 
        opts.coords.x,
        opts.coords.y, 
        uiContext.getSetting("bubbleWidth")
    );
};

/**
 * @static
 * @param {String} name
 * @param {Function} handler
 * @param {String} className
 * @returns {Element}
 */
Exhibit.UI.createButton = function(name, handler, className) {
    var button = $("<button></button>").
        html(name).
        addClass((className || "exhibit-button")).
        addClass("screen");
    button.bind("click", handler);
    return button;
};

/**
 * @@@
 * @static
 * @param {Element} element
 * @returns {Object}
 */
Exhibit.UI.createPopupMenuDom = function(element) {
    var div, dom;

    div = $("<div></div>").addClass("exhibit-menu-popup").
        addClass("exhibit-ui-protection");
    
    dom = {
        elmt: div,
        close: function() {
            document.body.removeChild(this.elmt);
        },
        open: function() {
            var self, docWidth, docHeight, coords;
            self = this;
            this.layer = SimileAjax.WindowManager.pushLayer(function() { self.close(); }, true, div);
                
            docWidth = document.body.offsetWidth;
            docHeight = document.body.offsetHeight;
        
            coords = SimileAjax.DOM.getPageCoordinates(element);
            div.style.top = (coords.top + element.scrollHeight) + "px";
            div.style.right = (docWidth - (coords.left + element.scrollWidth)) + "px";
        
            document.body.appendChild(this.elmt);
        },
        appendMenuItem: function(label, icon, onClick) {
            var self, a, div;
            self = this;
            a = document.createElement("a");
            a.className = "exhibit-menu-item";
            a.href = "#";
            SimileAjax.WindowManager.registerEvent(a, "click", function(elmt, evt, target) {
                onClick(elmt, evt, target);
                SimileAjax.WindowManager.popLayer(self.layer);
                SimileAjax.DOM.cancelEvent(evt);
                return false;
            });
            
            div = document.createElement("div");
            a.appendChild(div);
    
            div.appendChild(SimileAjax.Graphics.createTranslucentImage(
                icon !== null ? icon : (Exhibit.urlPrefix + "images/blank-16x16.png")));
                
            div.appendChild(document.createTextNode(label));
            
            this.elmt.appendChild(a);
        },
        appendSeparator: function() {
            var hr = document.createElement("hr");
            this.elmt.appendChild(hr);
        }
    };
    return dom;
};

/**
 * @@@
 * @static
 * @returns {Element}
 */
Exhibit.UI.createBusyIndicator = function() {
    var urlPrefix, containerDiv, topDiv, topRightDiv, middleDiv, middleRightDiv, contentDiv, bottomDiv, bottomRightDiv, img;
    urlPrefix = Exhibit.urlPrefix + "images/";
    containerDiv = document.createElement("div");
    if (SimileAjax.Graphics.pngIsTranslucent) {
        
        topDiv = document.createElement("div");
        topDiv.style.height = "33px";
        topDiv.style.background = "url(" + urlPrefix + "message-bubble/message-top-left.png) top left no-repeat";
        topDiv.style.paddingLeft = "44px";
        containerDiv.appendChild(topDiv);
        
        topRightDiv = document.createElement("div");
        topRightDiv.style.height = "33px";
        topRightDiv.style.background = "url(" + urlPrefix + "message-bubble/message-top-right.png) top right no-repeat";
        topDiv.appendChild(topRightDiv);
        
        middleDiv = document.createElement("div");
        middleDiv.style.background = "url(" + urlPrefix + "message-bubble/message-left.png) top left repeat-y";
        middleDiv.style.paddingLeft = "44px";
        containerDiv.appendChild(middleDiv);
        
        middleRightDiv = document.createElement("div");
        middleRightDiv.style.background = "url(" + urlPrefix + "message-bubble/message-right.png) top right repeat-y";
        middleRightDiv.style.paddingRight = "44px";
        middleDiv.appendChild(middleRightDiv);
        
        contentDiv = document.createElement("div");
        middleRightDiv.appendChild(contentDiv);
        
        bottomDiv = document.createElement("div");
        bottomDiv.style.height = "55px";
        bottomDiv.style.background = "url(" + urlPrefix + "message-bubble/message-bottom-left.png) bottom left no-repeat";
        bottomDiv.style.paddingLeft = "44px";
        containerDiv.appendChild(bottomDiv);
        
        bottomRightDiv = document.createElement("div");
        bottomRightDiv.style.height = "55px";
        bottomRightDiv.style.background = "url(" + urlPrefix + "message-bubble/message-bottom-right.png) bottom right no-repeat";
        bottomDiv.appendChild(bottomRightDiv);
    } else {
        containerDiv.style.border = "2px solid #7777AA";
        containerDiv.style.padding = "20px";
        containerDiv.style.background = "white";
        SimileAjax.Graphics.setOpacity(containerDiv, 90);
        
        contentDiv = document.createElement("div");
        containerDiv.appendChild(contentDiv);
    }
    
    containerDiv.className = "exhibit-busyIndicator";
    contentDiv.className = "exhibit-busyIndicator-content";
    
    img = document.createElement("img");
    img.src = urlPrefix + "progress-running.gif";
    contentDiv.appendChild(img);
    contentDiv.appendChild(document.createTextNode(" " + Exhibit.l10n.busyIndicatorMessage));
    
    return containerDiv;
};

/**
 * @@@
 * @static
 * @param {String} itemID
 * @param {Exhibit} exhibit
 * @param {Object} configuration
 * @returns {Object}
 */
Exhibit.UI.createFocusDialogBox = function(itemID, exhibit, configuration) {
    var template, dom;
    template = {
        tag:        "div",
        className:  "exhibit-focusDialog exhibit-ui-protection",
        children: [
            {   tag:        "div",
                className:  "exhibit-focusDialog-viewContainer",
                field:      "viewContainer"
            },
            {   tag:        "div",
                className:  "exhibit-focusDialog-controls",
                children: [
                    {   tag:        "button",
                        field:      "closeButton",
                        children:    [ Exhibit.l10n.focusDialogBoxCloseButtonLabel ]
                    }
                ]
            }
        ]
    };
    dom = SimileAjax.DOM.createDOMFromTemplate(template);
    dom.close = function() {
        document.body.removeChild(dom.elmt);
    };
    dom.open = function() {
        var lens;
        dom.layer = SimileAjax.WindowManager.pushLayer(function() { dom.close(); }, false);
        lens = new Exhibit.Lens(itemID, dom.viewContainer, exhibit, configuration);
        
        dom.elmt.style.top = (document.body.scrollTop + 100) + "px";
        document.body.appendChild(dom.elmt);
        
        SimileAjax.WindowManager.registerEvent(
            dom.closeButton, 
            "click", 
            function(elmt, evt, target) {
                SimileAjax.WindowManager.popLayer(dom.layer);
                SimileAjax.DOM.cancelEvent(evt);
                return false;
            }, 
            dom.layer
        );
    };
    
    return dom;
};

/**
 * @@@
 * @static
 * @param {String} relativeUrl
 * @param {String} verticalAlign
 * @returns {}
 */
Exhibit.UI.createTranslucentImage = function(relativeUrl, verticalAlign) {
    return SimileAjax.Graphics.createTranslucentImage(Exhibit.urlPrefix + relativeUrl, verticalAlign);
};

/**
 * @@@
 * @static
 * @param {String} relativeUrl
 * @param {String} verticalAlign
 * @returns {}
 */
Exhibit.UI.createTranslucentImageHTML = function(relativeUrl, verticalAlign) {
    return SimileAjax.Graphics.createTranslucentImageHTML(Exhibit.urlPrefix + relativeUrl, verticalAlign);
};
