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
    var view = this;
    Exhibit.jQuery.extend(this, new Exhibit.View(
        "tile",
        containerElmt,
        uiContext
    ));
    this.addSettingSpecs(Exhibit.TileView._settingSpecs);

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

Exhibit.TileView.prototype = new Exhibit.EnumeratedView();
/**
 * @constant
 */
Exhibit.TileView._settingSpecs = { };

Exhibit.TileView.prototype._itemContainerClass = "exhibit-tileView-itemContainer";

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
        configuration, view.getSettingSpecs(), view._settings);
        
    view._orderedViewFrame.configure(configuration);

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
        configElmt, view.getSettingSpecs(), view._settings);
    Exhibit.SettingsUtilities.collectSettings(
        configuration, view.getSettingSpecs(), view._settings);
    
    view._orderedViewFrame.configureFromDOM(configElmt);
    view._orderedViewFrame.configure(configuration);
    view._initializeUI();
    return view;
};

Exhibit.TileView.prototype._reconstruct = function() {
    this._construct();
}


/**
 * @returns {jQuery}
 */
Exhibit.TileView.prototype.constructItemContainer = function() {
    return Exhibit.jQuery("<ol>").addClass("exhibit-tileView-body");
};
