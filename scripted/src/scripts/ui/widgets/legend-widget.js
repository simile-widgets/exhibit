/**
 * @fileOverview Provide an easy way to attach classifications to a
 *     view with a legend widget.
 * @author David Huynh
 * @author Johan Sundström
 * @author Margaret Leibovic
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @constructor
 * @class
 * @param {Object} configuration
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.LegendWidget = function(configuration, containerElmt, uiContext) {
    this._configuration = configuration;
    this._div = containerElmt;
    this._uiContext = uiContext;
    
    this._colorMarkerGenerator = typeof configuration.colorMarkerGenerator !== "undefined" ?
        configuration.colorMarkerGenerator :
        Exhibit.LegendWidget._defaultColorMarkerGenerator;	 
	this._sizeMarkerGenerator = typeof configuration.sizeMarkerGenerator !== "undefined" ?
		configuration.sizeMarkerGenerator :
		Exhibit.LegendWidget._defaultSizeMarkerGenerator;
	this._iconMarkerGenerator = typeof configuration.iconMarkerGenerator !== "undefined" ?
		configuration.iconMarkerGenerator :
		Exhibit.LegendWidget._defaultIconMarkerGenerator;

    this._labelStyler = typeof configuration.labelStyler !== "undefined" ?
        configuration.labelStyler :
        Exhibit.LegendWidget._defaultColorLabelStyler;
    
    this._initializeUI();
};

/**
 * @static
 * @param {Object} configuration
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.LegendWidget}
 */
Exhibit.LegendWidget.create = function(configuration, containerElmt, uiContext) {
    return new Exhibit.LegendWidget(configuration, containerElmt, uiContext);
};

/**
 *
 */
Exhibit.LegendWidget.prototype.dispose = function() {
    $(this._div).empty();
    
    this._div = null;
    this._uiContext = null;
};

/**
 *
 */
Exhibit.LegendWidget.prototype._initializeUI = function() {
    $(this._div).attr("class", "exhibit-legendWidget");
    this.clear();
};

/**
 *
 */
Exhibit.LegendWidget.prototype.clear = function() {
    $(this._div).html('<div id="exhibit-color-legend"></div><div id="exhibit-size-legend"></div><div id="exhibit-icon-legend"></div>');
};

/**
 * @param {String} label
 * @param {String} type
 */
Exhibit.LegendWidget.prototype.addLegendLabel = function(label, type) {
    var dom;
	dom = $.simileDOM("string",
			"div",
			'<div id="legend-label">' +
				'<span id="label" class="exhibit-legendWidget-entry-title">' + 
					label.replace(/\s+/g, "&nbsp;") + 
				"</span>" +
			"&nbsp;&nbsp; </div>",
			{ }
		);
	$(dom.elmt).attr("class","exhibit-legendWidget-label");
	$('#exhibit-' + type + '-legend').append(dom.elmt);
}

/**
 * @param {} value
 * @param {String} label
 * @param {String} type
 */
Exhibit.LegendWidget.prototype.addEntry = function(value, label, type) {
    var dom, legendDiv;

	type = type || "color";
    label = (typeof label === "object") ? label.toString() : label;

    if (type === "color") {
		dom = $.simileDOM("string",
			"span",
			'<span id="marker"></span>&nbsp;' +
				'<span id="label" class="exhibit-legendWidget-entry-title">' + 
					label.replace(/\s+/g, "&nbsp;") + 
				"</span>" +
				"&nbsp;&nbsp; ",
			{ marker: this._colorMarkerGenerator(value) }
		);
		legendDiv = $("#exhibit-color-legend");
	}

	if (type === "size") {
		dom = $.simileDOM("string",
			"span",
			'<span id="marker"></span>&nbsp;' +
				'<span id="label" class="exhibit-legendWidget-entry-title">' + 
					label.replace(/\s+/g, "&nbsp;") + 
				"</span>" +
				"&nbsp;&nbsp; ",
			{ marker: this._sizeMarkerGenerator(value) }
		);
		legendDiv = $("#exhibit-size-legend");
	}

	if (type === "icon") {
		dom = $.simileDOM("string",
			"span",
			'<span id="marker"></span>&nbsp;' +
				'<span id="label" class="exhibit-legendWidget-entry-title">' + 
					label.replace(/\s+/g, "&nbsp;") + 
				"</span>" +
				"&nbsp; ",
			{ marker: this._iconMarkerGenerator(value) }
		);
		legendDiv = $("#exhibit-icon-legend");
	}
    $(dom.elmt).attr("class", "exhibit-legendWidget-entry");
    this._labelStyler(dom.label, value);
    $(legendDiv).append(dom.elmt);
};

/**
 * @static
 * @private
 * @param {} a
 * @param {} b
 * @returns {Number}
 */
Exhibit.LegendWidget._localeSort = function(a, b) {
    return a.localeCompare(b);
}

/**
 * @static
 * @private
 * @param {String} value
 * @returns {Element}
 */
Exhibit.LegendWidget._defaultColorMarkerGenerator = function(value) {
    var span;
    span = $("<span>")
        .attr("class", "exhibit-legendWidget-entry-swatch")
        .css("background", value)
        .html("&nbsp;&nbsp;");
    return span.get(0);
};

/** 
 * @static
 * @private
 * @param {Number} value
 * @returns {Element}
 */
Exhibit.LegendWidget._defaultSizeMarkerGenerator = function(value) {
    var span;
    span = $("<span>")
        .attr("class", "exhibit-legendWidget-entry-swatch")
        .height(value)
        .width(value)
        .css("background", "#C0C0C0")
        .html("&nbsp;&nbsp;");
    return span.get(0);
}

/**
 * @static
 * @private
 * @param {String} value
 * @returns {Element}
 */
Exhibit.LegendWidget._defaultIconMarkerGenerator = function(value) {
    var span;
    span = $("<span>")
        .append('<img src="'+value+'"/>');
    return span.get(0);
}

/**
 * @static
 * @private
 * @param {Element} elmt
 * @param {String} value
 */
Exhibit.LegendWidget._defaultColorLabelStyler = function(elmt, value) {
    // $(elmt).css("color", "#" + value);
};
