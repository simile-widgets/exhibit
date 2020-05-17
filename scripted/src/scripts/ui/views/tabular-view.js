/**
 * @fileOverview Tabular view methods and UI.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @constructor
 * @class
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.TabularView = function(containerElmt, uiContext) {
    var view = this;
    Exhibit.jQuery.extend(this, new Exhibit.View(
        "tabular",
        containerElmt,
        uiContext
    ));
    this.addSettingSpecs(Exhibit.TabularView._settingSpecs);
    Exhibit.jQuery.extend(this._settings, {indexMap: {} });

    this._columns = [];
    this._rowTemplate = null;
    this._dom = null;

    this._accessors = {
        getProxy : function(itemID, database, visitor) {
            visitor(itemID);
        },
    };

    this._onItemsChanged = function(evt) {
        view._settings.page = 0;
        view._reconstruct();
    };

    Exhibit.jQuery(uiContext.getCollection().getElement()).bind(
        "onItemsChanged.exhibit",
        view._onItemsChanged
    );

    this.register();
};

/**
 * @constant
 */
Exhibit.TabularView._settingSpecs = {
    "sortAscending":        { type: "boolean", defaultValue: true, description: "sort items in ascending or descending order", importance: 5},
    "sortColumn":           { type: "int",     defaultValue: 0, description: "zero-based index of column to sort", importance: 5},
    "showSummary":          { type: "boolean", defaultValue: true, description: "show summary", importance: 2},
    "border":               { type: "text",     defaultValue: "1", description: "styling for the border of a &lt;table&gt; element", importance: 2},
    "cellPadding":          { type: "int",     defaultValue: 5, description: "cell padding of a &lt;table&gt; element", importance: 2},
    "cellSpacing":          { type: "int",     defaultValue: 3, description: "cell spacing of a &lt;table&gt; element", importance: 2},
    "paginate":             { type: "boolean", defaultValue: false, description: "split items (rows) among multiple pages", importance: 2.9},
    "pageSize":             { type: "int",     defaultValue: 20, description: "number of items (rows) displayed per page", importance: 2.8},
    "pageWindow":           { type: "int",     defaultValue: 2, description: "window size of available paging controls", importance: 2.6},
    "page":                 { type: "int",     defaultValue: 0, description: "zero-based index of starting page", importance: 2.7},
    "alwaysShowPagingControls": { type: "boolean", defaultValue: false, description: "always show paging controls", importance: 2.4},
    "pagingControlLocations":   { type: "enum",    defaultValue: "topbottom", choices: [ "top", "bottom", "topbottom" ], description: "location of paging controls", importance: 2.5},
    "rowStyler":            {type: "function", defaultValue: undefined, description: "function that takes 3 arguments (item, database, tr) and is called to style each row", importance: 2},
    "tableStyler":          {type: "function", defaultValue: undefined, description: "function that takes 2 arguments (table, database) and is called to style the table", importance: 2},
    "columnLabels":         {type: "text", dimensions: "*", description: "comma separated list of labels used for the column headers, e.g., 'Name, Position'", importance: 8},
    "columnFormats":        {type: "text", description: "comma separated list of format expressions, e.g., 'list, image, date { mode: short }'", importance: 7}
};

Exhibit.TabularView._accessorSpecs = [{
    accessorName : "getProxy",
    attributeName : "proxy",
    importance: 1
}, {
    accessorName : "getColumns",
    attributeName : "columns",
    type: "text",
    expressions: true,
    dimensions: "*",
    description: "comma separated list of one or more properties",
    importance: 10
}];

/**
 * @param {Object} configuration
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.TabularView}
 */
Exhibit.TabularView.create = function(configuration, containerElmt, uiContext) {
    var view = new Exhibit.TabularView(
        containerElmt,
        Exhibit.UIContext.create(configuration, uiContext)
    );
    Exhibit.TabularView._configure(view, configuration);
    
    view._internalValidate();

    view._initializeUI();
    return view;
};

/**
 * @param {Element} configElmt
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.TabularView}
 */
Exhibit.TabularView.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var configuration, view;
    configuration = Exhibit.getConfigurationFromDOM(configElmt);
    
    uiContext = Exhibit.UIContext.createFromDOM(configElmt, uiContext);
    
    view = new Exhibit.TabularView(
        (typeof containerElmt !== "undefined" && containerElmt !== null) ?
            containerElmt : configElmt, 
        uiContext
    );
    
    Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt, view.getSettingSpecs(), view._settings);
    Exhibit.SettingsUtilities.createAccessorsFromDOM(configElmt, Exhibit.TabularView._accessorSpecs, view._accessors);

    // custom tabular row templating
    tables = Exhibit.jQuery("table", configElmt);
    if (tables.length > 0 && Exhibit.jQuery("table:eq(0) tr", configElmt).length > 0) {
        view._rowTemplate = Exhibit.Lens.compileTemplate(Exhibit.jQuery("table:eq(0) tr:eq(0)", configElmt).get(0), false, uiContext);
    }
        
    Exhibit.TabularView._configure(view, configuration);
    view._internalValidate();

    view._initializeUI();
    return view;
};

/**
 * @param {Exhibit.TabularView} view
 * @param {Object} configuration
 */
Exhibit.TabularView._configure = function(view, configuration) {
    var labels, expressions, i, expression, formats, index, startPosition, column, o, s, rowStyler, f, tableStyler;
    Exhibit.SettingsUtilities.collectSettings(configuration, Exhibit.TabularView._settingSpecs, view._settings);
    Exhibit.SettingsUtilities.createAccessors(configuration, Exhibit.TabularView._accessorSpecs, view._accessors);

    try {
        labels = view._settings.columnLabels || [];

        expressions = view._accessors.getColumns;
        if (Array.isArray(expressions)) {
            for (i = 0; i < expressions.length; i++) {
                expression = expressions[i];
                view._columns.push({
                    expression: expression,
                    uiContext:  Exhibit.UIContext.create({}, view.getUIContext(), true),
                    styler:     null,
                    label:      i < labels.length ? labels[i] : null,
                    format:     "list"
                });
            }
        }
        
        formats = view._settings.formats
        if (typeof formats !== "undefined" && formats !== null && formats.length > 0) {
            index = 0;
            startPosition = 0;
            while (index < view._columns.length && startPosition < formats.length) {
                column = view._columns[index];
                o = {};
                
                column.format = Exhibit.FormatParser.parseSeveral(column.uiContext, formats, startPosition, o);
                
                startPosition = o.index;
                while (startPosition < formats.length && " \t\r\n".indexOf(formats.charAt(startPosition)) >= 0) {
                    startPosition++;
                }
                if (startPosition < formats.length && formats.charAt(startPosition) === ",") {
                    startPosition++;
                }
                
                index++;
            }
        }
    } catch (e) {
        Exhibit.Debug.exception(e, Exhibit._("%TabularView.error.configuration"));
    }
    
    rowStyler = view._settings.rowStyler
    if (typeof rowStylerow !== "undefined" && s !== null && rowStyler.length > 0) {
        f = eval(rowStyler);
        if (typeof f === "function") {
            view._settings.rowStyler = f;
        }
    }

    tableStyler = view._settings.tableStyler;
    if (typeof tableStyler !== "undefined" && s !== null && tableStyler.length > 0) {
        f = eval(tableStyler);
        if (typeof f === "function") {
            view._settings.tableStyler = f;
        }
    }
};

/**
 *
 */
Exhibit.TabularView.prototype._internalValidate = function() {
    var database, propertyIDs, i, propertyID;
    if (this._columns.length === 0) {
        database = this.getUIContext().getDatabase();
        propertyIDs = database.getAllProperties();
        for (i = 0; i < propertyIDs.length; i++) {
            propertyID = propertyIDs[i];
            if (propertyID !== "uri") {
                this._columns.push(
                    {   expression: Exhibit.ExpressionParser.parse("." + propertyID),
                        uiContext:  Exhibit.UIContext.create({}, this.getUIContext(), true),
                        styler:     null,
                        label:      database.getProperty(propertyID).getLabel(),
                        format:     "list"
                    }
                );
            }
        }
    }
    this._settings.sortColumn = 
        Math.max(0, Math.min(this._settings.sortColumn,
                             this._columns.length - 1));
};

/**
 *
 */
Exhibit.TabularView.prototype.dispose = function() {
    Exhibit.jQuery(this.getUIContext().getCollection().getElement()).unbind(
        "onItemsChanged.exhibit",
        this._onItemsChanged
    );

    this._collectionSummaryWidget.dispose();
    this._collectionSummaryWidget = null;
    this._dom = null;

    this._dispose();
};

/**
 *
 */
Exhibit.TabularView.prototype._initializeUI = function() {
    var self = this;
    
    Exhibit.jQuery(this.getContainer()).empty();
    self._initializeViewUI(function() {
        return Exhibit.jQuery(self._dom.bodyDiv).html();
    });

    this._dom = Exhibit.TabularView.createDom(this.getContainer());
    this._collectionSummaryWidget = Exhibit.CollectionSummaryWidget.create(
        {}, 
        this._dom.collectionSummaryDiv, 
        this.getUIContext()
    );
    
    if (!this._settings.showSummary) {
        Exhibit.jQuery(this._dom.collectionSummaryDiv).hide();
    }
    
    Exhibit.View.addViewState(
        this.getID(),
        this.exportState()
    );

    this._reconstruct();
};

/**
 *
 */
Exhibit.TabularView.prototype._reconstruct = function() {
    var self, collection, database, bodyDiv, items, originalSize, currentSet, sortColumn, sorter, table, tr, createColumnHeader, i, renderItem, start, end, generatePagingControls;
    self = this;
    collection = this.getUIContext().getCollection();
    database = this.getUIContext().getDatabase();
    
    bodyDiv = this._dom.bodyDiv;
    Exhibit.jQuery(bodyDiv).empty();

    /*
     *  Get the current collection and check if it's empty
     */
    items = [];
    originalSize = collection.countAllItems();
    if (originalSize > 0) {
        currentSet = collection.getRestrictedItems();
        currentSet.visit(function(itemID) { items.push({ id: itemID, sortKey: "" }); });
    }
    
    if (items.length > 0) {
        /*
         *  Sort the items
         */
        sortColumn = this._columns[this._settings.sortColumn];
        sorter = this._createSortFunction(
            items,
            sortColumn.expression,
            this._settings.sortAscending
        );
        items.sort(
            this._stabilize(
                sorter,
                this._settings.indexMap,
                originalSize + 1
            )
        );
    
        // preserve order for next time
        for (i = 0; i < items.length; i++) {
            this._settings.indexMap[items[i].id] = i;
        }

        /*
         *  Style the table
         */
        table = Exhibit.jQuery("<table><thead></thead><tbody></tbody></table>");
        table.attr("class", "exhibit-tabularView-body");
        if (this._settings.tableStyler !== undefined) {
            this._settings.tableStyler(table.get(0), database);
        } else {
            table.attr("cellSpacing", this._settings.cellSpacing)
                .attr("cellPadding", this._settings.cellPadding)
                .attr("border", this._settings.border);
        }
        
        /*
         *  Create the column headers
         */
        tr = Exhibit.jQuery("<tr>");
        table.children('thead').prepend(tr);
        createColumnHeader = function(i) {
            var column, td;
            column = self._columns[i];
            if (typeof column.label === "undefined" || column.label === null) {
                column.label = self._getColumnLabel(column.expression);
            }

            td = Exhibit.jQuery("<th>");
            Exhibit.TabularView.createColumnHeader(
                exhibit, td.get(0), column.label, i === self._settings.sortColumn, self._settings.sortAscending,
                function(evt) {
                    self._doSort(i);
                    evt.preventDefault();
                    evt.stopPropagation();
                }
            );
            tr.append(td);
        };
        for (i = 0; i < this._columns.length; i++) {
            createColumnHeader(i);
        }

        /*
         *  Create item rows
         */
        if (this._rowTemplate !== null) {
            renderItem = function(i) {
                var item, tr;
                item = items[i];
                tr = Exhibit.Lens.constructFromLensTemplate(item.id, self._rowTemplate, table, self.getUIContext());
                
                if (self._settings.rowStyler !== undefined) {
                    self._settings.rowStyler(item.id, database, tr, i);
                }
            };
        } else {
            renderItem = function(i) {
                var item, tr, makeAppender, c, column, td, results, valueType;
                item = items[i];
                tr = Exhibit.jQuery("<tr>");
                table.append(tr);
                makeAppender = function(el) {
                    return function(elmt) {
                        Exhibit.jQuery(el).append(elmt);
                    };
                };
                for (c = 0; c < self._columns.length; c++) {
                    column = self._columns[c];
                    td = Exhibit.jQuery("<td>");
                    tr.append(td);
                    results = column.expression.evaluate(
                        { "value" : item.id }, 
                        { "value" : "item" }, 
                        "value",
                        database
                    );
                    
                    valueType = column.format === "list" ? results.valueType : column.format;
                    column.uiContext.formatList(
                        results.values, 
                        results.size,
                        valueType,
                        makeAppender(td)
                    );
                    
                    if (typeof column.styler !== "undefined" && column.styler !== null) {
                        column.styler(item.id, database, td.get(0));
                    }
                }
                
                if (self._settings.rowStyler !== undefined) {
                    self._settings.rowStyler(item.id, database, tr.get(0), i);
                }
            };
        }
        generatePagingControls = false;
        if (this._settings.paginate) {
            start = this._settings.page * this._settings.pageSize;
            if (start > items.length) {
                start = 0; //don't show an empty page
            }
            end = Math.min(start + this._settings.pageSize, items.length);
            
            generatePagingControls = (items.length > this._settings.pageSize) || (items.length > 0 && this._settings.alwaysShowPagingControls);
        } else {
            start = 0;
            end = items.length;
        }
        for (i = start; i < end; i++) {
            renderItem(i);
        }

        Exhibit.jQuery(bodyDiv).append(table);

        if (generatePagingControls) {
            if (this._settings.pagingControlLocations === "top" || this._settings.pagingControlLocations === "topbottom") {
                this._renderPagingDiv(this._dom.topPagingDiv, items.length, this._settings.page);
                Exhibit.jQuery(this._dom.topPagingDiv).show();
            }
            
            if (this._settings.pagingControlLocations === "bottom" || this._settings.pagingControlLocations === "topbottom") {
                this._renderPagingDiv(this._dom.bottomPagingDiv, items.length, this._settings.page);
                Exhibit.jQuery(this._dom.bottomPagingDiv).show();
            }
        } else {
            Exhibit.jQuery(this._dom.topPagingDiv).hide();
            Exhibit.jQuery(this._dom.bottomPagingDiv).hide();
        }
    }
};

/**
 * @param {Element} parentElmt
 * @param {Number} itemCount
 * @param {Number} page
 */
Exhibit.TabularView.prototype._renderPagingDiv = function(parentElmt, itemCount, page) {
    var pageCount, self;
    pageCount = Math.ceil(itemCount / this._settings.pageSize);
    self = this;
    
    Exhibit.OrderedViewFrame.renderPageLinks(
        parentElmt, 
        page,
        pageCount,
        this._settings.pageWindow,
        function(p) {
            self._gotoPage(p);
        }
    );
};

/**
 * @param {Exhibit.Expression} expression
 * @returns {String}
 */
Exhibit.TabularView.prototype._getColumnLabel = function(expression) {
    var database, path, segment, propertyID, property;
    database = this.getUIContext().getDatabase();
    path = expression.getPath();
    segment = path.getSegment(path.getSegmentCount() - 1);
    propertyID = segment.property;
    property = database.getProperty(propertyID);
    if (typeof property !== "undefined" && property !== null) {
        return segment.forward ? property.getLabel() : property.getReverseLabel();
    } else {
        return propertyID;
    }
};

/**
 * Stablize converts an arbitrary sorting function into one that breaks ties 
 * in that function according to item indices stored in indexMap.  Thus if
 * indexMap contains the indices of items under a previous order, then the
 * sort will preserve that previous order in the case of ties.
 *
 * If sorting is interleaved with faceting, items that go out-of and back-into 
 * view will not be stabilized as their past index will be forgotten while they
 * are out of view.
 *
 * @param {Function} f
 * @param {Object} indexMap
 * @returns {Function}
 */
Exhibit.TabularView.prototype._stabilize = function(f, indexMap)  {
    var stable;
    stable = function(item1, item2) {
        var i1, i2, cmp = f(item1, item2);
        if (cmp) {
            return cmp;
        }
        else {
            i1 = typeof indexMap[item1.id] !== "undefined" ?
                indexMap[item1.id] :
                -1;
            i2 = typeof indexMap[item2.id] !== "undefined" ?
                indexMap[item2.id] :
                -1;
            return i1-i2;
        }
    };
    return stable;
};

/**
 * @param {Array} items
 * @param {Exhibit.Expression} expression
 * @param {Boolean} ascending
 * @returns {Function}
 */
Exhibit.TabularView.prototype._createSortFunction = function(items, expression, ascending) {
    var database, multiply, numericFunction, textFunction, valueTypes, valueTypeMap, makeSetter, i, item, r, coercedValueType, coersion, sortingFunction;
    database = this.getUIContext().getDatabase();
    multiply = ascending ? 1 : -1;
    
    numericFunction = function(item1, item2) {
        var val = multiply * (item1.sortKey - item2.sortKey);
        return isNaN(val) ? 0 : val;
    };
    textFunction = function(item1, item2) {
        return multiply * item1.sortKey.localeCompare(item2.sortKey);
    };
    
    valueTypes = [];
    valueTypeMap = {};
    makeSetter = function(it) {
        return function(value) {
            it.sortKey = value;
        };
    };
    for (i = 0; i < items.length; i++) {
        item = items[i];
        r = expression.evaluate(
            { "value" : item.id }, 
            { "value" : "item" }, 
            "value",
            database
        );
        r.values.visit(makeSetter(item));
        
        if (typeof valueTypeMap[r.valueType] === "undefined") {
            valueTypeMap[r.valueType] = true;
            valueTypes.push(r.valueType);
        }
    }
    
    coercedValueType = "text";
    if (valueTypes.length === 1) {
        coercedValueType = valueTypes[0];
    } else {
        coercedValueType = "text";
    }
    
    if (coercedValueType === "number") {
        sortingFunction = numericFunction;
        coersion = function(v) {
            if (typeof v === "undefined" || v === null) {
                return Number.NEGATIVE_INFINITY;
            } else if (typeof v === "number") {
                return v;
            } else {
                var n = parseFloat(v);
                if (isNaN(n)) {
                    return Number.MAX_VALUE;
                } else {
                    return n;
                }
            }
        };
    } else if (coercedValueType === "date") {
        sortingFunction = numericFunction;
        coersion = function(v) {
            if (typeof v === "undefined" || v === null) {
                return Number.NEGATIVE_INFINITY;
            } else if (v instanceof Date) {
                return v.getTime();
            } else {
                try {
                    return Exhibit.DateTime.parseIso8601DateTime(v).getTime();
                } catch (e) {
                    return Number.MAX_VALUE;
                }
            }
        };
    } else if (coercedValueType === "boolean") {
        sortingFunction = numericFunction;
        coersion = function(v) {
            if (typeof v === "undefined" || v === null) {
                return Number.MAX_VALUE;
            } else if (typeof v === "boolean") {
                return v ? 1 : 0;
            } else {
                return v.toString().toLowerCase() === "true";
            }
        };
    } else if (coercedValueType === "item") {
        sortingFunction = textFunction;
        coersion = function(v) {
            if (typeof v === "undefined" || v === null) {
                return Exhibit._("%general.missingSortKey");
            } else {
                var label = database.getObject(v, "label");
                return (typeof label === "undefined" || label === null) ? v : label;
            }
        };
    } else {
        sortingFunction = textFunction;
        coersion = function(v) {
            if (typeof v === "undefined" || v === null) {
                return Exhibit._("%general.missingSortKey");
            } else {
                return v.toString();
            }
        };
    }
    
    for (i = 0; i < items.length; i++) {
        item = items[i];
        item.sortKey = coersion(item.sortKey);
    }
    
    return sortingFunction;
};

/**
 * @param {Number} columnIndex
 */
Exhibit.TabularView.prototype._doSort = function(columnIndex) {
    
    Exhibit.History.pushComponentState(
        this,
        Exhibit.View._registryKey,
        this.exportState({
            sortColumn: columnIndex,
            sortAscending: this._settings.sortColumn == columnIndex ?
                ! this._settings.sortAscending : true,
            page: 0
        }),
        Exhibit._(this._settings.sortAscending ? "%TabularView.sortColumnAscending" : "%TabularView.sortColumnDescending", this._columns[columnIndex].label),
        true
    );
};

/**
 * @param {Number} page
 */
Exhibit.TabularView.prototype._gotoPage = function(page) {
    this._settings.page = page;

    Exhibit.History.pushComponentState(
        this,
        Exhibit.View._registryKey,
        this.exportState(),
        Exhibit.ViewUtilities.makePagingActionTitle(page),
        true
    );
};

/**
 * @returns {Object}
 */
Exhibit.TabularView.prototype.exportState = function(change) {
    var state = {}, settings=this._settings;
    change = change || {};

    state.page = change.hasOwnProperty("page") ? 
        change.page : settings.page ;
    state.sortColumn = change.hasOwnProperty("sortColumn") ? 
        change.sortColumn : settings.sortColumn ;
    state.sortAscending = change.hasOwnProperty("sortAscending") ? 
        change.sortAscending : settings.sortAscending ;

    return state;
};

Exhibit.TabularView.prototype.stateDiffers = function(state) {
    return this._settings.page != state.page ||
        this._settings.sortColumn != state.sortColumn ||
        this._settings.sortAScending != state.sortAscending
    ;
}

/**
 * @param {Object} state
 */
Exhibit.TabularView.prototype.importState = function(state) {
    if (this.getUIContext() !== null && this.stateDiffers(state)) {
        this._settings.page = state.page;
        this._settings.sortColumn = state.sortColumn;
        this._settings.sortAscending = state.sortAscending;
        // this should probably take args, the way facets do - applyState
        this._reconstruct();
    }
};

/**
 * @param {Exhibit.Set} values
 * @param {String} valueType
 * @param {Element} parentElmt
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.TabularView._constructDefaultValueList = function(values, valueType, parentElmt, uiContext) {
    uiContext.formatList(values, values.size(), valueType, function(elmt) {
        parentElmt.appendChild(elmt);
    });
};

/**
 * @param {Element} div
 * @returns {Element}
 */
Exhibit.TabularView.createDom = function(div) {
    var headerTemplate;
    headerTemplate = {
        elmt:       div,
        "class":  "exhibit-collectionView-header",
        children: [
            {   "tag":    "div",
                "field":  "collectionSummaryDiv"
            },
            {   "tag":    "div",
                "class":  "exhibit-tabularView-pagingControls",
                "field":  "topPagingDiv"
            },
            {   "tag":    "div",
                "field":  "bodyDiv"
            },
            {   "tag":    "div",
                "class":  "exhibit-tabularView-pagingControls",
                "field":  "bottomPagingDiv"
            }
        ]
    };
    return Exhibit.jQuery.simileDOM("template", headerTemplate);
};

/**
 * @param {Exhibit._Impl} exhibit
 * @param {Element} th
 * @param {String} label
 * @param {Boolean} sort
 * @param {Boolean} sortAscending
 * @param {Function} sortFunction
 * @returns {Element}
 */
Exhibit.TabularView.createColumnHeader = function(
    exhibit, 
    th,
    label,
    sort,
    sortAscending,
    sortFunction
) {
    var template, dom;
    template = {
        "elmt":   th,
        "class":  sort ? 
                    "exhibit-tabularView-columnHeader-sorted" : 
                    "exhibit-tabularView-columnHeader",
        "title": Exhibit._(sort ? "%TabularView.columnHeaderReSortTooltip" : "%TabularView.columnHeaderSortTooltip"),
        "children": [ label ]
    };
    if (sort) {
        template.children.push({
            elmt: Exhibit.UI.createTranslucentImage(
                sortAscending ? "images/up-arrow.png" : "images/down-arrow.png")
        });
    }
    Exhibit.jQuery(th).bind("click", sortFunction);
    
    dom = Exhibit.jQuery.simileDOM("template", template);
    return dom;
};
