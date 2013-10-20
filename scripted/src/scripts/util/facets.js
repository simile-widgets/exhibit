/**
 * @fileOverview Facet building and interaction utilities.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @namespace
 */
Exhibit.FacetUtilities = {};

/**
 * @static
 * @param {Exhibit.Facet} forFacet
 * @param {Element} div
 * @param {String} facetLabel
 * @param {Function} onClearAllSelections
 * @param {Exhibit.UIContext} uiContext
 * @param {Boolean} collapsible
 * @param {Boolean} collapsed
 * @returns {Object}
 */
Exhibit.FacetUtilities.constructFacetFrame = function(forFacet, div, facetLabel, onClearAllSelections, uiContext, collapsible, collapsed) {
    var dom, resizableDivWidget;

    Exhibit.jQuery(div).addClass("exhibit-facet");
    dom = Exhibit.jQuery.simileDOM("string", div,
            '<div class="exhibit-facet-header">' +
            '<div class="exhibit-facet-header-filterControl" id="clearSelectionsDiv" title="' + Exhibit._("%facets.clearSelectionsTooltip") + '">' +
            '<span id="filterCountSpan"></span>' +
            '<img id="checkImage" />' +
            '</div>' +
            ((collapsible) ?
             '<img src="' + Exhibit.urlPrefix + 'images/collapse.png" class="exhibit-facet-header-collapse" id="collapseImg" />' :
                '') +
            '<span class="exhibit-facet-header-title" id="title">' + facetLabel + '</span>' +
        '</div>' +
        '<div class="exhibit-facet-body-frame" id="frameDiv"></div>',
        { checkImage: Exhibit.UI.createTranslucentImage("images/black-check.png") }
    );
    resizableDivWidget = Exhibit.ResizableDivWidget.create({}, dom.frameDiv, uiContext);
    
    dom.valuesContainer = resizableDivWidget.getContentDiv();
    Exhibit.jQuery(dom.valuesContainer).addClass("exhibit-facet-body");
    
    dom.setSelectionCount = function(count) {
        Exhibit.jQuery(this.filterCountSpan).html(count);
        Exhibit.jQuery(this.clearSelectionsDiv).toggle(count > 0);
    };
    Exhibit.jQuery(dom.clearSelectionsDiv).bind("click", onClearAllSelections);
    
    if (collapsible) {
        Exhibit.jQuery(dom.collapseImg).add(Exhibit.jQuery(dom.title))
            .bind("click", function(evt) {
            Exhibit.FacetUtilities.toggleCollapse(dom, forFacet);
        });
        
        if (collapsed) {
            Exhibit.FacetUtilities.toggleCollapse(dom, forFacet);
        }
    }
    
    return dom;
};

/**
 * @static
 * @param {Object} dom
 * @param {Exhibit.Facet} facet
 */
Exhibit.FacetUtilities.toggleCollapse = function(dom, facet) {
    var el = dom.frameDiv;
    if (Exhibit.jQuery(el).is(":visible")) {
        Exhibit.jQuery(el).hide();
        Exhibit.jQuery(dom.collapseImg).attr("src", Exhibit.urlPrefix + "images/expand.png");
    } else {
        Exhibit.jQuery(el).show();
        Exhibit.jQuery(dom.collapseImg).attr("src", Exhibit.urlPrefix + "images/collapse.png");
		// Try to call onUncollapse but don't sweat it if it isn't there.
		if (typeof facet.onUncollapse === 'function') {
			facet.onUncollapse();			
		}
    }
};

/**
 * @static
 * @param {Exhibit.Facet} facet
 * @returns {Boolean}
 */
Exhibit.FacetUtilities.isCollapsed = function(facet) {
    var el = facet._dom.frameDiv;
    return !Exhibit.jQuery(el).is(":visible");
};

/**
 * @static
 * @param {String} label
 * @param {Number} count
 * @param {String} color A valid CSS color value.
 * @param {Boolean} selected
 * @param {Boolean} facetHasSelection
 * @param {Function} onSelect
 * @param {Function} onSelectOnly
 * @param {Exhibit.UIContext} uiContext
 * @returns {Element}
 */
Exhibit.FacetUtilities.constructFacetItem = function(
    label, 
    count, 
    color,
    selected, 
    facetHasSelection,
    onSelect,
    onSelectOnly,
    uiContext
) {
    if (Exhibit.params.safe) {
        label = Exhibit.Formatter.encodeAngleBrackets(label);
    }
    
    var dom = Exhibit.jQuery.simileDOM("string",
        "div",
        '<div class="exhibit-facet-value-count">' + count + "</div>" +
        '<div class="exhibit-facet-value-inner" id="inner">' + 
            (   '<div class="exhibit-facet-value-checkbox">&#160;' +
                    Exhibit.UI.createTranslucentImageHTML(
                        facetHasSelection ?
                            (selected ? "images/black-check.png" : "images/no-check.png") :
                            "images/no-check-no-border.png"
                    ) +
                "</div>"
            ) +
            '<a class="exhibit-facet-value-link" href="#" id="link"></a>' +
        "</div>"
    );

    Exhibit.jQuery(dom.elmt).addClass(selected ? "exhibit-facet-value exhibit-facet-value-selected" : "exhibit-facet-value");
    if (typeof label === "string") {
        Exhibit.jQuery(dom.elmt).attr("title", label);
        Exhibit.jQuery(dom.link).html(label);
        if (typeof color !== "undefined" && color !== null) {
            Exhibit.jQuery(dom.link).css("color", color);
        }
    } else {
        Exhibit.jQuery(dom.link).append(label);
        if (typeof color !== "undefined" && color !== null) {
            Exhibit.jQuery(label).css("color", color);
        }
    }
    
    Exhibit.jQuery(dom.elmt).bind("click", onSelectOnly);
    if (facetHasSelection) {
        Exhibit.jQuery(dom.inner).children(':first-child').bind("click", onSelect);
    }
    return dom.elmt;
};

/**
 * @static
 * @param {Exhibit.Facet} forFacet
 * @param {Element} div
 * @param {String} facetLabel
 * @param {Function} onClearAllSelections
 * @param {Exhibit.UIContext} uiContext
 * @param {Boolean} collapsible
 * @param {Boolean} collapsed
 * @returns {Object}
 */
Exhibit.FacetUtilities.constructFlowingFacetFrame = function(forFacet, div, facetLabel, onClearAllSelections, uiContext, collapsible, collapsed) {
    Exhibit.jQuery(div).addClass("exhibit-flowingFacet");
    var dom = Exhibit.jQuery.simileDOM("string",
        div,
        '<div class="exhibit-flowingFacet-header">' +
            ((collapsible) ?
                '<img src="' + Exhibit.urlPrefix + 'images/collapse.png" class="exhibit-facet-header-collapse" id="collapseImg" />' :
                "") +
            '<span class="exhibit-flowingFacet-header-title" id="title">' + facetLabel + "</span>" +
        "</div>" +
        '<div id="frameDiv"><div class="exhibit-flowingFacet-body" id="valuesContainer"></div></div>'
    );
    
    dom.setSelectionCount = function(count) {
        // nothing
    };

    if (collapsible) {
        Exhibit.jQuery(dom.collapseImg).add(Exhibit.jQuery(dom.title))
            .bind("click", function(evt) {
            Exhibit.FacetUtilities.toggleCollapse(dom, forFacet);
        });
        
        if (collapsed) {
            Exhibit.FacetUtilities.toggleCollapse(dom, forFacet);
        }
    }
    
    return dom;
};

/**
 * @static
 * @param {String} label
 * @param {Number} count
 * @param {String} color A valid CSS color value.
 * @param {Boolean} selected
 * @param {Boolean} facetHasSelection
 * @param {Function} onSelect
 * @param {Function} onSelectOnly
 * @param {Exhibit.UIContext} uiContext
 * @returns {Element}
 */
Exhibit.FacetUtilities.constructFlowingFacetItem = function(
    label, 
    count, 
    color,
    selected, 
    facetHasSelection,
    onSelect,
    onSelectOnly,
    uiContext
) {
    if (Exhibit.params.safe) {
        label = Exhibit.Formatter.encodeAngleBrackets(label);
    }
    
    var dom = Exhibit.jQuery.simileDOM("string",
        "div",
        (   '<div class="exhibit-flowingFacet-value-checkbox">' +
                Exhibit.jQuery.simileBubble("createTranslucentImageHTML",
                    Exhibit.urlPrefix + 
                    (   facetHasSelection ?
                        (selected ? "images/black-check.png" : "images/no-check.png") :
                        "images/no-check-no-border.png"
                    )) +
            "</div>"
        ) +
        '<a class="exhibit-flowingFacet-value-link" href="#" id="inner"></a>' +
        " " +
        '<span class="exhibit-flowingFacet-value-count">(' + count + ")</span>"
    );
    
    Exhibit.jQuery(dom.elmt).attr("class", selected ? "exhibit-flowingFacet-value exhibit-flowingFacet-value-selected" : "exhibit-flowingFacet-value");
    if (typeof label === "string") {
        Exhibit.jQuery(dom.elmt).attr("title", label);
        Exhibit.jQuery(dom.inner).html(label);
        if (typeof color !== "undefined" && color !== null) {
            Exhibit.jQuery(dom.inner).css("color", color);
        }
    } else {
        Exhibit.jQuery(dom.inner).append(label);
        if (typeof color !== "undefined" && color !== null) {
            Exhibit.jQuery(label).css("color", color);
        }
    }

    Exhibit.jQuery(dom.elmt).bind("click", onSelectOnly);
    if (facetHasSelection) {
        Exhibit.jQuery(dom.elmt).children(":first-child").bind("click", onSelect);
    }
    return dom.elmt;
};

/**
 * @static
 * @param {String} label
 * @param {Number} count
 * @param {String} color A valid CSS color value.
 * @param {Boolean} selected
 * @param {Boolean} hasChildren
 * @param {Boolean} expanded
 * @param {Boolean} facetHasSelection
 * @param {Function} onSelect
 * @param {Function} onSelectOnly
 * @param {Function} onToggleChildren
 * @param {Exhibit.UIContext} uiContext
 * @returns {Object}
 */
Exhibit.FacetUtilities.constructHierarchicalFacetItem = function(
    label, 
    count, 
    color,
    selected, 
    hasChildren,
    expanded,
    facetHasSelection,
    onSelect,
    onSelectOnly,
    onToggleChildren,
    uiContext
) {
    if (Exhibit.params.safe) {
        label = Exhibit.Formatter.encodeAngleBrackets(label);
    }
    
    var dom = Exhibit.jQuery.simileDOM("string",
        "div",
        '<div class="exhibit-facet-value-count">' + count + "</div>" +
        '<div class="exhibit-facet-value-inner" id="inner">' + 
            (   '<div class="exhibit-facet-value-checkbox">&#160;' +
                Exhibit.jQuery.simileBubble("createTranslucentImageHTML",
                        Exhibit.urlPrefix + 
                        (   facetHasSelection ?
                            (selected ? "images/black-check.png" : "images/no-check.png") :
                            "images/no-check-no-border.png"
                        )) +
                "</div>"
            ) +
            '<a class="exhibit-facet-value-link" href="#" id="link"></a>' +
            (   hasChildren ?
                (   '<a class="exhibit-facet-value-children-toggle" href="#" id="toggle">' + 
                    Exhibit.jQuery.simileBubble("createTranslucentImageHTML",
                            Exhibit.urlPrefix + "images/down-arrow.png") +
                    Exhibit.jQuery.simileBubble("createTranslucentImageHTML",
                            Exhibit.urlPrefix + "images/right-arrow.png") +
                    "</a>"
                ) :
                ""
            ) +
        "</div>" +
        (hasChildren ? '<div class="exhibit-facet-childrenContainer" id="childrenContainer"></div>' : "")
    );
    Exhibit.jQuery(dom.elmt).attr("class", selected ? "exhibit-facet-value exhibit-facet-value-selected" : "exhibit-facet-value");
    if (typeof label === "string") {
        Exhibit.jQuery(dom.elmt).attr("title", label);
        Exhibit.jQuery(dom.link).append(document.createTextNode(label));
        if (typeof color !== "undefined" && color !== null) {
            Exhibit.jQuery(dom.link).css("color", color);
        }
    } else {
        Exhibit.jQuery(dom.link).append(label);
        if (typeof color !== "undefined" && color !== null) {
            Exhibit.jQuery(label).css("color", color);
        }
    }
    
    Exhibit.jQuery(dom.elmt).bind("click", onSelectOnly);
    if (facetHasSelection) {
        Exhibit.jQuery(dom.elmt).children(":first-child").bind("click", onSelect);
    }
    if (hasChildren) {
        dom.showChildren = function(show) {
            Exhibit.jQuery(dom.childrenContainer).toggle(show);
            Exhibit.jQuery(dom.toggle).children(":eq(0)").toggle(show);
            Exhibit.jQuery(dom.toggle).children(":eq(1)").toggle(!show);
        };
        
        Exhibit.jQuery(dom.toggle).bind("click", onToggleChildren);
        dom.showChildren(expanded);
    }
    
    return dom;
};

/**
 * @static
 * @param {String} label
 * @param {Number} count
 * @param {String} color A valid CSS color value.
 * @param {Boolean} selected
 * @param {Boolean} hasChildren
 * @param {Boolean} expanded
 * @param {Boolean} facetHasSelection
 * @param {Function} onSelect
 * @param {Function} onSelectOnly
 * @param {Function} onToggleChildren
 * @param {Exhibit.UIContext} uiContext
 * @returns {Object}
 */
Exhibit.FacetUtilities.constructFlowingHierarchicalFacetItem = function(
    label, 
    count, 
    color,
    selected, 
    hasChildren,
    expanded,
    facetHasSelection,
    onSelect,
    onSelectOnly,
    onToggleChildren,
    uiContext
) {
    if (Exhibit.params.safe) {
        label = Exhibit.Formatter.encodeAngleBrackets(label);
    }
    
    var dom = Exhibit.jQuery.simileDOM("string",
        "div",
        (   '<div class="exhibit-flowingFacet-value-checkbox">' +
            Exhibit.jQuery.simileBubble("createTranslucentImageHTML",
                    Exhibit.urlPrefix + 
                    (   facetHasSelection ?
                        (selected ? "images/black-check.png" : "images/no-check.png") :
                        "images/no-check-no-border.png"
                    )) +
            "</div>"
        ) +
        '<a class="exhibit-flowingFacet-value-link" href="#" id="inner"></a>' +
        " " +
        '<span class="exhibit-flowingFacet-value-count">(' + count + ")</span>" +
        (   hasChildren ?
            (   '<a class="exhibit-flowingFacet-value-children-toggle" href="#" id="toggle">' + 
                Exhibit.jQuery.simileBubble("createTranslucentImageHTML",
                        Exhibit.urlPrefix + "images/down-arrow.png") +
                Exhibit.jQuery.simileBubble("createTranslucentImageHTML",
                        Exhibit.urlPrefix + "images/right-arrow.png") +
                "</a>"
            ) :
            ""
        ) +
        (hasChildren ? '<div class="exhibit-flowingFacet-childrenContainer" id="childrenContainer"></div>' : "")
    );
    
    Exhibit.jQuery(dom.elmt).attr("class", selected ? "exhibit-flowingFacet-value exhibit-flowingFacet-value-selected" : "exhibit-flowingFacet-value");
    if (typeof label === "string") {
        Exhibit.jQuery(dom.elmt).attr("title", label);
        Exhibit.jQuery(dom.inner).append(document.createTextNode(label));
        if (typeof color !== "undefined" && color !== null) {
            Exhibit.jQuery(dom.inner).css("color", color);
        }
    } else {
        Exhibit.jQuery(dom.inner).append(label);
        if (typeof color !== "undefined" && color !== null) {
            Exhibit.jQuery(label).css("color", color);
        }
    }
    
    Exhibit.jQuery(dom.elmt).bind("click", onSelectOnly);
    if (facetHasSelection) {
        Exhibit.jQuery(dom.elmt).children(":first-child").bind("click", onSelect);
    }
    if (hasChildren) {
        dom.showChildren = function(show) {
            Exhibit.jQuery(dom.childrenContainer).toggle(show);
            Exhibit.jQuery(dom.toggle).children(":eq(0)").toggle(show);
            Exhibit.jQuery(dom.toggle).children(":eq(1)").toggle(!show);
        };
        
        Exhibit.jQuery(dom.toggle).bind("click", onToggleChildren);
        dom.showChildren(expanded);
    }
    
    return dom;
};


/*======================================================================
 *  Cache for item/value mapping
 *======================================================================
 */

/**
 * @constructor
 * @class
 * @param {Exhibit.Database} database
 * @param {Exhibit.Collection} collection
 * @param {Exhibit.Expression} expression
 */
Exhibit.FacetUtilities.Cache = function(database, collection, expression) {
    var self = this;
    
    this._database = database;
    this._collection = collection;
    this._expression = expression;
    
    this._onRootItemsChanged = function() {
        if (typeof self._itemToValue !== "undefined") {
            delete self._itemToValue;
        }
        if (typeof self._valueToItem !== "undefined") {
            delete self._valueToItem;
        }
        if (typeof self._missingItems !== "undefined") {
            delete self._missingItems;
        }
    };

    Exhibit.jQuery(collection.getElement()).bind(
        "onRootItemsChanged.exhibit",
        this._onRootItemsChanged
    );
};

/**
 *
 */
Exhibit.FacetUtilities.Cache.prototype.dispose = function() {
    Exhibit.jQuery(this._collection.getElement()).unbind(
        "onRootItemsChanged.exhibit",
        this._onRootItemsChanged
    );
    this._collection = null;
    this._listener = null;
    
    this._itemToValue = null;
    this._valueToItem = null;
    this._missingItems = null;
};

/**
 * @param {Exhibit.Set} values
 * @param {Exhibit.Set} filter
 * @returns {Exhibit.Set}
 */
Exhibit.FacetUtilities.Cache.prototype.getItemsFromValues = function(values, filter) {
    var set, valueToItem;
    // if (this._expression.isPath()) {
    //     set = this._expression.getPath().walkBackward(
    //         values, 
    //         "item",
    //         filter, 
    //         this._database
    //     ).getSet();
    // } else {
        this._buildMaps();
        
        set = new Exhibit.Set();
        
        valueToItem = this._valueToItem;
        values.visit(function(value) {
            var itemA, i, item;
            if (typeof valueToItem[value] !== "undefined") {
                itemA = valueToItem[value];
                for (i = 0; i < itemA.length; i++) {
                    item = itemA[i];
                    if (filter.contains(item)) {
                        set.add(item);
                    }
                }
            }
        });
//    }
    return set;
};

/**
 * @param {Exhibit.Set} filter
 * @param {Exhibit.Set} results
 * @returns {Exhibit.Set}
 */
Exhibit.FacetUtilities.Cache.prototype.getItemsMissingValue = function(filter, results) {
    this._buildMaps();
    
    results = results || new Exhibit.Set();
        
    var missingItems = this._missingItems;
    filter.visit(function(item) {
        if (typeof missingItems[item] !== "undefined") {
            results.add(item);
        }
    });
    return results;
};

/**
 * @param {Exhibit.Set} items
 * @returns {Exhibit.Set}
 */
Exhibit.FacetUtilities.Cache.prototype.getValueCountsFromItems = function(items) {
    var entries, database, valueType, path, facetValueResult, value, itemA, count, i;
    entries = [];
    database = this._database;
    valueType = "text";
    
        this._buildMaps();
        
        valueType = this._valueType;
        for (value in this._valueToItem) {
            if (this._valueToItem.hasOwnProperty(value)) {
                itemA = this._valueToItem[value];
                count = 0;
                for (i = 0; i < itemA.length; i++) {
                    if (items.contains(itemA[i])) {
                        count++;
                    }
                }
            
                if (count > 0) {
                    entries.push({ value: value, count: count });
                }
            }
        }
    return { entries: entries, valueType: valueType };
};

/**
 * @param {Exhibit.Set} items
 * @returns {Exhibit.Set}
 */
Exhibit.FacetUtilities.Cache.prototype.getValuesFromItems = function(items) {
    var set, itemToValue;

        this._buildMaps();
        
        set = new Exhibit.Set();
        itemToValue = this._itemToValue;
        items.visit(function(item) {
            var a, i;
            if (typeof itemToValue[item] !== "undefined") {
                a = itemToValue[item];
                for (i = 0; i < a.length; i++) {
                    set.add(a[i]);
                }
            }
        });
        
        return set;

};

/**
 * @param {Exhibit.Set} items
 * @returns {Number}
 */
Exhibit.FacetUtilities.Cache.prototype.countItemsMissingValue = function(items) {
    var count, item;

    this._buildMaps();
    
    count = 0;
    for (item in this._missingItems) {
        if (this._missingItems.hasOwnProperty(item)) {
            if (items.contains(item)) {
                count++;
            }
        }
    }
    return count;
};

/**
 *
 */
Exhibit.FacetUtilities.Cache.prototype._buildMaps = function() {
    var itemToValue, valueToItem, missingItems, valueType, insert, expression, database;

    if (typeof this._itemToValue === "undefined") {
        itemToValue = {};
        valueToItem = {};
        missingItems = {};
        valueType = "text";
        
        insert = function(x, y, map) {
            if (typeof map[x] !== "undefined") {
                map[x].push(y);
            } else {
                map[x] = [ y ];
            }
        };
        
        expression = this._expression;
        database = this._database;
        
        this._collection.getAllItems().visit(function(item) {
            var results = expression.evaluateOnItem(item, database);
            if (results.values.size() > 0) {
                valueType = results.valueType;
                results.values.visit(function(value) {
                    insert(item, value, itemToValue);
                    insert(value, item, valueToItem);
                });
            } else {
                missingItems[item] = true;
            }
        });
        
        this._itemToValue = itemToValue;
        this._valueToItem = valueToItem;
        this._missingItems = missingItems;
        this._valueType = valueType;
    }
};
