/*
 @fileOverview A facet for a customized Exhibit timegrid
 Used by week-facet and month-facet
 @author Quanquan Liu <quanquan@mit.edu>
 @author Mason Tang
 */

Exhibit.Timegrid = function () {
}

/**
 * EventSource allows the creation and display of events
 * whether recurring or happening on a specific date
 * e.g. 8am WF or Sept 24, 2014 at 9am
 *
 * @constructor
 */
Exhibit.Timegrid.EventSource = function() {

    /*
     * The actual array containing event prototypes is kept private, and only
     * accessed/modified through priviledged methods created here, in the
     * constructor.
     */
    var eventPrototypes = new DStructs.Array();

    //========================= Privileged Methods ==========================//

    /** Sets this source's event prototypes to the given prototypes */
    this.setEventPrototypes = function(a) {
        eventPrototypes.clear();
        this.addAllEventPrototypes(a);
    };

    /** Adds the given event prototype to this event source */
    this.addEventPrototype = function(eventPrototype) {
        eventPrototypes.push(eventPrototype);
        this.renderChanged();
    };

    /** Adds all of the event prototypes from the given array */
    this.addAllEventPrototypes = function(a) {
        eventPrototypes.addAll(a);
        this.renderChanged();
    };

    /** Removes the given event prototype from this source's prototypes */
    this.removeEventPrototype = function(eventPrototype) {
        return eventPrototypes.remove(eventPrototype);
    };

    /** Removes all of the event prototypes from this source */
    this.clearEventPrototypes = function() {
        eventPrototypes.clear();
        this.renderChanged();
    };

    /** Generates events from event prototypes */
    this.generateEvents = function(startDate, endDate) {
        var result = new DStructs.Array();
        eventPrototypes.each(function(ep) {
            result.addAll(ep.generateEvents(startDate, endDate));
        });
        return result;
    };
};

/*
 *Gets a list of all events to place on the timegrid
 */
Exhibit.Timegrid.EventSource.prototype.getEventIterator = function(startDate, endDate) {
    return this.generateEvents(startDate, endDate).iterator();
};

/*
 *Object that contains all the details of a specific event
 */
Exhibit.Timegrid.EventSource.EventPrototype = function(dayArray, startTime, endTime, startDate, endDate,
        text, description, image, link, icon, color, textColor, dateFormat) {
    var id = "e" + Math.floor(Math.random() * 1000000);
    var days = new DStructs.Array(); days.addAll(dayArray);

    this.getDays = function() { return days; };
    this.getStartTime = function() { return startTime; };
    this.getEndTime = function() { return endTime; };

    this.getID = function() { return id; }
    this.getText = function() {
        return $('<div />').html(text).text();
    };
    this.getDescription = function() {
        return $('<div />').html(text).text();
    };
    this.getImage = function() {
        return (image != null && image != "") ? image : null;
    };
    this.getLink = function() {
        return (link != null && link != "") ? link : null;
    };
    this.getIcon = function() {
        return (icon != null && icon != "") ? icon : null;
    };
    this.getColor = function() {
        return (color != null && color != "") ? color : null;
    };
    this.getTextColor = function() {
        return (textColor != null && textColor != "") ? textColor : null;
    };
    this.getStartDate = function () {
        var format = this.getDateFormat();
        if (format != null && format != undefined && format != "") {
            return (startDate != null && startDate != "") ? Date.parseString(startDate, format): null; 
        }
        return (startDate != null && startDate != "") ? Date.parseString(startDate): null; 
    };
    this.getEndDate = function () {
        var format = this.getDateFormat();
        if (format != null && format != undefined && format != "") {
            return (endDate != null && endDate != "") ? new Date.parseString(endDate, format) : null;
        }
        return (endDate != null && endDate != "") ? new Date.parseString(endDate) : null;
    };
    this.getRecurring = function() {
        return days.length > 0;
    };
    this.getDateFormat = function() {
        return dateFormat;
    }
    this.generateFrom = function(date) {
        if (this.getRecurring()) {
            if (this.getStartDate() <= date && date <= new Date(this.getEndDate()) && this.getDays().contains(date.getDay())) {
                var startTime = new Date(this.getStartDate().toLocaleDateString() + " " + this.getStartTime());
                var endTime = new Date(this.getEndDate().toLocaleDateString() + " " + this.getEndTime());
                startTime.setDate(date.getDate());
                startTime.setMonth(date.getMonth());
                startTime.setFullYear(date.getFullYear());
                endTime.setDate(date.getDate());
                endTime.setMonth(date.getMonth());
                endTime.setFullYear(date.getFullYear());
                return new Exhibit.Timegrid.EventSource.Event(startTime, endTime, null,
                        null, false, text, description, image, link, icon, color,
                        textColor);   
            }
        } else {
            if (this.getStartDate() <= date && date <= new Date(this.getEndDate())) {
                var st = new Date(this.getStartDate().toLocaleDateString() + " " + this.getStartTime());
                var et = new Date(this.getEndDate().toLocaleDateString() + " " + this.getEndTime());
                return new Exhibit.Timegrid.EventSource.Event(st, et, null,
                    null, false, text, description, image, link, icon, color,
                    textColor);
            }
        }
        return false;
    };
};

/*
 * Distinguishes between specific and recurring events
 * and allows for creation of an event
 */
Exhibit.Timegrid.EventSource.EventPrototype.prototype = {
    generateEvents: function(start, end) {
        var events = new DStructs.Array();
        for (var date = new Date(start); date < end; date.add('d', 1)) {
            var event = this.generateFrom(date);
            if (event) { events.push(event); }
        }
        return events;
    }
};

/*
 * Determines the layout of a weekly calendar or a monthly
 * calendar.
 */
Exhibit.Timegrid.Layout = function(containerElmt, uiContext) {
    this._containerElm = containerElmt;
    this._uiContext = uiContext;

    this.computeCellSizes = function() {
        this._computeCellSizes();
    }
}

/**
 * Takes a parameter hash and extends this layout with it, flattening key names
 * to lowercase as it goes.  This is done to eliminate browser-specific
 * attribute case sensitivity.
 *
 * @param {Object} params a parameter hash
 */
Exhibit.Timegrid.Layout.prototype.configure = function(params) {
    for (var attr in params) {
        this[attr] = params[attr.toLowerCase()];
    }
};

/**
 * @param {Array} events
 * Checks to see if an array of objects only contains unique events
 */
Exhibit.Timegrid.Layout.prototype.uniqueEventsArray = function(array){
    var a = array.concat();
    var compareEvents = function(e1, e2){
        for (var p in e1){
            if(e1[p] !== e2[p] && p != "_earliestEnd" && p != "_end" && p != "_latestStart" && p != "_start" && p != "_id"){
                return false;
            } else if (p == "_earliestEnd" || p == "_end" || p == "_latestStart" || p == "_start") {
                if (e1[p].getTime() != e2[p].getTime()) {
                    return false;
                }
            }
        }
        return true;
    };
    
    //Compares two objects to see if they are equal
    var compareTimeObjects = function(o1, o2){
        for (var p in o1){
            if(o1[p] !== o2[p] && p != "event" && p != "time" && p != "_id"){
                return false;
            } else if (p == "event") {
                if(!compareEvents(o1.event, o2.event)) {
                    return false;
                }
            } else if (p == "time") {
                if (o1[p].getTime() != o2[p].getTime()) {
                    return false;
                }
            }
        }
        return true;
    };
    
    for (var i=0; i < a.length; i++) {
        if (a[i] && a[i] != "undefined") {
            for (var j = i+1; j < a.length; j++) {
                if (a[j] && a[j] != "undefined") {
                    if (compareTimeObjects(a[i], a[j])) {
                        a.splice(j--, 1);
                    }
                }
            }
        }
    }
    return a;
}
    
/**
 * Computes the grid dimensions (gridheight, gridwidth, ycell, xcell) for this
 * layout.  This is relatively complex since any of the above values can be
 * either user-specified or computed.
 */
Exhibit.Timegrid.Layout.prototype._computeCellSizes = function() {
    // Compute the cell sizes for the grid
    this._xCellWidth = Math.round(this._xCellWidth ||
                 (this._gridwidth - 1) / this._xSize);
    this._yCellWidth = Math.round(this._yCellWidth ||
                 (this._gridheight - 1) / this._ySize);
    if (this._yCellWidth) {
        this._gridheight = this._yCellWidth * this._ySize + 1;
    }
    if (this._xCell) {
        this._gridwidth = this._xCellWidth * this._xSize + 1;
    }
};

/*
 * Renders the grid again when the events change
 */
Exhibit.Timegrid.Layout.prototype.renderChanged = function() {
    this.initializeGrid();
    this._gridDiv.empty();
    this._gridDiv.append(this.renderEvents(document));
    this._gridDiv.append(this.renderGridlines(document));
    this.renderXLabels();
    this.renderYLabels();
    
    if (!this._mini) {
        this.renderIterator();   
    }
    this.getPrettyBox(this._container);
};

/**
 * Renders the gridlines for this layout.  Gridlines are represented in the DOM
 * as absolutely positioned <code>div</code> elements with one dimension set to
 * one pixel.
 *
 * @return {Element} a DOM element containing this layout's gridlines
 */
Exhibit.Timegrid.Layout.prototype.renderGridlines = function() {
   var numToDay = {
        0:  "Sn",
        1:  "M",
        2:  "T",
        3:  "W",
        4:  "R",
        5:  "F",
        6:  "S"
    };
    
    var self = this;
    
    var onSelect = function(evt) {
        var time, i, entry;
        time = $(evt.target).attr("classid");
        if (self._valueSet.contains(time)) {
            if (self._timeMap[time]) {
                for (var i = 0; i < self._timeMap[time].length; i++) {
                    self._valueSet.remove(self._timeMap[time][i]);
                }
            }
            self._valueSet.remove(time);
            var keys = Object.keys(self._valueSet);
            if (keys.length > 0) {
                for (var i = 0; i < keys.length; i++) {
                    if (self._timeMap[keys[i]]) {
                        var values = self._timeMap[keys[i]];
                        for (var j = 0; j < values.length; j++) {
                            self._valueSet.add(values[j]);
                        }
                    }
                }   
            } else {
                self._valueSet = new Exhibit.Set();
            }
            self._filter();
        } else {
            self._valueSet.add(time);
            if (self._timeMap[time]) {
                for (i = 0; i < self._timeMap[time].length; i++) {
                    var events = self._timeMap[time];
                    entry = { "label": events[i] };
                    self._filter(entry);
                }   
            } else {
                self._filter();
            }
        }
        self._notifyCollection();
    };

    var gridlineContainer = $("<table></table>", {class: 'timegrid-gridlines',
                                                  width: this._xCellWidth * this._xSize,
                                                  height: this._yCellWidth * this._ySize});

    for (var y = 0; y <= this._ySize - 1; y++) { // Horizontal lines
        var hlineDiv = $('<tr></tr>', { class:'timegrid-hline',
                                        height: "auto" });
        gridlineContainer.append(hlineDiv);

        for (var x = 0; x < this._xSize; x++) { // Vertical lines
            var cid = numToDay[(new Date(this._startTime).getDay() + x) % 7] + (this._dayStart + y);
            var vlineDiv = $('<th></th>', { classid: cid,
                                            class: 'timegrid-vline',
                                            width: "auto"});
            if (this._valueSet.contains(cid)){
                vlineDiv.css("background-color", self._color);
            }
            Exhibit.jQuery(vlineDiv).bind("click", onSelect);
            hlineDiv.append(vlineDiv);
        }
    }
    return gridlineContainer;
};

/**
 * Renders the horizontal column labels that run above the grid.  The labels
 * themselves are provided by the implementing layout subclasses by
 * <code>getXLabels()</code>
 *
 * @return {Element} a DOM element containing the horizontal labels
 */
Exhibit.Timegrid.Layout.prototype.renderXLabels = function() {
    this._xLabelContainer = this._xLabelContainer ||
                            document.createElement("div");
    var xLabelContainer = this._xLabelContainer;
    xLabelContainer.innerHTML = "";
    xLabelContainer.className = 'timegrid-xlabels-window';
    xLabelContainer.style.height = this._xLabelHeight + "px";
    xLabelContainer.style.width = this._width - this._yLabelWidth -
                                  this._scrollwidth + "px";
    xLabelContainer.style.left = this._yLabelWidth + "px";

    var xLabelsDiv = document.createElement("div");
    xLabelsDiv.className = 'timegrid-xlabels';
    xLabelsDiv.style.height = this._xLabelHeight + "px"
    xLabelsDiv.style.width = this._gridwidth + "px";
    xLabelsDiv.style.top = "0px";
    xLabelContainer.appendChild(xLabelsDiv);

    var labels = this.getXLabels();
    for (var i = 0; i < labels.length; i++) {
        var label = document.createElement("div");
        label.className = 'timegrid-label';
        label.innerHTML = labels[i];
        label.style.width = this._xCellWidth + 'px';
        label.style.left = (i * this._xCellWidth) + 'px';
        $(label).css("border-right", "1px solid #a7a37e");
        xLabelsDiv.appendChild(label);
    }
    return xLabelContainer;
};

/**
 * Renders the vertical row labels that run along the side of the grid.  The
 * labels themselves are provided by the implementing layout subclasses by
 * <code>getYLabels()</code>
 *
 * @return {Element} a DOM element containing the vertical labels
 */
Exhibit.Timegrid.Layout.prototype.renderYLabels = function() {
    this._yLabelContainer = this._yLabelContainer ||
                            document.createElement("div");
    var yLabelContainer = this._yLabelContainer;
    yLabelContainer.innerHTML = "";
    yLabelContainer.className = 'timegrid-ylabels-window';
    yLabelContainer.style.width = this._yLabelWidth + "px";
    yLabelContainer.style.height = this._height - this._xLabelHeight -
                                   this._scrollwidth + "px";
    yLabelContainer.style.top = this._xLabelHeight - 1 + "px";

    var yLabelsDiv = document.createElement("div");
    yLabelsDiv.className = 'timegrid-ylabels';
    yLabelsDiv.style.height = this._gridheight + "px";
    yLabelsDiv.style.width = this._yLabelWidth + "px";
    yLabelsDiv.style.left = "0px";
    yLabelContainer.appendChild(yLabelsDiv);

    var labels = this.getYLabels();
    var labelDivs = [];
    for (var i = 0; i < labels.length; i++) {
        var label = document.createElement('div');
        label.className = 'timegrid-label';
        label.innerHTML = labels[i];
        label.style.height = this._yCellWidth + 'px';
        label.style.top = i * this._yCellWidth + 'px';
        yLabelsDiv.appendChild(label);
    }

    return yLabelContainer;
};

/**
 * Renders the grid
 */
Exhibit.Timegrid.Layout.prototype.render = function(container) {
    container = $(container);

    if (this._mini) {
        this._scrollwidth = 0;
        this._xLabelHeight = 24;
        this._yLabelWidth = 24;
    }

    if (!this._height) {
        this._height = this._scrollwidth + this._xLabelHeight +
             (this._gridheight || 250);
    }

    if (!(this._height && this._gridheight)) {
        this._scrollwidth = 0;
    }
    if (container) {
        this._viewDiv = $("<div></div>").addClass('timegrid-view')
                                        .css('top', "0px");
        $(container).append(this._viewDiv);
    } else {
        this._viewDiv.empty();
    }
    var gridDiv = $('<div></div>').addClass('timegrid-grid');
    var gridWindowDiv = $('<div></div>').addClass('timegrid-grid-window');
    if (!this._scrollwidth) { gridWindowDiv.css('overflow', 'visible'); }

    $(container).height(this._height + "px");

    this._width = this._gridwidth + this._yLabelWidth || $(container).width();
    $(container).width(this._width + "px");

    $(container).css('position', 'relative');
    this._viewDiv.height(this._height + "px");

    gridWindowDiv.css("top", this._xLabelHeight).css("left", this._yLabelWidth)
                 .css("right", "0px").css("bottom", "0px");
    this._viewDiv.append(gridWindowDiv.append(gridDiv));
    var windowHeight = this._viewDiv.height() - gridWindowDiv.position().top - 2;
    var windowWidth = this._viewDiv.width() - gridWindowDiv.position().left - 2;

    this._gridwidth = this._gridwidth || gridWindowDiv.width() - this._scrollwidth;
    this._gridheight = this._gridheight || gridWindowDiv.height() - this._scrollwidth;
    gridWindowDiv.height(this._gridheight).width(this._gridwidth);
    gridDiv.height(this._gridheight + "px").width(this._gridwidth + "px");
    this.computeCellSizes();
    this._gridDiv = gridDiv;
    gridDiv.append(this.renderEvents(document));
    gridDiv.append(this.renderGridlines(document, this._timeMap));
    var xLabels = this.renderXLabels();
    var yLabels = this.renderYLabels();
    var syncHorizontalScroll = function(a, b) {
        $(a).scroll(function() { b.scrollLeft = a.scrollLeft; });
        $(b).scroll(function() { a.scrollLeft = b.scrollLeft; });
    };
    var syncVerticalScroll = function(a, b) {
        $(a).scroll(function() { b.scrollTop = a.scrollTop; });
        $(b).scroll(function() { a.scrollTop = b.scrollTop; });
    };
    syncVerticalScroll(yLabels, gridWindowDiv.get(0));
    syncHorizontalScroll(xLabels, gridWindowDiv.get(0));
    this._viewDiv.append(xLabels).append(yLabels);
    if (!this._mini) {
        this.renderIterator();   
    }
    this.getPrettyBox(container);
};

Exhibit.Timegrid.Layout.prototype.getPrettyBox = function(container) {
    var checkOldIE = function() {
        "use strict";

        var oldIE;
        if ($('html').is('.ie6, .ie7, .ie8')) { oldIE = true; }

        return oldIE;
    }

    if (!this.mini) {
        if (checkOldIE()) {
            $('.timegrid-view:visible .timegrid-rounded-shadow',
              container).prettybox(4,0,0,1);
        } else {
            $('.timegrid-view:visible .timegrid-rounded-shadow',
              container).prettybox(4,7,1,0.7);
        }
    }
};

Exhibit.Timegrid.EventSource.prototype._getBaseURL = function(url) {
    if (url.indexOf("://") < 0) {
        var url2 = this._getBaseURL(document.location.href);
        if (url.substr(0,1) == "/") {
            url = url2.substr(0, url2.indexOf("/", url2.indexOf("://") + 3)) + url;
        } else {
            url = url2 + url;
        }
    }

    var i = url.lastIndexOf("/");
    if (i < 0) {
        return "";
    } else {
        return url.substr(0, i+1);
    }
};

Exhibit.Timegrid.EventSource.prototype._resolveRelativeURL = function(url, base) {
    if (url == null || url == "") {
        return url;
    } else if (url.indexOf("://") > 0) {
        return url;
    } else if (url.substr(0,1) == "/") {
        return base.substr(0, base.indexOf("/", base.indexOf("://") + 3)) + url;
    } else {
        return base + url;
    }
};

Exhibit.Timegrid.EventSource.Event = function(
        start, end, latestStart, earliestEnd, instant,
        text, description, image, link,
        icon, color, textColor) {

    this._id = "e" + Math.floor(Math.random() * 1000000);

    this._instant = instant || (end == null);

    this._start = start;
    this._end = (end != null) ? end : start;

    this._latestStart = (latestStart != null) ? latestStart : (instant ? this._end : this._start);
    this._earliestEnd = (earliestEnd != null) ? earliestEnd : (instant ? this._start : this._end);

    this._text = $('<div />').html(text).text();
    this._description = $('<div />').html(text).text();
    this._image = (image != null && image != "") ? image : null;
    this._link = (link != null && link != "") ? link : null;

    this._icon = (icon != null && icon != "") ? icon : null;
    this._color = (color != null && color != "") ? color : null;
    this._textColor = (textColor != null && textColor != "") ? textColor : null;

    this._wikiURL = null;
    this._wikiSection = null;
};

Exhibit.Timegrid.EventSource.Event.prototype = {
    getID:          function() { return this._id; },

    isInstant:      function() { return this._instant; },
    isImprecise:    function() { return this._start != this._latestStart || this._end != this._earliestEnd; },

    getStart:       function() { return this._start; },
    getEnd:         function() { return this._end; },
    getLatestStart: function() { return this._latestStart; },
    getEarliestEnd: function() { return this._earliestEnd; },

    getText:        function() { return this._text; },
    getDescription: function() { return this._description; },
    getImage:       function() { return this._image; },
    getLink:        function() { return this._link; },

    getIcon:        function() { return this._icon; },
    getColor:       function() { return this._color; },
    getTextColor:   function() { return this._textColor; },

    getInterval: function() {
        return new Exhibit.Timegrid.Interval(this.getEnd() -
                this.getStart());
    },

    getProperty:    function(name) { return null; },

    getWikiURL:     function() { return this._wikiURL; },
    getWikiSection: function() { return this._wikiSection; },
    setWikiInfo: function(wikiURL, wikiSection) {
        this._wikiURL = wikiURL;
        this._wikiSection = wikiSection;
    },

    fillDescription: function(elmt) {
        elmt.innerHTML = this._description;
    },
    fillWikiInfo: function(elmt) {
        if (this._wikiURL != null && this._wikiSection != null) {
            var wikiID = this.getProperty("wikiID");
            if (wikiID == null || wikiID.length == 0) {
                wikiID = this.getText();
            }
            wikiID = wikiID.replace(/\s/g, "_");

            var url = this._wikiURL + this._wikiSection.replace(/\s/g, "_") + "/" + wikiID;
            var a = document.createElement("a");
            a.href = url;
            a.target = "new";
            a.innerHTML = "Discuss";

            elmt.appendChild(document.createTextNode("["));
            elmt.appendChild(a);
            elmt.appendChild(document.createTextNode("]"));
        } else {
            elmt.style.display = "none";
        }
    },
    fillTime: function(elmt, labeller) {
        if (this._instant) {
            if (this.isImprecise()) {
                elmt.appendChild(elmt.ownerDocument.createTextNode(labeller.labelPrecise(this._start)));
                elmt.appendChild(elmt.ownerDocument.createElement("br"));
                elmt.appendChild(elmt.ownerDocument.createTextNode(labeller.labelPrecise(this._end)));
            } else {
                elmt.appendChild(elmt.ownerDocument.createTextNode(labeller.labelPrecise(this._start)));
            }
        } else {
            if (this.isImprecise()) {
                elmt.appendChild(elmt.ownerDocument.createTextNode(
                    labeller.labelPrecise(this._start) + " ~ " + labeller.labelPrecise(this._latestStart)));
                elmt.appendChild(elmt.ownerDocument.createElement("br"));
                elmt.appendChild(elmt.ownerDocument.createTextNode(
                    labeller.labelPrecise(this._earliestEnd) + " ~ " + labeller.labelPrecise(this._end)));
            } else {
                elmt.appendChild(elmt.ownerDocument.createTextNode(labeller.labelPrecise(this._start)));
                elmt.appendChild(elmt.ownerDocument.createElement("br"));
                elmt.appendChild(elmt.ownerDocument.createTextNode(labeller.labelPrecise(this._end)));
            }
        }
    },
    fillInfoBubble: function(elmt, theme, labeller) {
        var doc = elmt.ownerDocument;

        var title = this.getText();
        var link = this.getLink();
        var image = this.getImage();

        if (image != null) {
            var img = doc.createElement("img");
            img.src = image;

            theme.event.bubble.imageStyler(img);
            elmt.appendChild(img);
        }

        var divTitle = doc.createElement("div");
        var textTitle = doc.createTextNode(title);
        if (link != null) {
            var a = doc.createElement("a");
            a.href = link;
            a.appendChild(textTitle);
            divTitle.appendChild(a);
        } else {
            divTitle.appendChild(textTitle);
        }
        theme.event.bubble.titleStyler(divTitle);
        elmt.appendChild(divTitle);

        var divBody = doc.createElement("div");
        this.fillDescription(divBody);
        theme.event.bubble.bodyStyler(divBody);
        elmt.appendChild(divBody);

        var divTime = doc.createElement("div");
        this.fillTime(divTime, labeller);
        theme.event.bubble.timeStyler(divTime);
        elmt.appendChild(divTime);

        var divWiki = doc.createElement("div");
        this.fillWikiInfo(divWiki);
        theme.event.bubble.wikiStyler(divWiki);
        elmt.appendChild(divWiki);
    }
};

Exhibit.Timegrid.Layout.prototype.interval = function(ms) {
    // Conversion factors as varants to eliminate all the multiplication
    var SECONDS_CF     = 1000;
    var MINUTES_CF     = 60000;
    var HOURS_CF       = 3600000;
    var DAYS_CF        = 86400000;
    var WEEKS_CF       = 604800000;
    var FORTNIGHTS_CF  = 1209600000;
    var MONTHS_CF      = 2592000000;
    var QUARTERS_CF    = 7776000000;
    var YEARS_CF       = 31557600000;
    var DECADES_CF     = 315576000000;
    var CENTURIES_CF   = 3155760000000;

    this.milliseconds = Math.abs(ms);
    this.seconds      = Math.round(this.milliseconds / SECONDS_CF);
    this.minutes      = Math.round(this.milliseconds / MINUTES_CF);
    this.hours        = Math.round(this.milliseconds / HOURS_CF);
    this.days         = Math.floor(this.milliseconds / DAYS_CF);
    this.weeks        = Math.round(this.milliseconds / WEEKS_CF);
    this.fortnights   = Math.round(this.milliseconds / FORTNIGHTS_CF);
    this.months       = Math.round(this.milliseconds / MONTHS_CF);
    // rounding errors!
    this.quarters     = Math.round(this.milliseconds / QUARTERS_CF);
    // rounding errors!
    this.years        = Math.round(this.milliseconds / YEARS_CF);
    // rounding errors!
    this.decades      = Math.round(this.milliseconds / DECADES_CF);
    // rounding errors!
    this.centuries    = Math.round(this.milliseconds / CENTURIES_CF);
    // rounding errors!

    return this;
};

Exhibit.Timegrid.Layout.prototype.intervaltoString = function() {
    return this.milliseconds.toString();
};

Exhibit.Timegrid.Layout.prototype.setLayouts = function(layouts) {
    this._layouts = layouts;
    this._titles = $.map(this._layouts, function(l) { return l.title; });
    //this._tabSet.setLayouts(this._titles, this._layouts);
};

/**
 * @param {String} value
 * @param {String} label
 * @param {Boolean} selectOnly
 */
Exhibit.Timegrid.Layout.prototype._filter = function(entry) {
    var values, wasSelected, newRestrictions, facetLabel;
    Exhibit.jQuery.extend(this, new Exhibit.Facet("week", this._containerElmt, this._uiContext), new Exhibit.Timegrid.EventSource());

    values = new Exhibit.Set(this._valueSet);

    if (typeof entry !== "undefined" && entry !== null) {
        wasSelected = values.contains(entry.label);

        if (!wasSelected) {
            values.add(entry.label);
        } else {
            values.remove(entry.label);
        }
    } else {
        entry = {"label" : null};
    }

    newRestrictions = { selections: values.toArray() };

    facetLabel = this.getLabel();
    Exhibit.History.pushComponentState(
        this,
        Exhibit.Facet.getRegistryKey(),
        newRestrictions,
        Exhibit._("%facets.facetSelectActionTitle", entry.label, facetLabel),
        true
    );
};