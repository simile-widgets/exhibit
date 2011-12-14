/**
 * @fileOverview Tile view functions and UI.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @constructor
 * @class
 * @param {Element} containerElement
 * @param {Exhibit.UIContext} uiContext
 */ 
Exhibit.TileView = function(containerElmt, uiContext) {
    this._div = containerElmt;
    this._uiContext = uiContext;
    this._settings = {};

    this._id = null;
    this._registered = false;
    this._label = null;
    this._viewPanel = null;
    
    var view = this;

    this._onItemsChanged = function() {
        // @@@this will ignore the stored state, which is odd
        // it should probably replace the state after doing this - 
        // or forget it since this will always ignore the stored state,
        // correctly
        view._orderedViewFrame._settings.page = 0;
        view._reconstruct();
    };
    $(uiContext.getCollection().getElement()).bind(
        "onItemsChanged.exhibit",
        view._onItemsChanged
    );

    this._orderedViewFrame = new Exhibit.OrderedViewFrame(uiContext);
    this._orderedViewFrame.parentReconstruct = function() {
        view._reconstruct();
    };
    this._orderedViewFrame.parentHistoryAction = function(child, state, title) {
        Exhibit.History.pushComponentState(
            view,
            Exhibit.View._registryKey,
            view.exportState(view.makeStateWithSub(child, state)),
            title,
            true
        );
    };

    this._generator = {
        "getLabel": function() {
            return view.getLabel();
        },
        "getContent": function() {
            return $(view._dom.bodyDiv).html()
        }
    };
};

/**
 * @constant
 */
Exhibit.TileView._settingSpecs = { };

/**
 * @param {Object} configuration
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.TileView}
 */
Exhibit.TileView.create = function(configuration, containerElmt, uiContext) {
    var view = new Exhibit.TileView(
        containerElmt,
        Exhibit.UIContext.create(configuration, uiContext)
    );
    
    Exhibit.SettingsUtilities.collectSettings(
        configuration, Exhibit.TileView._settingSpecs, view._settings);
        
    view._orderedViewFrame.configure(configuration);
    view._setIdentifier();

    view.register();
    view._initializeUI();
    return view;
};

/**
 * @param {Element} configElmt
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.TileView}
 */
Exhibit.TileView.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var configuration, view;
    configuration = Exhibit.getConfigurationFromDOM(configElmt);
    view = new Exhibit.TileView(
        typeof containerElmt !== "undefined" && containerElmt !== null ?
            containerElmt :
            configElmt,
        Exhibit.UIContext.createFromDOM(configElmt, uiContext)
    );
    
    Exhibit.SettingsUtilities.collectSettingsFromDOM(
        configElmt, Exhibit.TileView._settingSpecs, view._settings);
    Exhibit.SettingsUtilities.collectSettings(
        configuration, Exhibit.TileView._settingSpecs, view._settings);
    
    view._orderedViewFrame.configureFromDOM(configElmt);
    view._orderedViewFrame.configure(configuration);
    view._setIdentifier();

    view.register();
    view._initializeUI();
    return view;
};

/**
 * @param {String} label
 */
Exhibit.TileView.prototype.setLabel = function(label) {
    this._label = label;
};

/**
 * @returns {String}
 */
Exhibit.TileView.prototype.getLabel = function() {
    return this._label;
};

/**
 * @param {Exhibit.ViewPanel} panel
 */
Exhibit.TileView.prototype.setViewPanel = function(panel) {
    this._viewPanel = panel;
};

/**
 *
 */
Exhibit.TileView.prototype.dispose = function() {
    var view = this;
    $(this._uiContext.getCollection().getElement()).unbind(
        "onItemsChanged.exhibit",
        view._onItemsChanged
    );

    $(this._div).empty();

    this._viewPanel = null;
    
    this._orderedViewFrame.dispose();
    this._orderedViewFrame = null;
    this._dom = null;

    this._div = null;
    this.unregister();
    this._uiContext.dispose();
    this._uiContext = null;
};

/**
 *
 */
Exhibit.TileView.prototype.register = function() {
    this._uiContext.getExhibit().getRegistry().register(
        Exhibit.View._registryKey,
        this.getID(),
        this
    );
    $(document).trigger("addGenerator.exhibit", this.getGenerator());
    this._registered = true;
};

/**
 *
 */
Exhibit.TileView.prototype.unregister = function() {
    this._uiContext.getExhibit().getRegistry().unregister(
        Exhibit.View._registryKey,
        this.getID()
    );
    $(document).trigger("removeGenerator.exhibit", this.getGenerator());
    this._registered = false;
};

/**
 * @returns {Object}
 */
Exhibit.TileView.prototype.getGenerator = function() {
    return this._generator;
};

/**
 *
 */
Exhibit.TileView.prototype._setIdentifier = function() {
    this._id = $(this._div).attr("id");

    if (typeof this._id === "undefined" || this._id === null) {
        this._id = "tile"
            + "-"
            + this._uiContext.getCollection().getID()
            + "-"
            + this._uiContext.getExhibit().getRegistry().generateIdentifier(
                Exhibit.View._registryKey
            );
        
    }
};

/**
 * @returns {String}
 */
Exhibit.TileView.prototype.getID = function() {
    return this._id;
};

/**
 *
 */
Exhibit.TileView.prototype._initializeUI = function() {
    var self, template;

    self = this;
    
    $(this._div).empty();
    template = {
        elmt: this._div,
        children: [
            {   tag: "div",
                field: "headerDiv"
            },
            {   tag: "div",
                "class": "exhibit-collectionView-body",
                field: "bodyDiv"
            },
            {   tag: "div",
                field: "footerDiv"
            }
        ]
    };
    this._dom = $.simileDOM("template", template);
    this._orderedViewFrame._divHeader = this._dom.headerDiv;
    this._orderedViewFrame._divFooter = this._dom.footerDiv;
    this._orderedViewFrame.initializeUI();

    Exhibit.View.addViewState(
        this.getID(),
        this.exportState()
    );

    this._reconstruct();
};

/**
 *
 */
Exhibit.TileView.prototype._reconstruct = function() {
    var view, state, closeGroups, i;
    view = this;
    state = {
        div:            this._dom.bodyDiv,
        contents:       null,
        groupDoms:      [],
        groupCounts:    []
    };

    closeGroups = function(groupLevel) {
        for (i = groupLevel; i < state.groupDoms.length; i++) {
            state.groupDoms[i].countSpan.innerHTML = state.groupCounts[i];
        }
        state.groupDoms = state.groupDoms.slice(0, groupLevel);
        state.groupCounts = state.groupCounts.slice(0, groupLevel);

        if (groupLevel > 0) {
            state.div = state.groupDoms[groupLevel - 1].contentDiv;
        } else {
            state.div = view._dom.bodyDiv;
        }
        state.contents = null;
    };

    this._orderedViewFrame.onNewGroup = function(groupSortKey, keyType, groupLevel) {
        closeGroups(groupLevel);

        var groupDom = Exhibit.TileView.constructGroup(groupLevel, groupSortKey);

        state.div.appendChild(groupDom.elmt);
        state.div = groupDom.contentDiv;

        state.groupDoms.push(groupDom);
        state.groupCounts.push(0);
    };

    this._orderedViewFrame.onNewItem = function(itemID, index) {
        var i, itemLensItem, itemLens;
        if (typeof state.contents === "undefined" || state.contents === null) {
            state.contents = Exhibit.TileView.constructList();
            $(state.div).append(state.contents);
        }

        for (i = 0; i < state.groupCounts.length; i++) {
            state.groupCounts[i]++;
        }

        itemLensItem = $("<li>");
        itemLens = view._uiContext.getLensRegistry().createLens(itemID, itemLensItem, view._uiContext);
        state.contents.append(itemLensItem);
    };

    $(this._div).hide();

    $(this._dom.bodyDiv).empty();
    this._orderedViewFrame.reconstruct();
    closeGroups(0);

    $(this._div).show();
};

/**
 * @returns {Object}
 */
Exhibit.TileView.prototype.makeState = function() {
    return {};
};

/**
 * @param {String} sub
 * @param {Object} state
 * @returns {Object}
 */
Exhibit.TileView.prototype.makeStateWithSub = function(sub, state) {
    var original;
    original = this.makeState();
    original[sub] = state;
    return original;
};

/**
 * @param {Object} state
 * @returns {Object}
 */
Exhibit.TileView.prototype.exportState = function(state) {
    if (typeof state === "undefined" || state === null) {
        return this.makeStateWithSub(this._orderedViewFrame._historyKey,
                                     this._orderedViewFrame.exportState());
    } else {
        return state;
    }
};

/**
 * @param {Object} state
 * @param {Object} state.orderedViewFrame
 */
Exhibit.TileView.prototype.importState = function(state) {
    if (this._orderedViewFrame !== null && this.stateDiffers(state)) {
        this._orderedViewFrame.importState(state.orderedViewFrame);
    }
};

/**
 * @param {Object} state
 * @param {Object} state.orderedViewFrame
 * @returns {Boolean}
 */
Exhibit.TileView.prototype.stateDiffers = function(state) {
    if (typeof state.orderedViewFrame !== "undefined") {
        return this._orderedViewFrame.stateDiffers(state.orderedViewFrame);
    } else {
        return false;
    }
};

/**
 * @static
 * @param {Number} groupLevel
 * @param {String} label
 * @returns {Element}
 */
Exhibit.TileView.constructGroup = function(groupLevel, label) {
    var template = {
        tag: "div",
        "class": "exhibit-collectionView-group",
        children: [
            {   tag: "h" + (groupLevel + 1),
                children: [
                    label,
                    {   tag:        "span",
                        "class":  "exhibit-collectionView-group-count",
                        children: [
                            " (",
                            {   tag: "span",
                                field: "countSpan"
                            },
                            ")"
                        ]
                    }
                ],
                field: "header"
            },
            {   tag: "div",
                "class": "exhibit-collectionView-group-content",
                field: "contentDiv"
            }
        ]
    };
    return $.simileDOM("template", template);
};

/**
 * @returns {jQuery}
 */
Exhibit.TileView.constructList = function() {
    return $("<ol>").addClass("exhibit-tileView-body");
};
