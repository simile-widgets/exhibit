/**
 * @fileOverview Thumbnail view functions and UI.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 * @author <a href="mailto:axel@pike.org">Axel Hecht</a>
 */

/**
 * @constructor
 * @class
 * @param {Element} containerElement
 * @param {Exhibit.UIContext} uiContext
 */ 
Exhibit.ThumbnailView = function(containerElmt, uiContext) {
    var view = this;
    Exhibit.jQuery.extend(this, new Exhibit.View(
        "thumbnail",
        containerElmt,
        uiContext
    ));
    this.addSettingSpecs(Exhibit.ThumbnailView._settingSpecs);

    this._onItemsChanged = function() {
        // @@@this will ignore the stored state, which is odd
        // it should probably replace the state after doing this - 
        // or forget it since this will always ignore the stored state,
        // correctly
        view._orderedViewFrame._settings.page = 0;
        view._reconstruct();
    };
    Exhibit.jQuery(uiContext.getCollection().getElement()).bind(
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
            Exhibit.View.getRegistryKey(),
            view.exportState(view.makeStateWithSub(child, state)),
            title,
            true
        );
    };

    this.register();
};

Exhibit.ThumbnailView.prototype = new Exhibit.EnumeratedView();
/**
 * @constant
 */
Exhibit.ThumbnailView._settingSpecs = {
    "columnCount":          { type: "int", defaultValue: -1 }
};

/**
 * Constant leftover from a now unnecessary IE hack.
 * @constant
 */
Exhibit.ThumbnailView.prototype._itemContainerClass = "exhibit-thumbnailView-itemContainer";

/**
 * @param {Object} configuration
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.ThumbnailView}
 */
Exhibit.ThumbnailView.create = function(configuration, containerElmt, uiContext) {
    var view = new Exhibit.ThumbnailView(
        containerElmt,
        Exhibit.UIContext.create(configuration, uiContext, true)
    );

    view._lensRegistry = Exhibit.UIContext.createLensRegistry(
        configuration,
        uiContext.getLensRegistry()
    );

    Exhibit.SettingsUtilities.collectSettings(
        configuration,
        view.getSettingSpecs(),
        view._settings
    );

    view._orderedViewFrame.configure(configuration);

    view._initializeUI();
    return view;
};

/**
 * @param {Element} configElmt
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.ThumbnailView}
 */
Exhibit.ThumbnailView.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var configuration, view;
    configuration = Exhibit.getConfigurationFromDOM(configElmt);
    view = new Exhibit.ThumbnailView(
        typeof containerElmt !== "undefined" && containerElmt !== null ?
            containerElmt :
            configElmt,
        Exhibit.UIContext.createFromDOM(configElmt, uiContext, true)
    );

    view._lensRegistry = Exhibit.UIContext.createLensRegistryFromDOM(
        configElmt,
        configuration,
        uiContext.getLensRegistry()
    );

    Exhibit.SettingsUtilities.collectSettingsFromDOM(
        configElmt,
        view.getSettingSpecs(),
        view._settings
    );
    Exhibit.SettingsUtilities.collectSettings(
        configuration,
        view.getSettingSpecs(),
        view._settings
    );

    view._orderedViewFrame.configureFromDOM(configElmt);
    view._orderedViewFrame.configure(configuration);

    view._initializeUI();
    return view;
};

Exhibit.ThumbnailView.prototype._reconstructWithTable = function() {
    var view, state, closeGroups;
    view = this;
    state = {
        div:            this._dom.bodyDiv,
        groupDoms:      [],
        groupCounts:    [],
        table:          null,
        columnIndex:    0
    };

    closeGroups = function(groupLevel) {
        var i;
        for (i = groupLevel; i < state.groupDoms.length; i++) {
            Exhibit.jQuery(state.groupDoms[i].countSpan).html(state.groupCounts[i]);
        }
        state.groupDoms = state.groupDoms.slice(0, groupLevel);
        state.groupCounts = state.groupCounts.slice(0, groupLevel);

        if (groupLevel > 0 && groupLevel <= state.groupDoms.length) {
            state.div = state.groupDoms[groupLevel - 1].contentDiv;
        } else {
            state.div = view._dom.bodyDiv;
        }
        state.itemContainer = null;
        state.table = null;
        state.columnIndex = 0;
    };

    this._orderedViewFrame.onNewGroup = function(groupSortKey, keyType, groupLevel) {
        closeGroups(groupLevel);

        var groupDom = Exhibit.ThumbnailView.constructGroup(
            groupLevel,
            groupSortKey
        );

        Exhibit.jQuery(state.div).append(groupDom.elmt);
        state.div = groupDom.contentDiv;

        state.groupDoms.push(groupDom);
        state.groupCounts.push(0);
    };

    this._orderedViewFrame.onNewItem = function(itemID, index) {
        var i, td, itemLensDiv, ItemLens;

        if (state.columnIndex >= view._settings.columnCount) {
            state.columnIndex = 0;
        }

        if (typeof state.table === "undefined" || state.table === null) {
            state.table = Exhibit.ThumbnailView.constructTableItemContainer();
            Exhibit.jQuery(state.div).append(state.table);
        }

        // one could jQuerify this with just append, but it seems less
        // precise than this DOM-based method
        if (state.columnIndex === 0) {
            state.table.insertRow(state.table.rows.length);
        }
        td = state.table.rows[state.table.rows.length - 1].insertCell(state.columnIndex++);

        for (i = 0; i < state.groupCounts.length; i++) {
            state.groupCounts[i]++;
        }

        itemLensDiv = Exhibit.jQuery("<div>");
        itemLensDiv.attr("class", Exhibit.ThumbnailView._itemContainerClass);

        itemLens = view._lensRegistry.createLens(itemID, itemLensDiv, view.getUIContext());
        Exhibit.jQuery(td).append(itemLensDiv);
    };

    Exhibit.jQuery(this.getContainer()).hide();

    Exhibit.jQuery(this._dom.bodyDiv).empty();
    this._orderedViewFrame.reconstruct();
    closeGroups(0);

    Exhibit.jQuery(this.getContainer()).show();
};


/**
 * @returns {jQuery}
 */
Exhibit.ThumbnailView.prototype.constructItemContainer = function() {
    return Exhibit.jQuery("<ol>").addClass("exhibit-thumbnailView-body");
};
    
/**
 * @returns table element
 */
Exhibit.ThumbnailView.constructTableItemContainer = function() {
    var table = Exhibit.jQuery("<table>");
    table.addClass("exhibit-thumbnailView-body");
    return table.get(0);
};
