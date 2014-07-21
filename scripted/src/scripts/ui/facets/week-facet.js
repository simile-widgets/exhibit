/*
 @fileOverview A facet for a customized Exhibit week
 @fileoverview
 This is where the monthly layout is defined.  The layout is designed to
 resemble the equivalent Google Calendar view.
 @author Quanquan Liu <quanquan@mit.edu>
 @author Mason Tang
 */

/*
 @class
 @constructor
 @param {Element} containerElmt
 @param {Exhibit.UIContext} uiContext
 */
Exhibit.WeekFacet = function(containerElmt, uiContext, configElmt, timegridFacet) {
    this._dom = null;
    this._containerElmt = containerElmt;
    this._uiContext = uiContext;
    this._configElmt = configElmt;
    this._timegridFacet = timegridFacet;

    this._valueSet = new Exhibit.Set();
    this._color = "#fefebf";

    // Specifications for a week layout
    this._xSize = 7;
    this._ySize = 24;
    this._iterable = true;

    this._n = 7;
    this._title = this._n + "-Day";
    this._defaultFacet = this;

    var self = this;
    this._dayMap = { 'M' : 1, 'T' : 2, 'W' : 3, 'R' : 4, 'F' : 5, 'S': 6, 'Sn': 0, 'm': 1, 't': 2, 'w': 3, 'r': 4,
                'f': 5, 's': 6, 'sn' : 0, 0 : 'Sn', 1 : 'M', 2 : 'T', 3 : 'W', 4 : 'R', 5 : 'F', 6 : 'S' };

    /**
     * A function to map date objects to a custom timezone
     * @type Function
     */
    this.timezoneMapper = function(date) {
        if (typeof self.timezoneoffset != "undefined") {
            return date.toTimezone(self.timezoneoffset);
        }
        return date;
    };

    this._scrollwidth = 0;
    this._xLabelHeight = 24;
    this._yLabelWidth = 48;
    
    this._selectedEvents = [];
    this._selectedIndividualEvents = new Exhibit.Set();

    this._xMapper = function(obj) {
        var time = self.timezoneMapper(obj.time);
        var start = self.timezoneMapper(self._startTime);
        var ivl = self.interval(time - start);
        return ivl.days;
    };
    this._yMapper = function(obj) {
        var time = self.timezoneMapper(obj.time);
        return (time.getHours() + time.getMinutes() / 60.0) - self._dayStart;
    };
};

/*
 * Makes the week facet
 */
Exhibit.WeekFacet.prototype.initializeGrid = function() {
    if (this._settings.startdate) {
        this._startTime = this._startTime || Date.parseString(this._settings.startdate);
        this._startTime.setHours(0);
        this._endTime = this._computeEndTime(this._startTime);
    }

    if (this._settings.enddate) {
        this._endTime = this._endTime || Date.parseString(this._settings.enddate);
        this._endTime.setHours(0);
        this._startTime = this._computeStartTime(this._endTime);
    }

    this._startTime = this._startTime || this._computeStartTime(null);
    this._startTime.setHours(0);
    this._endTime = this._endTime || this._computeEndTime(this._startTime);
    
    this._updateGrid();
};

Exhibit.WeekFacet.prototype._updateGrid = function() {
    var now = new Date();
    if (now.isBetween(this._startTime, this._endTime)) { this._now = now; }
    
    this._endpoints = [];
    if (this._startTime) {
        var iterator = this.getEventIterator(this._startTime, this._endTime);
        while (iterator.hasNext()) {
            var ends = this._getEndpoints(iterator.next());
            this._endpoints.push(ends[0]);
            this._endpoints.push(ends[1]);
        }
    }
    
    this._endpoints = this.uniqueEventsArray(this._endpoints);
    
    this._endpoints.sort(function(a, b) { 
        var diff = a.time - b.time;
        if (!diff) {
            return a.type == "start" ? 1 : -1;
        } else {
            return diff;
        }
    });
};

/*
 * Gets the starting date
 */
Exhibit.WeekFacet.prototype._computeStartTime = function(date) {
    if (date) {
        // We don't need to make sure it's the start of the week, once it's
        // been set properly already.
        var startTime = new Date(date);
        startTime.add('d', 0 - this._n);
        return startTime;
    } else {
        var startTime = new Date(new Date().clearTime().setDay(0) ||
            new Date());
        var newStartTime = new Date(startTime);
        newStartTime.clearTime().setDay(Date.l10n.firstDayOfWeek);
        return newStartTime > startTime ? this._computeStartTime(newStartTime) :
            newStartTime;
    }
};

/*
 * Gets the ending date
 */
Exhibit.WeekFacet.prototype._computeEndTime = function(date) {
    if (date) {
        var endTime = new Date(date);
        endTime.add('d', this._n);
        endTime.setHours(0);
        return endTime;
    }
    return false;
};

/**
 *  Makes the week interface
 */
Exhibit.WeekFacet.prototype.initializeUI = function(dom, settings, containerElmt, uiContext) {
    this._eventSource = this._eventSource || new Exhibit.TimegridFacet.EventSource();
    this._layoutClass = this._layoutClass || new Exhibit.TimegridFacet.Layout(containerElmt, uiContext);
    Exhibit.jQuery.extend(this, this._layoutClass, this._eventSource);
    this._uiContext = uiContext;
    this._database = this._uiContext.getDatabase();

    var returnNums = function(v) {
        var numberPattern = /\d+/g;
        return v.match(numberPattern)[0];
    }

    this._dom = dom;
    this._settings = settings;
    if ($(this._containerElmt).css("height")) {
        this._gridheight = parseInt(returnNums($(this._containerElmt).css("height")));
    }
    if ($(this._containerElmt).css("width")) {
        this._gridwidth = parseInt(returnNums($(this._containerElmt).css("width")));
    }

    this._gridheight = this._settings.gridheight;
    this._gridwidth = this._settings.gridwidth;

    this._title = this._settings.title || this._title;
    this._dayEnd = this._settings.dayend || 24;
    this._dayStart = this._settings.daystart || 0;
    this._ySize  = this._dayEnd - this._dayStart;
    if (this._settings.xCellWidth) {
        this._xCellWidth = this._settings.xCellWidth;
    }

    if (this._settings.yCellWidth) {
        this._yCellWidth = this._settings.yCellWidth;
    }

    if (this._settings.mini) {
        this._mini = true;
    }

    this.computeCellSizes();
    this.initializeGrid();
};

/**
 * @param {Exhibit.Set} items
 */
Exhibit.WeekFacet.prototype.update = function(items) {
    this._constructBody(this._computeFacet(items));
};

/*
 * Responsible for parsing the database items and filtering them for
 * insertion into the calendar
 * @param items collection items
 */
Exhibit.WeekFacet.prototype._computeFacet = function(items) {
    var entries, i, item, label, event, allItemsList, days, j, startTime, endTime, label, day, obj, originalDate;

    entries = [];
    this._timeMap = {};
    this._entriesItems = {};

    allItemsList = items.toArray();
    for (i in allItemsList) {
        item = allItemsList[i];
        obj = this._database.getObject(item, "startTime");
        if (!this._timeMap[item] && obj){
            event = {};
            event.label = this._database.getObject(item, "label");
            event.days = this._database.getObject(item, "recurring");
            event.startDate = this._database.getObject(item, "startDate") || new Date().toDateString();
            event.endDate = this._database.getObject(item, "endDate") || new Date().setFullYear(new Date().getFullYear() + 1).toDateString();
            event.startTime = this._database.getObject(item, "startTime");
            event.endTime = this._database.getObject(item, "endTime");
            event.color = this._database.getObject(item, "color") || "#104E8B";
            event.display = this._database.getObject(item, "display");
            
            if (event.display == undefined || event.display == null || (event.display != true && event.display != false)) {
                event.display = true;    
            }
            
            originalDate = this._database.getObject(item, "startDate").toString();
            
            if (event.startDate.indexOf("T") > -1) {
                startTime = event.startDate.split("T");
                event.startDate = startTime[0];
                startTime = startTime[1].split(":");
            } else {
                startTime = event.startTime.split(":");
            }

            if (event.endDate.indexOf("T") > -1) {
                endTime = event.endDate.split("T");
                event.endDate = endTime[0];
                endTime = endTime[1].split(":");
            } else {
                endTime = event.endTime.split(":");
            }
            if (startTime[1].indexOf("PM") > -1 && startTime[0] != "12") {
                startTime[0] = parseInt(startTime[0]) + 12;
                startTime[1] = parseInt(startTime[1].split("PM")[0]);
            } else {
                startTime[0] = parseInt(startTime[0]);
                startTime[1] = parseInt(startTime[1].split("AM")[0]);
            }
            event.startTime = startTime.join(":");
            startTime = startTime[0] + startTime[1].toFixed(2)/60;

            if (endTime[1].indexOf("PM") > -1 && endTime[0] != "12") {
                endTime[0] = parseInt(endTime[0]) + 12;
                endTime[1] = parseInt(endTime[1].split("PM")[0]);
            } else {
                endTime[0] = parseInt(endTime[0]);
                endTime[1] = parseInt(endTime[1].split("AM")[0]);
            }
            event.endTime = endTime.join(":");
            endTime = endTime[0] + endTime[0].toFixed(2)/60;
            
            days = event.days;
            eventDays = [];
            if (days.indexOf("Sn") > -1) {
                days = days.split("Sn").join("");
                eventDays.push("Sn");
                for (k = 8; k < 22; k++) {
                    if (startTime <= k && k <= endTime) {
                        label = "Sn" + k;
                        if (this._timeMap[label]) {
                            this._timeMap[label].push([event.label, 1]);
                        } else {
                            this._timeMap[label] = [[event.label,1]];
                        }
                    }
                }
            }
            
            days = days.split("");
            if (days.length > 0) {
                for (i in days) {
                    if (days[i] in this._dayMap) {
                        day = days[i];
                        eventDays.push(day);
                        for (k = 8; k < 22; k++) {
                            if (startTime <= k && k <= endTime) {
                                label = day + k;
                                if (this._timeMap[label]) {
                                    this._timeMap[label].push([event.label, 1]);
                                } else {
                                    this._timeMap[label] = [[event.label, 1]];
                                }
                            }
                        }
                    }
                }   
            } else {
                day = new Date(originalDate).getDay();
                for (i = Math.floor(startTime); i <= endTime; i++) {
                    label = this._dayMap[day] + i;
                    if (this._timeMap[label]) {
                        this._timeMap[label].push([event.label, 1]);
                    } else {
                        this._timeMap[label] = [[event.label, 1]];
                    }
                }
            }
            event.days = eventDays;
            
            entries.push(event);
        }
    }
    return entries;
};

/*
 Allows switching between week and month views
 on calendar
 */
Exhibit.WeekFacet.prototype.renderSwitchTab = function(container) {
    if ($(container).find(".timegrid-switch-tab").length == 0) {
        var self = this;
        var tabDiv = $('<div></div>').addClass('timegrid-switch-tab');
    
        $(container).prepend(tabDiv);
        this._switchTitle = "Month";
        
        var newLink = $("<a />", {
            href : "javascript:void",
            text : "See " + this._switchTitle
        });
    
        var tab = $('<div></div>', { height : this._tabHeight + "px" })
        .addClass("timegrid-tab")
        .addClass("timegrid-rounded")
        .css({
            "width": 100 + "px",
            "margin-left": this._gridwidth + this._yLabelWidth - 100 + "px",
            "float": "left",
            "position": "relative"
        })
        .append(newLink);
        
        tabDiv.prepend(tab);
        
        Exhibit.jQuery(tab).bind("click", function () {
            self.switchToMonth();
        });
        
        var ie = (function(){
            var undef, v = 3, div = document.createElement('div');
        
            while (
                div.innerHTML = '<!--[if gt IE '+(++v)+']><i></i><![endif]-->',
                div.getElementsByTagName('i')[0]
            );
        
            return v> 4 ? v : undef;
        }());
        
        if (ie) { $('.timegrid-tab').corner("30px top"); } 
    }
};

/*
 Responsible for switching from week to month
 and vice versa.
 */
Exhibit.WeekFacet.prototype.switchToMonth = function(view, container) {
    this._valueSet = new Exhibit.Set();
    this._notifyCollection();

    this._settings.defaultFacet = "month";
    this._uiContext.getCollection().removeFacet(this._timegridFacet);
    $(this._configElmt).empty();
    $(this._configElmt).attr("data-ex-default-facet", this._settings.defaultFacet);
    Exhibit.TimegridFacet.createFromDOM(this._configElmt, this._containerElmt, this._uiContext);
};

/**
 * @param {Array} entries
 */
Exhibit.WeekFacet.prototype._constructBody = function(entries) {
    this._events = [];
    var containerDiv, entry, i, labels, days, starts, ends, colors, dayMap, j, k, day, dayArray, formats;
    containerDiv = this._dom.valuesContainer;
    Exhibit.jQuery(containerDiv).empty();

    $(containerDiv).addClass('week-default');

    this.render(containerDiv);

    for (i = 0; i < entries.length; i++) {
        labels = entries[i].label;
        days = entries[i].days;
        starts = entries[i].startTime;
        ends = entries[i].endTime;
        startDates = entries[i].startDate;
        endDates = entries[i].endDate;
        display = entries[i].display;
        if (entries[i].dateFormat) {
            formats = entries[i].dateFormat;
        }
        colors = [];
        if (entries[i].color) {
            colors = entries[i].color;
        }
        
        //rewrite this so includes all functionalities instead of just the ones
        // that pertain to Picker which is what it is currently doing....
        if (days.length > 0) {
            for (k = 0; k < days.length; k++) {
                this._events.push(
                    new Exhibit.TimegridFacet.EventSource.EventPrototype(
                        [ this._dayMap[days[k]] ],
                        starts,
                        ends,
                        startDates,
                        endDates,
                        labels,
                        "",
                        "",
                        "",
                        "",
                        colors,
                        "white",
                        formats ? formats : null,
                        display
                    )
                );
            }
        } else {
            this._events.push(
                new Exhibit.TimegridFacet.EventSource.EventPrototype(
                    "",
                    starts,
                    ends,
                    startDates,
                    endDates,
                    labels,
                    "",
                    "",
                    "",
                    "",
                    colors,
                    "white",
                    formats ? formats : null,
                    display
                )
            );
        }
    }
    this.setEventPrototypes(this._events);
    if (!this._mini) {
        this.renderSwitchTab($(this._containerElmt).find("div")[0]);
    }
};

/**
 * Resetting the facet
 */
Exhibit.WeekFacet.prototype._dispose = function() {
    this._cache.dispose();
    this._cache = null;
    this._dom = null;
    this._valueSet = new Exhibit.Set();
};

/**
 * @returns {Boolean}
 */
Exhibit.WeekFacet.prototype.hasRestrictions = function() {
    var keys = this._valueSet.toArray();
    for (var i = 0; i < keys.length; i++) {
        if (this._timeMap[keys[i]]) {
            return true;
        }
    }
    return this._valueSet.size() > 0;
};

/*
 * Updates the week facet
 */
Exhibit.WeekFacet.prototype.update = function(items) {
    this._constructBody(this._computeFacet(items));
};

/**
 * Clears all restrictions set on the item
 */
Exhibit.WeekFacet.prototype.clearAllRestrictions = function() {
    Exhibit.jQuery(this.getContainer()).trigger("onBeforeFacetReset.exhibit");
    this._valueSet = new Exhibit.Set();
    // remember to change UI colors and such.
    this._notifyCollection();
};

/**
 * @param {Object} restrictions
 */
Exhibit.WeekFacet.prototype.applyRestrictions = function(restrictions) {
    this._valueSet = new Exhibit.Set();
    for (var i = 0; i < restrictions.selections.length; i++) {
        this._valueSet.add(restrictions.selections[i]);
    }
    this._notifyCollection();
};

Exhibit.WeekFacet.prototype.renderEvents = function(doc) {
    var eventContainer = doc.createElement("div");
    $(eventContainer).addClass("timegrid-events");
    var currentEvents = {};
    var currentCount = 0;
    if (this._endpoints) {
        for (var i = 0; i < this._endpoints.length; i++) {
            var endpoint = this._endpoints[i];
            var x = this._xMapper(endpoint);
            var y = this._yMapper(endpoint);
            if (endpoint.type == "start") {
                // For selection purposes
                this._entriesItems[endpoint.event._text] = true;
                if (endpoint.event._display) {
                    // Render the event
                    var eventDiv = this._renderEvent(endpoint.event, x, y);
                    eventContainer.appendChild(eventDiv);
                    // Push the event div onto the current events set
                    currentEvents[endpoint.event.getID()] = eventDiv;
                    currentCount++;
                    // Adjust widths and offsets as necessary
                    var hIndex = 0;
                    for (var id in currentEvents) {
                        var eDiv = currentEvents[id];
                        var newWidth = this._xCellWidth * 0.8 / currentCount;
                        var margin = (this._xCellWidth * 0.2 / currentCount) / 2.0;
                        var newLeft = this._xCellWidth * x + newWidth * hIndex + margin;
                        $(eDiv).css("width", newWidth + "px");
                        $(eDiv).css("left", newLeft + "px");
                        $(eDiv).css("margin-right", margin + "px");
                        hIndex++;
                    }   
                }
            } else if (endpoint.type == "end") {
                if (endpoint.event._display) {
                    // Pop event from current events set
                    delete currentEvents[endpoint.event.getID()];
                    currentCount--;   
                }
            }
        }
    }
    return eventContainer;
};

Exhibit.WeekFacet.prototype._renderEvent = function(evt, x, y) {
    var ediv = document.createElement('div');
    var tediv = document.createElement('div');

    var self = this;
    
    var removeOccurrence = function(item, arr) {
        for (i in arr) {
            if ($(arr[i]).html() == $(item).html()) {
                delete arr[i];
                return;
            }
        }
    };

    var onSelect = function(evt) {
        var label = evt.target.innerHTML.split("<div>").join("").split("</div>").join("");
        if (!self._selectedIndividualEvents.contains(label)) {
            self._selectedIndividualEvents.add(label);
            self._valueSet.add(label);
        } else if (self._valueSet.contains(label) && self._selectedIndividualEvents.contains(label)) {
            self._valueSet.remove(label);
            self._selectedIndividualEvents.remove(label);
        }
        self._filter();
        self._notifyCollection();
    };

    if (!this._mini) {
        tediv.innerHTML = evt.getText();
    } else {
        tediv.innerHTML = evt.getText();
    }
    ediv.appendChild(tediv);
    var length = (evt.getEnd() - evt.getStart()) / (1000 * 60 * 60.0);
    var className = "timegrid-event";
    if (!this._mini) {
       className += ' timegrid-rounded-shadow';
    }
    ediv.className = className;
    ediv.style.height = this._yCellWidth * length + "px";
    ediv.style.top = this._yCellWidth * y + "px";
    ediv.style.left = this._xCellWidth * x + 'px';
    if (evt.getColor()) { ediv.style.backgroundColor = evt.getColor(); }
    if (evt.getTextColor()) { ediv.style.color = evt.getTextColor(); }

    Exhibit.jQuery(ediv).bind("click", onSelect);
    if (!this._selectedIndividualEvents.contains($(ediv).text())) {
        var hexToRgb = function (hex) { 
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        };
        
        var colorNameToHex = function (color) {
            var colors = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
            "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
            "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
            "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
            "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
            "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
            "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
            "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
            "honeydew":"#f0fff0","hotpink":"#ff69b4",
            "indianred ":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
            "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
            "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
            "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
            "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
            "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
            "navajowhite":"#ffdead","navy":"#000080",
            "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
            "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
            "red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
            "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
            "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
            "violet":"#ee82ee",
            "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
            "yellow":"#ffff00","yellowgreen":"#9acd32"};
        
            if (typeof colors[color.toLowerCase()] != 'undefined')
                return colors[color.toLowerCase()];
        
            return false;
        };
        
        var hexCol = colorNameToHex(evt.getColor()) || evt.getColor();
        var rgbCol = hexToRgb(hexCol);
        var rgbaCol;
        
        if (rgbCol) {
            rgbaCol = 'rgba(' + rgbCol.r
            + ',' + rgbCol.g
            + ',' + rgbCol.b
            +',0.7)';
        } else {
            rgbaCol = 'rgba(' + parseInt(evt.getColor().slice(-6,-4),16)
            + ',' + parseInt(evt.getColor().slice(-4,-2),16)
            + ',' + parseInt(evt.getColor().slice(-2),16)
            +',0.7)';  
        }
        ediv.style.backgroundColor = rgbaCol;
    }
    
    return ediv; // Return the actual DOM element
};

Exhibit.WeekFacet.prototype._renderNow = function() {
    // If we aren't looking at the current time, return
    if (!this._now) { return; }

    var nowX = this._xMapper({ time: this._now });
    var nowY = Math.floor(this._yMapper({ time: this._now }));

    var rectDiv = $('<div></div>').addClass('timegrid-week-highlights');
    var yRect = $('<div></div>').height(this._yCellWidth + "px")
                                .width(this._xCellWidth * this._xSize + "px")
                                .css('top', nowY * this._yCellWidth + "px")
                                .addClass('timegrid-week-highlight');
    var xRect = $('<div></div>').height(this._yCellWidth * this._ySize + "px")
                                .width(this._xCellWidth + "px")
                                .css('left', nowX * this._xCellWidth + "px")
                                .addClass('timegrid-week-highlight');
    rectDiv.append(xRect).append(yRect);
    return rectDiv.get(0);
};

Exhibit.WeekFacet.prototype.getXLabels = function() {
    var date = new Date(this._startTime);
    var labels = [];
    var format = this._mini ? "e" : "E M/d";
    while (date < this._endTime) {
        labels.push(date.formatLabel(format));
        date.setHours(24);
    }
    return labels;
};

Exhibit.WeekFacet.prototype.getYLabels = function() {
    var date = (new Date()).clearTime();
    var labels = [];
    var format = this._mini ? "h" : "ha";
    for (var i = this._dayStart; i < this._dayEnd; i++) {
        date.setHours(i);
        labels.push(date.format(format));
    }
    return labels;
};

Exhibit.WeekFacet.prototype._reset = function () {
    this._yCellWidth = null;
    this._xCellWidth = null;
    this._timeMap = {};
    this._valueSet = new Exhibit.Set();
    this._selectedEvents = [];
    this._selectedIndividualEvents = new Exhibit.Set();
}

Exhibit.WeekFacet.prototype._goPrevious = function() {
    this._endTime = this._startTime;
    this._startTime = this._computeStartTime(this._endTime);
    this._reset();
    this._updateGrid();
    this.renderChanged();
};

Exhibit.WeekFacet.prototype._goNext = function() {
    this._startTime = this._endTime;
    this._endTime = this._computeEndTime(this._startTime);
    this._reset();
    this._updateGrid();
    this.renderChanged();
};

Exhibit.WeekFacet.prototype._getCurrent = function() {
    this._endTime.add('s', -1);
    var result = this._startTime.format("M/d/yyyy") + " - " +
                    this._endTime.format("M/d/yyyy");
    this._endTime.add('s', 1);
    return result;
};

Exhibit.WeekFacet.prototype._getEndpoints = function(evt) {
    return [ { type: "start",
               time: evt.getStart(),
               event: evt },
             { type: "end",
               time: evt.getEnd(),
               event: evt } ];
};

Exhibit.WeekFacet.prototype.resize = function() {
    for (var i = 0; i < window.weeks.length; i++) {
        window.weeks[i]._resize();
    }
    return false;
};

Exhibit.WeekFacet.prototype._resize = function() {
    var newHeight = $(container).height();
    var newWidth = $(container).width();

    if (!(newHeight == this._oldHeight && newWidth == this._oldWidth)) {
        if (!this.rendering) { this._construct(); }
        this._oldHeight = newHeight;
        this._oldWidth = newWidth;
    }
};

/**
 * @param {Exhibit.Set} items
 * @returns {Exhibit.Set}
 */
Exhibit.WeekFacet.prototype.restrict = function(items) {
    var i, key, itemsArr, keys, vals, j, val;
    if (this._valueSet.size() === 0 && Object.size(this._timeMap) === 0) {
        return items;
    }

    keys = Object.keys(this._valueSet);
    for (i = 0; i < keys.length; i++) {
        vals = this._timeMap[keys[i]];
        if (vals) {
            for (j = 0; j < vals.length; j++) {
                val = vals[j];
                if (items.contains(val[0])) {
                    this._valueSet.add(val[0]);
                }
            }
        }
    }

    return this._valueSet;
};

/**
 * @private
 * @param {Exhibit.Set} items
 * @returns {Array}
 */
Exhibit.WeekFacet.prototype._reconstruct = function(items) { };

/**
 * @private
 */
Exhibit.WeekFacet.prototype._notifyCollection = function() {
    this._uiContext.getCollection().onFacetUpdated(this);
};

Exhibit.WeekFacet.prototype._getLabel = function() {
    if (typeof this._settings !== "undefined") {
        if (typeof this._settings.facetLabel !== "undefined") {
        return this._settings.facetLabel;
        } else {
            return Exhibit._("%facets.missingLabel", Exhibit.makeExhibitAttribute("facetLabel"));
        }
    }
    return Exhibit._("%facets.missingLabel", Exhibit.makeExhibitAttribute("facetLabel"));
};

/**
 * Clears the selections of times you want to view events
 */
Exhibit.WeekFacet.prototype._clearSelections = function() {
    Exhibit.History.pushComponentState(
        this,
        Exhibit.Facet.getRegistryKey(),
        this.exportEmptyState(),
        Exhibit._("%facets.facetClearSelectionsActionTitle", this._getLabel()),
        true
    );
    Exhibit.History.eraseState();
};

/**
 * @param {Object} state
 * @param {Array} state.selections
 */
Exhibit.WeekFacet.prototype.importState = function(state) {
    if (this.stateDiffers(state)) {
        this.applyRestrictions(state);
    }
};

/**
 * @param {Object} state
 * @param {Array} state.selection
 */
Exhibit.WeekFacet.prototype.stateDiffers = function(state) {
    var selectionStartCount, stateStartCount, stateSet;

    stateStartCount = state.selections.length;
    selectionStartCount = this._valueSet.length;

    if (stateStartCount !== selectionStartCount) {
        return true;
    } else {
        stateSet = new Exhibit.Set(state.selections);
        stateSet.addSet(this._valueSet);
        if (stateSet.size() !== stateStartCount) {
            return true;
        }
    }

    return false;
};

/*
 * Renders the go back and go forward buttons
 */
Exhibit.WeekFacet.prototype.renderIterator = function() {
    this._div = $('<div></div>').addClass('timegrid-iterator');

    var self = this;
    var makePrevCallback = function() {
        self._goPrevious();
        self._notifyCollection();
    };
    var makeNextCallback = function() {
        self._goNext();
        self._notifyCollection();
    };
    $imageURL = "HEAD/scripts/ui/facets/images/go-previous.png";
    $prevLink = $('<img />', {alt: "Previous", src: $imageURL});
    $imageURL = "HEAD/scripts/ui/facets/images/go-next.png";
    $nextLink = $('<img />', {alt: "Next", src: $imageURL});

    $nextLink.bind("click", function (){
        makeNextCallback();
    });

    $prevLink.bind("click", function (){
        makePrevCallback();
    });

    this._div.append($prevLink);
    this._div.append($nextLink);
    this._div.append($('<span></span>', { text: this._getCurrent() }));
    if ($(this._containerElmt).find(".timegrid-iterator").length > 0) {
        $($(this._containerElmt).find(".timegrid-iterator")[0]).remove();
    }
    $(this._containerElmt).append(this._div);
};

/**
 * @returns {Object}
 */
Exhibit.WeekFacet.prototype.exportState = function() {
    return this._exportState(false);
};

/**
 * @returns {Object}
 */
Exhibit.WeekFacet.prototype.exportEmptyState = function() {
    return this._exportState(true);
};

/**
 * @private
 * @param {Boolean} empty
 */
Exhibit.WeekFacet.prototype._exportState = function(empty) {
    var s = [];

    if (!empty) {
        s = this._valueSet.toArray();
    }

    return {
        "selections": s
    };
};
