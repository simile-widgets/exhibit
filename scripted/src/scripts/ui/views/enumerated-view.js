/**
 * @fileOverview View functions for Thumbnail and Tile view. 
 * @author Tochukwu Okoro
 */

/**
 * @constructor
 */
Exhibit.EnumeratedView = function() {}

/**
 *
 */
Exhibit.EnumeratedView.prototype._initializeUI = function() {
    var self, template;

    self = this;
    
    Exhibit.jQuery(this.getContainer()).empty();
    self._initializeViewUI(function() {
        return Exhibit.jQuery(self._dom.bodyDiv).html();
    });

    template = {
        elmt: this.getContainer(),
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
    this._dom = Exhibit.jQuery.simileDOM("template", template);
    this._orderedViewFrame._divHeader = this._dom.headerDiv;
    this._orderedViewFrame._divFooter = this._dom.footerDiv;
    this._orderedViewFrame._generatedContentElmtRetriever = function() {
        return self._dom.bodyDiv;
    };
    this._orderedViewFrame.initializeUI();

    Exhibit.View.addViewState(
        this.getID(),
        this.exportState()
    );

    this._reconstruct();
};

/**
 * @returns {Object}
 */
Exhibit.EnumeratedView.prototype.makeState = function() {
    return {};
};

/**
 * @param {String} sub
 * @param {Object} state
 * @returns {Object}
 */
Exhibit.EnumeratedView.prototype.makeStateWithSub = function(sub, state) {
    var original;
    original = this.makeState();
    original[sub] = state;
    return original;
};

/**
 * @param {Object} state
 * @returns {Object}
 */
Exhibit.EnumeratedView.prototype.exportState = function(state) {
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
Exhibit.EnumeratedView.prototype.importState = function(state) {
    if (this._orderedViewFrame !== null && this.stateDiffers(state)) {
        this._orderedViewFrame.importState(state.orderedViewFrame);
    }
};

/**
 * @param {Object} state
 * @param {Object} state.orderedViewFrame
 * @returns {Boolean}
 */
Exhibit.EnumeratedView.prototype.stateDiffers = function(state) {
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
Exhibit.EnumeratedView.constructGroup = function(groupLevel, label) {
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
    return Exhibit.jQuery.simileDOM("template", template);
};

/**
 * Handles the construction of the display for new items and also group
 * of items for Tile View and Thumbnail View less than two columns. 
 */
Exhibit.EnumeratedView.prototype._construct = function() {
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
            Exhibit.jQuery(state.groupDoms[i].countSpan).html(state.groupCounts[i]);
        }
        state.groupDoms = state.groupDoms.slice(0, groupLevel);
        state.groupCounts = state.groupCounts.slice(0, groupLevel);

        if (groupLevel > 0 && groupLevel <= state.groupDoms.length) {
            state.div = state.groupDoms[groupLevel - 1].contentDiv;
        } else {
            state.div = view._dom.bodyDiv;
        }
        state.contents = null;
    };


    this._orderedViewFrame.onNewGroup = function(groupSortKey, keyType, groupLevel) {
        closeGroups(groupLevel);

        var groupDom = Exhibit.EnumeratedView.constructGroup(groupLevel, groupSortKey);

        Exhibit.jQuery(state.div).append(groupDom.elmt);
        state.div = groupDom.contentDiv;

        state.groupDoms.push(groupDom);
        state.groupCounts.push(0);
    };

    this._orderedViewFrame.onNewItem = function(itemID, index) {
        var i, itemLensItem, itemLens;
        if (typeof state.contents === "undefined" || state.contents === null) {
            state.contents = view.constructItemContainer();
            Exhibit.jQuery(state.div).append(state.contents);
        }

        for (i = 0; i < state.groupCounts.length; i++) {
            state.groupCounts[i]++;
        }

        itemLensItem = Exhibit.jQuery("<li>");
        itemLensItem.attr("class", view._itemContainerClass);

        if (view._lensRegistry){
            itemLens = view._lensRegistry.createLens(itemID, itemLensItem, view.getUIContext());   
        } else {
            itemLens = view.getUIContext().getLensRegistry().createLens(itemID, itemLensItem, view.getUIContext());
        }
          
        state.contents.append(itemLensItem);
    };

    Exhibit.jQuery(this.getContainer()).hide();

    Exhibit.jQuery(this._dom.bodyDiv).empty();
    this._orderedViewFrame.reconstruct();
    closeGroups(0);

    Exhibit.jQuery(this.getContainer()).show();
};

/**
 *
 */
Exhibit.EnumeratedView.prototype.dispose = function() {
    var view = this;
    Exhibit.jQuery(this.getUIContext().getCollection().getElement()).unbind(
        "onItemsChanged.exhibit",
        view._onItemsChanged
    );

    this._orderedViewFrame.dispose();
    this._orderedViewFrame = null;
    this._dom = null;

    this._dispose();
};

