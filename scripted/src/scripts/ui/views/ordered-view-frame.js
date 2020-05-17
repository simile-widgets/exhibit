/**
 * @fileOverview
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @constructor
 * @class
 * @param {Exhibit.UIContext} uiContext
 */ 
Exhibit.OrderedViewFrame = function(uiContext) {
    this._uiContext = uiContext;
    this._orders = null;
    this._possibleOrders = null;
    this._settings = {};

    this._historyKey = "orderedViewFrame";

    // functions to be defined by framed view
    this.parentReconstruct = null;
    this.parentHistoryAction = null;

    this._caches = {};
};

/**
 * @constant
 */
Exhibit.OrderedViewFrame._settingSpecs = {
    "showAll":                  { type: "boolean", defaultValue: false, description: "show all items", importance: 3},
    "grouped":                  { type: "boolean", defaultValue: true, description: "show items in group if they are equal in current sorting order", importance: 1},
    "showDuplicates":           { type: "boolean", defaultValue: false, description: "show duplicates of items", importance: 3},
    "abbreviatedCount":         { type: "int",     defaultValue: 10, description: "number of items to show if showAll is false", importance: 3},
    "showHeader":               { type: "boolean", defaultValue: true, description: "show header of view", importance: 2},
    "showSummary":              { type: "boolean", defaultValue: true, description: "show summary information of the view", importance: 2},
    "showControls":             { type: "boolean", defaultValue: true, description: "show controls for sorting", importance: 2},
    "showFooter":               { type: "boolean", defaultValue: true, description: "show footer of the view", importance: 2},
    "paginate":                 { type: "boolean", defaultValue: false, description: "split items among multiple pages", importance: 2.9},
    "pageSize":                 { type: "int",     defaultValue: 20, description: "number of items displayed per page", importance: 2.8},
    "pageWindow":               { type: "int",     defaultValue: 2, description: "window size of available paging controls", importance: 2.6},
    "page":                     { type: "int",     defaultValue: 0, description: "zero-based index of starting page", importance: 2.7},
    "alwaysShowPagingControls": { type: "boolean", defaultValue: false, description: "always show paging controls", importance: 2.4},
    "pagingControlLocations":   { type: "enum",    defaultValue: "topbottom",
                                  choices: [ "top", "bottom", "topbottom" ], description: "location of paging controls", importance: 2.5}
};

/**
 * @param {Object} configuration
 */
Exhibit.OrderedViewFrame.prototype.configure = function(configuration) {
    if (typeof configuration.orders !== "undefined") {
        this._orders = [];
        this._configureOrders(configuration.orders);
    }
    if (typeof configuration.possibleOrders !== "undefined") {
        this._possibleOrders = [];
        this._configurePossibleOrders(configuration.possibleOrders);
    }

    Exhibit.SettingsUtilities.collectSettings(
        configuration, Exhibit.OrderedViewFrame._settingSpecs, this._settings);
        
    this._internalValidate();
};

/**
 * @param {Element} domConfiguration
 */
Exhibit.OrderedViewFrame.prototype.configureFromDOM = function(domConfiguration) {
    var orders, directions, i, possibleOrders, possibleDirections;
    orders = Exhibit.getAttribute(domConfiguration, "orders", ",");
    if (typeof orders !== "undefined" && orders !== null && orders.length > 0) {
        this._orders = [];
        this._configureOrders(orders);
    }
    
    directions = Exhibit.getAttribute(domConfiguration, "directions", ",");
    if (typeof directions !== "undefined" && directions !== null && directions.length > 0 && this._orders !== null) {
        for (i = 0; i < directions.length && i < this._orders.length; i++) {
            this._orders[i].ascending = (directions[i].toLowerCase() !== "descending");
        }
    }
    
    possibleOrders = Exhibit.getAttribute(domConfiguration, "possibleOrders", ",");
    if (typeof possibleOrders !== "undefined" && possibleOrders !== null && possibleOrders.length > 0) {
        this._possibleOrders = [];
        this._configurePossibleOrders(possibleOrders);
    }

    possibleDirections = Exhibit.getAttribute(domConfiguration, "possibleDirections", ",");
    if (typeof possibleDirections !== "undefined" && possibleDirections !== null && possibleDirections.length > 0 && typeof this._possibleOrders !== "undefined" && this._possibleOrders !== null) {
        for (i = 0; i < possibleDirections.length && i < this._possibleOrders.length; i++) {
            this._possibleOrders[i].ascending = (possibleDirections[i].toLowerCase() !== "descending");
        }
    }
    
    Exhibit.SettingsUtilities.collectSettingsFromDOM(
        domConfiguration, Exhibit.OrderedViewFrame._settingSpecs, this._settings);
        
    this._internalValidate();
};

/**
 *
 */
Exhibit.OrderedViewFrame.prototype.dispose = function() {
    if (this._headerDom) {
        this._headerDom.dispose();
        this._headerDom = null;
    }
    if (this._footerDom) {
        this._footerDom.dispose();
        this._footerDom = null;
    }
    
    this._divHeader = null;
    this._divFooter = null;
    this._uiContext = null;
};

/**
 *
 */
Exhibit.OrderedViewFrame.prototype._internalValidate = function() {
    if (this._orders !== null && this._orders.length === 0) {
        this._orders = null;
    }
    if (this._possibleOrders !== null && this._possibleOrders.length === 0) {
        this._possibleOrders = null;
    }
    //pagination is incompatible with grouping
    //because groups may span a page, leading to confusing header counts
    if (this._settings.paginate) {
        this._settings.grouped = false;
    }
};

/**
 * @param {Array} orders
 * @param {Array} output object to receive orders
 * @param {String} error message for unparsable order expr
 * @param {Strong} error message for invalid order object
 */

Exhibit.OrderedViewFrame.prototype._internalConfigureOrders =
    function(orders, output, exprMsg, objMsg) {
    var i, order, expr, ascending, expression, path, segment;
    for (i = 0; i < orders.length; i++) {
        order = orders[i];
        ascending = true;
        expr = null;
        
        if (typeof order === "string") {
            expr = order;
        } else if (typeof order === "object") {
            expr = order.expression;
            ascending = (typeof order.ascending !== "undefined") ?
                (order.ascending) :
                true;
        }

        if (expr !== null) {
            try {
                expression = Exhibit.ExpressionParser.parse(expr);
                if (expression.isPath()) {
                    path = expression.getPath();
                    if (path.getSegmentCount() === 1) {
                        segment = path.getSegment(0);
                        output.push({
                            property:   segment.property,
                            forward:    segment.forward,
                            ascending:  ascending
                        });
                    }
                }
            } catch (e) {
                Exhibit.Debug.warn(Exhibit._(exprMsg, expr));
            }
        }  else {
            Exhibit.Debug.warn(Exhibit._(objMsg, JSON.stringify(order)));
        }
    }
};

/**
 * @param {Array} orders
 */
Exhibit.OrderedViewFrame.prototype._configureOrders = function(orders) {
    Exhibit.OrderedViewFrame.prototype
        ._internalConfigureOrders(orders, this._orders,
                                  "%orderedViewFrame.error.orderExpression",
                                  "%orderedViewFrame.error.orderObject");
};

/**
 * @param {Array} possibleOrders
 */
Exhibit.OrderedViewFrame.prototype._configurePossibleOrders = function(possibleOrders) {
    Exhibit.OrderedViewFrame.prototype
        ._internalConfigureOrders(possibleOrders, this._possibleOrders,
                                  "%orderedViewFrame.error.possibleOrderExpression", 
                                  "%orderedViewFrame.error.possibleOrderObject");
};

/**
 *
 */
Exhibit.OrderedViewFrame.prototype.initializeUI = function() {
    var self;
    self = this;
    if (this._settings.showHeader) {
        this._headerDom = Exhibit.OrderedViewFrame.createHeaderDom(
            this._uiContext,
            this._divHeader, 
            this._settings.showSummary,
            this._settings.showControls,
            function(evt) { self._openSortPopup(evt, -1); },
            function(evt) { self._toggleGroup(evt); },
            function(pageIndex) { self._gotoPage(pageIndex); }
        );
    }
    if (this._settings.showFooter) {
        this._footerDom = Exhibit.OrderedViewFrame.createFooterDom(
            this._uiContext,
            this._divFooter, 
            function(evt) { self._setShowAll(true); },
            function(evt) { self._setShowAll(false); },
            function(pageIndex) { self._gotoPage(pageIndex); }
        );
    }
};

/**
 *
 */
Exhibit.OrderedViewFrame.prototype.reconstruct = function() {
    var self, collection, database, i, originalSize, currentSize, someGroupsOccur, currentSet, orderElmts, buildOrderElmt, orders;
    self = this;
    collection = this._uiContext.getCollection();
    database = this._uiContext.getDatabase();
    
    originalSize = collection.countAllItems();
    currentSize = collection.countRestrictedItems();
    
    someGroupsOccur = false;
    if (currentSize > 0) {
        currentSet = collection.getRestrictedItems();
        
        someGroupsOccur = this._internalReconstruct(currentSet);
        
        /*
         *  Build sort controls
         */
        orderElmts = [];
        buildOrderElmt = function(order, index) {
            var property, label;
            property = database.getProperty(order.property);
            label = (typeof property !== "undefined" && property !== null) ?
                (order.forward ? property.getPluralLabel() : property.getReversePluralLabel()) :
                (order.forward ? order.property : "reverse of " + order.property);
                
            orderElmts.push(Exhibit.UI.makeActionLink(
                label,
                function(evt) {
                    self._openSortPopup(evt, index);
                }
            ));
        };
        orders = this._getOrders();
        for (i = 0; i < orders.length; i++) {
            buildOrderElmt(orders[i], i);
        }
        
        if (this._settings.showHeader && this._settings.showControls) {
            this._headerDom.setOrders(orderElmts);
            this._headerDom.enableThenByAction(orderElmts.length < this._getPossibleOrders().length);
        }
    }
    
    if (this._settings.showHeader && this._settings.showControls) {
        this._headerDom.groupOptionWidget.setChecked(this._settings.grouped);
    }

    if (this._settings.showFooter) {
        this._footerDom.setCounts(
            currentSize, 
            this._settings.abbreviatedCount, 
            this._settings.showAll, 
            !this._settings.paginate
        );
    }
};

/** 
 * @param {Exhibit.Set} allItems
 * @returns {Boolean}
 */
Exhibit.OrderedViewFrame.prototype._internalReconstruct = function(allItems) {
    var self, settings, collection, caches, database, orders, itemIndex, someGroupsOccur, createItem, createGroup, processLevel, processNonNumericLevel, processNumericLevel, totalCount, pageCount, fromIndex, toIndex, expr, i, sortTop;
    self = this;
    settings = this._settings;
    database = this._uiContext.getDatabase();
    collection = this._uiContext.getCollection();
    orders = this._getOrders();
    caches = this._caches;
    itemIndex = 0;
    
    someGroupsOccur = false;
    createItem = function(itemID) {
        if ((itemIndex >= fromIndex && itemIndex < toIndex) || (someGroupsOccur && settings.grouped)) {
            self.onNewItem(itemID, itemIndex);
        }
        itemIndex++;
    };
    createGroup = function(label, valueType, index) {
        if ((itemIndex >= fromIndex && itemIndex < toIndex) || (someGroupsOccur && settings.grouped)) {
            self.onNewGroup(label, valueType, index);
        }
    };

    //It's overkill to sort many items if you're just planning to show
    //the top 10.  This function splits the item set down to roughly
    //the intended size before sorting.
    sortTop = function(array, compare, limit) {
        var nextArray, key
        , split = function(array, key) {
            var l = array.length, out = [];
            for (i=0; i < l; i++) {
                if (compare(array[i], key) <= 0) {
                    out.push(array[i]);
                }
            }
            return out;
        }
        , nearMedian = function(array) {
            //choose middle of 3 random keys as pivot
            var k
            , key1 = array[Math.floor(Math.random()*array.length)]
            , key2 = array[Math.floor(Math.random()*array.length)]
            , key3 = array[Math.floor(Math.random()*array.length)];
            if (compare(key1, key2) > 0) {
                k = key1;
                key1 = key2;
                key2 = k;
            }
            if (compare(key2, key3) > 0) {
                k = key2;
                key2 = key3;
                key3 = k;
            }
            if (compare(key1, key2) > 0) {
                k = key1;
                key1 = key2;
                key2 = k;
            }
            return key2;
        }
        ;
        if (limit < 10) {
            //avoid small-array edge-cases;
            limit = 10;
        }
        nextArray = array;
        while (nextArray.length > limit) {
            array = nextArray;
            key = nearMedian(array);
            nextArray = split(array, key);
        }
        return array.sort(compare);
    };

    processLevel = function(items, index) {
        var order, values, valueCounts, valueType
        , expr
        , property, keys, levelGroupsOccur, k, key, keyItems, missingCount;

        order = orders[index];
        expr = order.forward ? 
            "."+order.property :
            "!"+order.property;
        if (!caches.hasOwnProperty(expr)) {
            caches[expr] = new Exhibit.FacetUtilities.Cache(
                database, collection,
                Exhibit.ExpressionParser.parse(expr)
            );
        }
        values = caches[expr].getValuesFromItems(items);
        missingCount = caches[expr].countItemsMissingValue(items);
        
        valueType = "text";
        if (order.forward) {
            property = database.getProperty(order.property);
            valueType = (typeof property !== "undefined" && property !== null) ? property.getValueType() : "text";
        } else {
            valueType = "item";
        }
        
        keys = (valueType === "item" || valueType === "text") ?
            processNonNumericLevel(items, index, values, valueType) :
            processNumericLevel(items, index, values, valueType);
        
        /** all-grouping
        levelGroupsOccur = true;
        */
        // The idea here appears to be to avoid considering a set of
        // one item a group; but this ends up producing very confusing
        // grouping with multiple ordering - a single-item set without a group
        // has no label and subsequent sibling entities (items or groups) then
        // end up appearing as children instead, depending on position
        // relative to the end of the supergroup.  A hybrid between the two
        // approaches appears to be necessary - grouping single items only
        // when multiple orderings are in play.

        // mono-grouping
        levelGroupsOccur = items.size() > 
            keys.length + ((missingCount > 0) ? 1 : 0);

        if (levelGroupsOccur) {
            someGroupsOccur = true;
        }
        // end mono-grouping

        for (k = 0; (k < keys.length && itemIndex < toIndex); k++) {
            key = keys[k];
            keyItems = keys.retrieveItems(key);
            if (keyItems.size() > 0) {
                if (levelGroupsOccur && settings.grouped) {
                    createGroup(key.display, valueType, index);
                }
                if (keyItems.size() > 1 && index < orders.length - 1) {
                    processLevel(keyItems, index+1);
                } else {
                    keyItems.visit(createItem);
                }
            }
        }

        
        if ((itemIndex < toIndex) && (missingCount > 0)) {
            items = caches[expr].getItemsMissingValue(items);
            if (levelGroupsOccur && settings.grouped) {
                createGroup(Exhibit._("%general.missingSortKey"),
                            valueType, index);
            }
            if (index < orders.length - 1) {
                processLevel(items, index+1);
            } else {
                items.visit(createItem);
            }
        }
    };
    
    processNonNumericLevel = function(items, index, values, valueType) {
        var compareKeys, k, key, vals
        , retrieveItems
        , keys = []
        , order = orders[index]
        , expr = order.forward ? "."+order.property : "!"+order.property
        , cache = caches[expr];
        
        if (valueType === "item") {
            values.visit(function(itemID) {
                var label = database.getObject(itemID, "label");
                label = (typeof label !== "undefined" && label !== null) 
                    ? label : itemID;
                keys.push({ itemID: itemID, display: label });
            });
            
            compareKeys = function(key1, key2) {
                var c = key1.display.localeCompare(key2.display);
                return c !== 0 ? c : key1.itemID.localeCompare(key2.itemID);
            };

            retrieveItems = function(key) {
                return cache.getItemsFromValues(new Exhibit.Set([key.itemID]),
                                                items);
            };
        } else { //text
            values.visit(function(value) {
                keys.push({display: value});
            });
            
            compareKeys = function(key1, key2) {
                return key1.display.localeCompare(key2.display);
            };
            retrieveItems = function(key) {
                return cache.getItemsFromValues(new Exhibit.Set([key.display]),
                                                items);
            };
        }

        if (toIndex >= totalCount/10) {
            //sorting almost everything, so use efficient native sort
            keys.sort(function(key1, key2) { 
                return (order.ascending ? 1 : -1) * compareKeys(key1, key2); 
            });
        } else {
            //sort/truncate only enough keys to produce intended output
            keys = sortTop(keys, 
                           function(key1, key2) { 
                               return (order.ascending ? 1 : -1) *
                                   compareKeys(key1, key2); 
                           },
                           toIndex);
        }
        keys.retrieveItems = function(key) {
            var keyItems = retrieveItems(key);
            if (!settings.showDuplicates) {
                items.removeSet(keyItems);
            }
            return keyItems;
        };
        return keys;
    };
    
    processNumericLevel = function(items, index, values, valueType) {
        var valueParser, key, k, v
        , keys = []
        , keyMap = {}
        , order = orders[index]
        , expr = order.forward ? "."+order.property : "!"+order.property
        , cache = caches[expr];
        
        if (valueType === "number") {
            valueParser = function(value) {
                if (typeof value === "number") {
                    return value;
                } else {
                    try {
                        return parseFloat(value);
                    } catch (e) {
                        return null;
                    }
                }
            };
        } else { //date
            valueParser = function(value) {
                if (value instanceof Date) {
                    return value.getTime();
                } else {
                    try {
                        return Exhibit.DateTime
                            .parseIso8601DateTime(value.toString()).getTime();
                    } catch (e) {
                        return null;
                    }
                }
            };
        }
        
        values.visit(function(value) {
            var sortkey, key;
            sortkey = valueParser(value);
            if (typeof sortkey !== "undefined" && sortkey !== null) {
                key = keyMap[sortkey];
                if (!key) {
                    key = { sortkey: sortkey, display: value, 
                            values: new Exhibit.Set() };
                    keyMap[sortkey] = key;
                    keys.push(key);
                }
                key.values.add(value);
            }
        });

        if (toIndex > totalCount/10) {
            //sorting almost everything, so use efficient native sort
            keys.sort(function(key1, key2) { 
                return (order.ascending ? 1 : -1) * 
                    (key1.sortkey - key2.sortkey); 
            });
        } else {
            keys = sortTop(keys, 
                           function(key1, key2) { 
                               return (order.ascending ? 1 : -1) * 
                                   (key1.sortkey - key2.sortkey); 
                           },
                           toIndex);
        }
        keys.retrieveItems = function(key) {
            var v, vals = key.values
            , keyItems = cache.getItemsFromValues(key.values, items);
            if (!settings.showDuplicates) {
                items.removeSet(keyItems);
            }
            return keyItems;
        };
            
        return keys;
    };

    totalCount = allItems.size();
    pageCount = Math.ceil(totalCount / settings.pageSize);
    fromIndex = 0;
    toIndex = settings.showAll ? totalCount : Math.min(totalCount, settings.abbreviatedCount);
    
    if (!settings.grouped && settings.paginate && (pageCount > 1 || (pageCount > 0 && settings.alwaysShowPagingControls))) {
        fromIndex = settings.page * settings.pageSize;
        toIndex = Math.min(fromIndex + settings.pageSize, totalCount);
        
        if (settings.showHeader && (settings.pagingControlLocations === "top" || settings.pagingControlLocations === "topbottom")) {
            this._headerDom.renderPageLinks(
                settings.page,
                pageCount,
                settings.pageWindow
            );
        }
        if (settings.showFooter && (settings.pagingControlLocations === "bottom" || settings.pagingControlLocations === "topbottom")) {
            this._footerDom.renderPageLinks(
                settings.page,
                pageCount,
                settings.pageWindow
            );
        }
    } else {
        if (settings.showHeader) {
            this._headerDom.hidePageLinks();
        }
        if (settings.showFooter) {
            this._footerDom.hidePageLinks();
        }
    }
    
    processLevel(allItems, 0);
    
    return someGroupsOccur;
};

/**
 * @returns {Array}
 */
Exhibit.OrderedViewFrame.prototype._getOrders = function() {
    return this._orders || [ this._getPossibleOrders()[0] ];
};

/**
 * @returns {Array}
 */
Exhibit.OrderedViewFrame.prototype._getPossibleOrders = function() {
    var possibleOrders, i, p;
    possibleOrders = null;
    if (typeof this._possibleOrders === "undefined" ||
        this._possibleOrders === null) {
        possibleOrders = this._uiContext.getDatabase().getAllProperties();
        for (i = 0; i < possibleOrders.length; i++ ) {
            p = possibleOrders[i];
            possibleOrders[i] = { ascending:true, forward:true, property:p };
        }
    } else {
        possibleOrders = [].concat(this._possibleOrders);
    }
    
    if (possibleOrders.length === 0) {
        possibleOrders.push({
            property:   "label", 
            forward:    true, 
            ascending:  true 
        });
    }
    return possibleOrders;
};

/**
 * @pararm {jQuery.Event} evt
 * @param {Number} index
 * @returns {Object}
 */
Exhibit.OrderedViewFrame.prototype._openSortPopup = function(evt, index) {
    var self, database, popupDom, i, configuredOrders, order, property, propertyLabel, valueType, sortLabels, orders, possibleOrders, possibleOrder, skip, j, existingOrder, appendOrder;
    self = this;
    database = this._uiContext.getDatabase();
    
    popupDom = Exhibit.UI.createPopupMenuDom(evt.target);

    /*
     *  Ascending/descending/remove options for the current order
     */
    configuredOrders = this._getOrders();
    if (index >= 0) {
        order = configuredOrders[index];
        property = database.getProperty(order.property);
        if (property === null) {
            Exhibit.Debug.warn(Exhibit._("%orderedViewFrame.error.noSuchPropertyOrderWarning", order.property));
        } else {
            propertyLabel = order.forward ? property.getPluralLabel() : property.getReversePluralLabel();
            valueType = order.forward ? property.getValueType() : "item";
            sortLabels = Exhibit.ViewUtilities.getSortLabels(valueType);

            popupDom.appendMenuItem(
                sortLabels.ascending, 
                Exhibit.urlPrefix +
                    (order.ascending ? "images/option-check.png" : "images/option.png"),
                order.ascending ?
                    function() {} :
                    function() {
                        self._reSort(
                            index, 
                            order.property, 
                            order.forward, 
                            true,
                            false
                        );
                    }
            );
            popupDom.appendMenuItem(
                sortLabels.descending, 
                Exhibit.urlPrefix +
                    (order.ascending ? "images/option.png" : "images/option-check.png"),
                order.ascending ?
                    function() {
                        self._reSort(
                            index, 
                            order.property, 
                            order.forward, 
                            false,
                            false
                        );
                    } :
                    function() {}
            );
            if (configuredOrders.length > 1) {
                popupDom.appendSeparator();
                popupDom.appendMenuItem(
                    Exhibit._("%orderedViewFrame.removeOrderLabel"),
                    null,
                    function() {self._removeOrder(index);}
                );
            }
        }
    }
    
    /*
     *  The remaining possible orders
     */
    orders = [];
    possibleOrders = this._getPossibleOrders();
    for (i = 0; i < possibleOrders.length; i++) {
        possibleOrder = possibleOrders[i];
        skip = false;
        for (j = (index < 0) ? configuredOrders.length - 1 : index; j >= 0; j--) {
            existingOrder = configuredOrders[j];
            if (existingOrder.property === possibleOrder.property && 
                existingOrder.forward === possibleOrder.forward) {
                skip = true;
                break;
            }
        }
        
        if (!skip) {
            property = database.getProperty(possibleOrder.property);
            if (property !== null) {
                orders.push({
                    property:   possibleOrder.property,
                    forward:    possibleOrder.forward,
                    ascending:  possibleOrder.ascending,
                    label:      possibleOrder.forward ? 
                        property.getPluralLabel() : 
                        property.getReversePluralLabel()
                });
            }
        }
    }
    
    if (orders.length > 0) {
        if (index >= 0) {
            popupDom.appendSeparator();
        }
        
        orders.sort(function(order1, order2) {
            return order1.label.localeCompare(order2.label);
        });
        
        appendOrder = function(order) {
            popupDom.appendMenuItem(
                order.label,
                null,
                function() {
                    self._reSort(
                        index, 
                        order.property, 
                        order.forward, 
                        order.ascending,
                        true
                    );
                }
            );
        };
        
        for (i = 0; i < orders.length; i++) {
            appendOrder(orders[i]);
        }
    }
    popupDom.open(evt);
};

/**
 * @param {Number} index
 * @param {String} propertyID
 * @param {Boolean} forward
 * @param {Boolean} ascending
 * @param {Number} slice
 */
Exhibit.OrderedViewFrame.prototype._reSort = function(index, propertyID, forward, ascending, slice) {
    var newOrders, property, propertyLabel, valueType, sortLabels
    , oldOrders = this._getOrders();
    index = (index < 0) ? oldOrders.length : index;
    
    newOrders = oldOrders.slice(0, index);
    newOrders.push({ property: propertyID, forward: forward, ascending: ascending });
    if (!slice) {
        newOrders = newOrders.concat(oldOrders.slice(index+1));
    }
    
    property = this._uiContext.getDatabase().getProperty(propertyID);
    propertyLabel = forward ? property.getPluralLabel() : property.getReversePluralLabel();
    valueType = forward ? property.getValueType() : "item";
    sortLabels = Exhibit.ViewUtilities.getSortLabels(valueType);

    this.parentHistoryAction(
        this._historyKey,
        this.makeState(newOrders),
        Exhibit._("%orderedViewFrame.formatSortActionTitle",
            propertyLabel,
            ascending ?
                sortLabels.ascending :
                sortLabels.descending
        )
    );
};

/**
 * @param {Number} index
 */
Exhibit.OrderedViewFrame.prototype._removeOrder = function(index) {
    var oldOrders, newOrders, order, property, propertyLabel, valueType, sortLabels;
    oldOrders = this._getOrders();
    newOrders = oldOrders.slice(0, index).concat(oldOrders.slice(index + 1));
    
    order = oldOrders[index];
    property = this._uiContext.getDatabase().getProperty(order.property);
    propertyLabel = order.forward ?
        property.getPluralLabel() :
        property.getReversePluralLabel();
    valueType = order.forward ?
        property.getValueType() :
        "item";
    sortLabels = Exhibit.ViewUtilities.getSortLabels(valueType);
    
    this.parentHistoryAction(
        this._historyKey,
        this.makeState(newOrders),
        Exhibit._("%orderedViewFrame.formatRemoveOrderActionTitle",
            propertyLabel, order.ascending ?
                sortLabels.ascending :
                sortLabels.descending)
    );
};

/**
 * @param {Boolean} showAll
 */
Exhibit.OrderedViewFrame.prototype._setShowAll = function(showAll) {
    this.parentHistoryAction(
        this._historyKey,
        this.makeState(null, showAll, null, null, null),
        Exhibit._(
            showAll ?
                "%orderedViewFrame.showAllActionTitle" :
                "%orderedViewFrame.dontShowAllActionTitle")
    );
};

/**
 *
 */
Exhibit.OrderedViewFrame.prototype._toggleGroup = function() {
    var oldGrouped;
    oldGrouped = this._settings.grouped;

    this.parentHistoryAction(
        this._historyKey,
        this.makeState(null, null, null, !oldGrouped),
        Exhibit._(
            oldGrouped ?
                "%orderedViewFrame.ungroupAsSortedActionTitle" :
                "%orderedViewFrame.groupAsSortedActionTitle")
    );
};

/**
 *
 */
Exhibit.OrderedViewFrame.prototype._toggleShowDuplicates = function() {
    var oldShowDuplicates;
    oldShowDuplicates = this._settings.showDuplicates;

    this.parentHistoryAction(
        this._historyKey,
        this.makeState(null, null, !oldShowDuplicates),
        Exhibit._(
            oldShowDuplicates ?
                "%orderedViewFrame.hideDuplicatesActionTitle" :
                "%orderedViewFrame.showDuplicatesActionTitle")
    );
};

/**
 * @param {Number} pageIndex
 */ 
Exhibit.OrderedViewFrame.prototype._gotoPage = function(pageIndex) {
    this.parentHistoryAction(
        this._historyKey,
        this.makeState(null, null, null, null, pageIndex),
        Exhibit.ViewUtilities.makePagingActionTitle(pageIndex)
    );
};

/**
 * @constant
 */
Exhibit.OrderedViewFrame.headerTemplate =
    '<div id="collectionSummaryDiv" style="display: none;"></div>' +
    '<div class="exhibit-collectionView-header-sortControls" style="display: none;" id="controlsDiv">' +
        '%1$s' + // sorting controls template
        '<span class="exhibit-collectionView-header-groupControl"> &bull; ' +
            '<a id="groupOption" class="exhibit-action"></a>' + 
        '</span>' +
    '</div>';

/**
 * @param {Exhibit.UIContext} uiContext
 * @param {Element} headerDiv
 * @param {Boolean} showSummary
 * @param {Boolean} showControls
 * @param {Function} onThenSortBy
 * @param {Function} onGroupToggle
 * @param {Function} gotoPage
 * @returns {Object}
 */
Exhibit.OrderedViewFrame.createHeaderDom = function(
    uiContext,
    headerDiv,
    showSummary,
    showControls,
    onThenSortBy,
    onGroupToggle,
    gotoPage
) {
    var template, dom;
    template = sprintf(
        Exhibit.OrderedViewFrame.headerTemplate +
            '<div class="exhibit-collectionView-pagingControls" style="display: none;" id="topPagingDiv"></div>',
        Exhibit._("%orderedViewFrame.sortingControlsTemplate"));

    dom = Exhibit.jQuery.simileDOM("string", headerDiv, template, {});
    Exhibit.jQuery(headerDiv).addClass("exhibit-collectionView-header");
    
    if (showSummary) {
        Exhibit.jQuery(dom.collectionSummaryDiv).show();
        dom.collectionSummaryWidget = Exhibit.CollectionSummaryWidget.create(
            {},
            dom.collectionSummaryDiv, 
            uiContext
        );
    }
    if (showControls) {
        Exhibit.jQuery(dom.controlsDiv).show();
        dom.groupOptionWidget = Exhibit.OptionWidget.create(
            {   label:      Exhibit._("%orderedViewFrame.groupedAsSortedOptionLabel"),
                onToggle:   onGroupToggle
            },
            dom.groupOption,
            uiContext
        );

        Exhibit.jQuery(dom.thenSortByAction).bind("click", onThenSortBy);

        dom.enableThenByAction = function(enabled) {
            Exhibit.UI.enableActionLink(dom.thenSortByAction, enabled);
        };
        dom.setOrders = function(orderElmts) {
            var addDelimiter, i;
            Exhibit.jQuery(dom.ordersSpan).empty();
            
            addDelimiter = Exhibit.Formatter.createListDelimiter(dom.ordersSpan, orderElmts.length, uiContext);
            for (i = 0; i < orderElmts.length; i++) {
                addDelimiter();
                Exhibit.jQuery(dom.ordersSpan).append(orderElmts[i]);
            }
            addDelimiter();
        };
    }
    dom.renderPageLinks = function(page, totalPage, pageWindow) {
        Exhibit.OrderedViewFrame.renderPageLinks(dom.topPagingDiv, page, totalPage, pageWindow, gotoPage);
        Exhibit.jQuery(dom.topPagingDiv).show();
    };
    dom.hidePageLinks = function() {
        Exhibit.jQuery(dom.topPagingDiv).hide();
    };
    dom.dispose = function() {
        if (typeof dom.collectionSummaryWidget !== "undefined") {
            dom.collectionSummaryWidget.dispose();
            dom.collectionSummaryWidget = null;
        }
        
        dom.groupOptionWidget.dispose();
        dom.groupOptionWidget = null;
    };
    
    return dom;
};

/**
 * @constant
 */
Exhibit.OrderedViewFrame.footerTemplate = "<div id='showAllSpan'></div>";

/**
 * @param {Exhibit.UIContext} uiContext
 * @param {Element} footerDiv
 * @param {Function} onShowAll
 * @param {Function} onDontShowAll
 * @param {Function} gotoPage
 * @returns {Object}
 */ 
Exhibit.OrderedViewFrame.createFooterDom = function(
    uiContext,
    footerDiv,
    onShowAll,
    onDontShowAll,
    gotoPage
) {
    var dom;
    
    dom = Exhibit.jQuery.simileDOM(
        "string",
        footerDiv,
        Exhibit.OrderedViewFrame.footerTemplate +
            '<div class="exhibit-collectionView-pagingControls" style="display: none;" id="bottomPagingDiv"></div>',
        {}
    );
    Exhibit.jQuery(footerDiv).addClass("exhibit-collectionView-footer");
    
    dom.setCounts = function(count, limitCount, showAll, canToggle) {
        Exhibit.jQuery(dom.showAllSpan).empty();
        if (canToggle && count > limitCount) {
            Exhibit.jQuery(dom.showAllSpan).show();
            if (showAll) {
                Exhibit.jQuery(dom.showAllSpan).append(
                    Exhibit.UI.makeActionLink(
                        Exhibit._("%orderedViewFrame.formatDontShowAll", limitCount), onDontShowAll));
            } else {
                Exhibit.jQuery(dom.showAllSpan).append(
                    Exhibit.UI.makeActionLink(
                        Exhibit._("%orderedViewFrame.formatShowAll", count), onShowAll));
            }
        }
    };
    dom.renderPageLinks = function(page, totalPage, pageWindow) {
        Exhibit.OrderedViewFrame.renderPageLinks(dom.bottomPagingDiv, page, totalPage, pageWindow, gotoPage);
        Exhibit.jQuery(dom.bottomPagingDiv).show();
        Exhibit.jQuery(dom.showAllSpan).hide();
    };
    dom.hidePageLinks = function() {
        Exhibit.jQuery(dom.bottomPagingDiv).hide();
    };
    dom.dispose = function() {};
    
    return dom;
};

/**
 * @param {Element} parentElmt
 * @param {Number} page
 * @param {Number} pageCount
 * @param {Number} pageWindow
 * @param {Function} gotoPage
 */
Exhibit.OrderedViewFrame.renderPageLinks = function(parentElmt, page, pageCount, pageWindow, gotoPage) {
    var self, renderPageLink, renderPageNumber, renderHTML, pageWindowStart, pageWindowEnd, i;
    
    Exhibit.jQuery(parentElmt).addClass("exhibit-collectionView-pagingControls");
    Exhibit.jQuery(parentElmt).empty();
    
    self = this;
    renderPageLink = function(label, index) {
        var elmt, a, handler;
        elmt = Exhibit.jQuery("<span>")
            .attr("class", "exhibit-collectionView-pagingControls-page");
        Exhibit.jQuery(parentElmt).append(elmt);
        
        a = Exhibit.jQuery("<a>")
            .html(label)
            .attr("href", "#")
            .attr("title", Exhibit.ViewUtilities.makePagingLinkTooltip(index));
        elmt.append(a);
        
        handler = function(evt) {
            gotoPage(index);
            evt.preventDefault();
            evt.stopPropagation();
        };
        a.bind("click", handler);
    };

    renderPageNumber = function(index) {
        if (index === page) {
            var elmt = Exhibit.jQuery("<span>")
                .attr("class",
                      "exhibit-collectionView-pagingControls-currentPage")
                .html(index + 1);
            
            Exhibit.jQuery(parentElmt).append(elmt);
        } else {
            renderPageLink(index + 1, index);
        }
    };
    renderHTML = function(html) {
        var elmt = Exhibit.jQuery("<span>")
            .html(html);
        
        Exhibit.jQuery(parentElmt).append(elmt);
    };
    
    if (page > 0) {
        renderPageLink(Exhibit._("%orderedViewFrame.previousPage"), page - 1);
        if (Exhibit._("%orderedViewFrame.pageSeparator").length > 0) {
            renderHTML(" ");
        }
    }
    
    pageWindowStart = 0;
    pageWindowEnd = pageCount - 1;
    
    if (page - pageWindow > 1) {
        renderPageNumber(0);
        renderHTML(Exhibit._("%orderedViewFrame.pageWindowEllipses"));
        
        pageWindowStart = page - pageWindow;
    }
    if (page + pageWindow < pageCount - 2) {
        pageWindowEnd = page + pageWindow;
    }
    
    for (i = pageWindowStart; i <= pageWindowEnd; i++) {
        if (i > pageWindowStart && Exhibit._("%orderedViewFrame.pageSeparator").length > 0) {
            renderHTML(Exhibit._("%orderedViewFrame.pageSeparator"));
        }
        renderPageNumber(i);
    }
    
    if (pageWindowEnd < pageCount - 1) {
        renderHTML(Exhibit._("%orderedViewFrame.pageWindowEllipses"));
        renderPageNumber(pageCount - 1);
    }
    
    if (page < pageCount - 1) {
        if (Exhibit._("%orderedViewFrame.pageSeparator").length > 0) {
            renderHTML(" ");
        }
        renderPageLink(Exhibit._("%orderedViewFrame.nextPage"), page + 1);
    }
};

/**
 * Sub-component of components with identifiers, does not need its
 * own identifier.
 * @param {Object} [state]
 * @returns {Object}
 */
Exhibit.OrderedViewFrame.prototype.exportState = function(state) {
    if (typeof state === "undefined" || state === null) {
        return this.makeState();
    } else {
        return state;
    }
};

/**
 * @param {Object} state
 * @param {Array} state.orders
 * @param {Boolean} state.showAll
 * @param {Boolean} state.showDuplicates
 * @param {Boolean} state.grouped
 * @param {Number} state.page
 */
Exhibit.OrderedViewFrame.prototype.importState = function(state) {
    var changed, i, currentOrders;
    changed = false;

    // too many toggles to bother with monolithic state difference checking,
    // check each in turn
    if (state.grouped !== this._settings.grouped) {
        this._settings.grouped = state.grouped;
        changed = true;
    }
    if (state.showAll !== this._settings.showAll) {
        this._settings.showAll = state.showAll;
        changed = true;
    }
    if (state.showDuplicates !== this._settings.showDuplicates) {
        this._settings.showDuplicates = state.showDuplicates;
        changed = true;
    }
    if (state.page !== this._settings.page) {
        this._settings.page = state.page;
        changed = true;
    }
    if (state.orders.length !== this._getOrders().length) {
        this._orders = state.orders;
        changed = true;
    } else {
        currentOrders = this._getOrders();
        for (i = 0; i < state.orders.length; i++) {
            if (state.orders[i].property !== currentOrders[i].property ||
                state.orders[i].ascending !== currentOrders[i].ascending ||
                state.orders[i].descending !== currentOrders[i].descending) {
                this._orders = state.orders;
                changed = true;
                break;
            }
        }
    }

    if (changed) {
        this.parentReconstruct();
    }
};

/**
 * @param {Array} orders
 * @param {Boolean} showAll
 * @param {Boolean} showDuplicates
 * @param {Boolean} grouped
 * @param {Number} page
 * @returns {Object}
 */
Exhibit.OrderedViewFrame.prototype.makeState = function(
    orders,
    showAll,
    showDuplicates,
    grouped,
    page
) {
    orders = (typeof orders !== "undefined" && orders !== null) ?
        orders :
        this._getOrders();
    showAll = (typeof showAll !== "undefined" && showAll !== null) ?
        showAll :
        this._settings.showAll;
    showDuplicates = (typeof showDuplicates !== "undefined" &&
                      showDuplicates !== null) ?
        showDuplicates :
        this._settings.showDuplicates;
    grouped = (typeof grouped !== "undefined" && grouped !== null) ?
        grouped :
        this._settings.grouped;
    page = (typeof page !== "undefined" && page !== null) ?
        page :
        this._settings.page;
    
    return {
        "orders": orders,
        "showAll": showAll,
        "showDuplicates": showDuplicates,
        "grouped": grouped,
        "page": page
    };
};

/**
 * @param {Object} state
 * @returns {Boolean}
 */
Exhibit.OrderedViewFrame.prototype.stateDiffers = function(state) {
    var differs, currentOrders, i;
    differs = false;
    differs = (state.page !== this._settings.page ||
               state.grouped !== this._settings.grouped ||
               state.showAll !== this._settings.showAll ||
               state.showDuplicates !== this._settings.showDuplicates ||
               state.orders.length !== this._getOrders().length);
    if (!differs) {
        currentOrders = this._getOrders();
        for (i = 0; i < state.orders.length; i++) {
            if (state.orders[i].property !== currentOrders[i].property ||
                state.orders[i].ascending !== currentOrders[i].ascending ||
                state.orders[i].descending !== currentOrders[i].descending) {
                differs = true;
                break;
            }
        }
    }

    return differs;
};
