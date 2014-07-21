/**
 @fileOverview A facet for a customized Exhibit month
 @fileoverview
 This is where the monthly layout is defined.  The layout is designed to
 resemble the equivalent Google Calendar view.
 @author Quanquan Liu <quanquan@mit.edu>
 @author Mason Tang
 */

Exhibit.MonthFacet = function(containerElmt, uiContext, configElmt, timegridFacet) {
    var self = this;
    this._dom = null;
    this._containerElmts = containerElmt;
    this._uiContext = uiContext;
    this._configElmt = configElmt;
    this._timegridFacet = timegridFacet;

    // Specifications for a month layout
    this._xSize = 7;
    this._ySize = 0; // This is re-calculated later based on n
    this._n     = 1;
    
    this._color = "#fefebf"; // color for selected boxes
    
    // Can flip through different months
    this._iterable = true;
    // Can take recurring events using these symbols
    this._dayMap = { 'M' : 1, 'T' : 2, 'W' : 3, 'R' : 4, 'F' : 5, 'S': 6, 'Sn': 0, 'm': 1, 't': 2, 'w': 3, 'r': 4,
                'f': 5, 's': 6, 'sn': 0 };

    this._valueSet = new Exhibit.Set();

    // We put title here because it depends on this.n
    this._title = this._n + "-Month";
    var self = this;
    this._defaultFacet = this;
    
    this._scrollwidth = 0;
    this._xLabelHeight = 24;
    this._yLabelWidth = 0;
    
    this._selectedEvents = [];
    this._selectedIndividualEvents = new Exhibit.Set();

    // Configure our mappers to map the time of occurrence to the grid
    this._xMapper = function(obj) {
        return self.timezoneMapper(obj.time).getDay();
    };
    this._yMapper = function(obj) {
        var time = self.timezoneMapper(obj.time);
        var start = self.timezoneMapper(self._startTime);
        // Simply divide by the number of milliseconds in a week
        return Math.floor((time - start) / (1000 * 60 * 60 * 24 * 7.0));
    };
};

Exhibit.MonthFacet.prototype.initializeUI = function(dom, settings, containerElmt, uiContext) {
    // Using layouts and other concurrent week/month abilities
    this._layoutClass = this._layoutClass || new Exhibit.TimegridFacet.Layout(containerElmt, uiContext);
    this._eventSource = this._eventSource || new Exhibit.TimegridFacet.EventSource();
    Exhibit.jQuery.extend(this, this._layoutClass, this._eventSource);
    this._settings = settings;
    this._uiContext = uiContext;
    this._database = this._uiContext.getDatabase();

    var returnNums = function(v) {
        var numberPattern = /\d+/g;
        return v.match(numberPattern)[0];
    }

    this._dom = dom;
    if ($(this._containerElmt).css("height")) {
        this._gridheight = parseInt(returnNums($(this._containerElmt).css("height")));
    }
    if ($(this._containerElmt).css("width")) {
        this._gridwidth = parseInt(returnNums($(this._containerElmt).css("width")));
    }

    // Adjust gridheight and gridwidth based on passed in parameters
    this._gridheight = this._settings.gridheight;
    this._gridwidth = this._settings.gridwidth;

    this._title = this._settings.title || this._title;
    if (this._settings.xCellWidth) {
        this._xCellWidth = this._settings.xCellWidth;
    }

    if (this._settings.yCellWidth) {
        this._yCellWidth = this._settings.yCellWidth;
    }
    
    this.initializeGrid();
    this.computeCellSizes();
};

Exhibit.MonthFacet.prototype.initializeGrid = function() {
    // Start the calendar at the specified start/end date or current date if not specified
    if (this._settings.enddate) {
        this._endTime = this._endTime || Date.parseString(this._settings.enddate);
        this._endTime.setHours(0);
        this._startTime = this._computeStartTime(this._endTime);
    }
    
    if (this._settings.startdate) {
        this._startTime = this._startTime || Date.parseString(this._settings.startdate);
        this._startTime.setHours(0);
        this._endTime = this._computeEndTime(this._startTime);
    }

    this._startTime = this._startTime || this._computeStartTime(null);
    this._startTime.setHours(0);
    this._endTime = this._endTime || this._computeEndTime(this._startTime);
    // date to start displaying feed data
    this._dataStartTime = this._dataStartTime || this._startTime || this._computeStartTime(null);
    if (this._curMonth != 0) {
        this._curMonth = this._curMonth || this._startTime.getMonth();   
    }
    this._updateGrid();
};

Exhibit.MonthFacet.prototype._updateGrid = function() {
    this._computeDimensions();
    var now = new Date();
    if (now.isBetween(this._startTime, this._endTime)) { this._now = now; }

    if (this._startTime) {
        var iterator = this.getEventIterator(this._startTime, this._endTime);
        while (iterator.hasNext()) {
            var endpoints = this._getEndpoints(iterator.next());
            this._addAllEndpoints(endpoints);
        }
    }
};

Exhibit.MonthFacet.prototype._addAllEndpoints = function(endpoints) {
    // Add all events to the calendar
    for (i in endpoints) {
        var x = this._xMapper(endpoints[i]);
        var y = this._yMapper(endpoints[i]);
        this._eventGrid[x][y].push(endpoints[i]);
    }
};

Exhibit.MonthFacet.prototype._computeDimensions = function() {
    this._startTime = this._computeStartTime(this._startTime);

    // Use a method to compute cell and y-labels (non-trivial).  This method
    // will also compute ySize based on n, an unfortunate grouping.
    this._computeYSize(this._startTime);
    this._computeLabels(this._startTime);

    this._endTime = this._computeEndTime(this._startTime);
    this._eventGrid = new Array(this._xSize);
    for (var i = 0; i < this._xSize; i++) {
        this._eventGrid[i] = new Array(this._ySize);
        for (var j = 0; j < this._ySize; j++) {
            // Create eventGrid for containing all events
            this._eventGrid[i][j] = [];
        }
    }

    // Compute the cell sizes for the grid
    this.computeCellSizes();
};

Exhibit.MonthFacet.prototype.renderEvents = function(doc) {
    var eventContainer = doc.createElement("div");
    var labelContainer = doc.createElement("div");
    // Events
    $(eventContainer).addClass("timegrid-events");
    // Dates in the month
    $(labelContainer).addClass("timegrid-month-labels");
    var i = 0;
    var dates = this._cellLabels;
    for (y = 0; y < this._ySize; y++) {
        for (x = 0; x < this._xSize; x++) {
            var endpoints = this._eventGrid[x][y];
            var events = $.map(endpoints, function(e) {
                return e.type == "start" ? e.event : null;
            });
            var n = dates[i];
            var m = this._months[i];
            eventContainer.appendChild(this._renderEventList(events, x, y, n, m));
            i++;
        }
    }
    $(labelContainer).append($(this._renderMonthLabels()));
    return $([eventContainer, labelContainer]);
};

// Render the list of events from the feed per day
Exhibit.MonthFacet.prototype._renderEventList = function(evts, x, y, n, m) {
    var jediv = $("<div></div>").addClass("timegrid-month-cell");
    $(jediv).attr("classid", y*7 + x);
    var map = Array.prototype.map;
    var eList = $("<div></div>").addClass("timegrid-event-list");
    var labels = [];
    for (e in evts) {
        labels.push([evts[e].getText(), 1]);
    }
    if (labels.length > 0) {
        if (!this._timeMap[y*7 + x]) {
            this._timeMap[y*7 + x] = labels;
        } else {
            for (i in this._timeMap[y*7 + x]) {
                if (this._timeMap[y*7 + x][i][0] != labels[0][0]) {
                    this._timeMap[y*7 + x] = this._timeMap[y*7 + x].concat(labels);    
                }
            }
        }   
    }
    
    var self = this;
    
    var onSelect = function(evt) {
        var label = evt.target.innerHTML.split("<div>").join("").split("</div>").join("");
        if (!self._selectedIndividualEvents.contains(label)) {
            self._selectedIndividualEvents.add(label);
            self._valueSet.add(label);
            $($(evt.target).parent()[0]).css("background-color", "#F5FFFA");
        } else if (self._valueSet.contains(label) && self._selectedIndividualEvents.contains(label)) {
            self._valueSet.remove(label);
            self._selectedIndividualEvents.remove(label);
        }
        self._filter();
        self._notifyCollection();
    };
    
    var countOccurrences = function(item, arr) {
        var num = 0;
        for (i in arr) {
            if (arr[i] == item) {
                num++;
            }
        }
        return num;
    };
    
    var removeOccurrence = function(item, arr) {
        for (i in arr) {
            if (arr[i] == item) {
                delete arr[i];
                return;
            }
        }
    }
    
    if (this._now) {
        var nowX = this._xMapper({ time: this._now });
        var nowY = this._yMapper({ time: this._now });
        if (x == nowX && y == nowY) {
            jediv.addClass("timegrid-month-cell-now");
        }
    }
    
    // Differentiate between current/past/future months
    jediv.addClass("timegrid-month-cell-" + (m === this._curMonth ?  "current" : "not-current"));
    
    for (var i = 0; i < evts.length; i++) {
        var eventLabel = $('<div>' + evts[i].getText() + '</div>').css("margin", "10px");
        Exhibit.jQuery(eventLabel).bind("click", onSelect);
        if (this._selectedIndividualEvents.contains(evts[i].getText())) {
            eventLabel.css("background-color", "#C6E2FF");
        }
        eList.append(eventLabel);
    }
    jediv.append(eList);
    // Label for the specific date
    jediv.append('<span class="timegrid-month-date-label">' + n + '</span>');
    jediv.css("height", this._yCellWidth).css("width", this._xCellWidth + "px");
    // Automatically size the cell or determine cell size manually from settings
    jediv.css("top", this._yCellWidth * y);
    jediv.css("left", this._xCellWidth * x + 'px');
    return jediv.get()[0]; // Return the actual DOM element
};

Exhibit.MonthFacet.prototype._renderMonthLabels = function() {
    var self = this;
    // Place the month label on the calendar and centered
    var monthString = this._monthStarts[0].date.getMonthName();
    var mDiv = $('<div><span>' + monthString + '</span></div>');
    mDiv.addClass('timegrid-month-label');
    mDiv.css('margin-top', this._yCellWidth * this._monthStarts[0].i + "px");
    var height = this._monthStarts[0].height * this._yCellWidth;
    var fontSize = this._gridwidth / 1000;
    mDiv.css("font-size", fontSize + "em");
    mDiv.height(height + "px");
    mDiv.children().css('line-height', height + "px");
    return mDiv.get(0);
};

// Get labels for days
Exhibit.MonthFacet.prototype.getXLabels = function() {
    return Date.l10n.dayNames;
};

// Dummy method for getting y labels--month calendar doesn't have labels
Exhibit.MonthFacet.prototype.getYLabels = function() {
    return [];
};

// Reset the width and height of cells
Exhibit.MonthFacet.prototype._resetCells = function() {
    this._yCellWidth = null;
    this._xCellWidth = null;
}

// Going backwards on the calendar
Exhibit.MonthFacet.prototype._goPrevious = function() {
    this._dataStartTime.add('M', 0 - this._n);
    this._startTime = new Date(this._dataStartTime);
    this._curMonth = this._startTime.getMonth();
    this._resetCells();
    this._updateGrid();
};

// Going forwards on the calendar
Exhibit.MonthFacet.prototype._goNext = function() {
    this._dataStartTime.add('M', this._n);
    this._startTime = new Date(this._dataStartTime);
    this._curMonth = this._startTime.getMonth();
    this._resetCells();
    this._updateGrid();
};

// Get the times for the iterator
Exhibit.MonthFacet.prototype._getCurrent = function() {
    var start = this._startTime;
    var end   = new Date(this._startTime).add('d', 34);
    return Exhibit.MonthFacet.l10n.makeRange(start, end);
};

// Compute the starting time of the month facet
Exhibit.MonthFacet.prototype._computeStartTime = function(date) {
    if (date) {
        var startTime = new Date(date);
    } else {
        var startTime = new Date(new Date().clearTime().setDay(0) ||
            new Date());
    }
    // Roll back to the first day on the grid
    while (this._xMapper({ time: startTime }) > 0) {
        startTime.setHours(-24);
    }
    return startTime;
};

// Computes the ending time of the month facet
Exhibit.MonthFacet.prototype._computeEndTime = function(date) {
    if (date) {
        var endTime = new Date(date);
        endTime.add('d', this._ySize * 7);
        return endTime;
    }
    return false;
};

// Computes the number of rows in the calendar 
Exhibit.MonthFacet.prototype._computeYSize = function(date) {
    var gridStart = { time: new Date(date) };
    var month = this._dataStartTime.getMonth();
    this._ySize = 0;
    this._monthStarts = [{ i: this._ySize, date: new Date(this._dataStartTime) }];
    while (this._xMapper(gridStart) > 0 && this._yMapper(gridStart) >= 0) {
        gridStart.time.setHours(-24);
    }
    gridStart.time.add('d', 7);
    for (; this._monthStarts.length <= this._n; gridStart.time.add('d', 7)) {
        if (gridStart.time.getMonth() != month) {
            month = gridStart.time.getMonth();
            var year = gridStart.time.getFullYear();
            this._monthStarts.push({i: this._ySize, date: new Date(gridStart.time)});
            var old = this._monthStarts[this._monthStarts.length - 2];
            old.height = this._ySize - old.i + 1;
        }
        this._ySize++;
    }
    this._monthStarts.pop();
};

// Date labels
Exhibit.MonthFacet.prototype._computeLabels = function(date) {
    var gridStart = { time: new Date(date) };
    this._cellLabels = [];
    this._months = [];

    // Iterate through and collect the tasty data
    while (this._xMapper(gridStart) < this._xSize &&
           this._yMapper(gridStart) < this._ySize) {
        var d = gridStart.time;
        this._cellLabels.push(d.getDate());
        this._months.push(d.getMonth());
        d.setHours(24);
    }
};

Exhibit.MonthFacet.prototype._dispose = function() {
    this._cache.dispose();
    this._cache = null;
    this._dom = null;
    this._valueSet = new Exhibit.Set();
};

/*
 Clears all restrictions set on the item
*/
Exhibit.MonthFacet.prototype.clearAllRestrictions = function() {
    Exhibit.jQuery(this.getContainer()).trigger("onBeforeFacetReset.exhibit");
    this._valueSet = new Exhibit.Set();
    this._notifyCollection();
};

/*
 Check if there are restrictions on items
*/
Exhibit.MonthFacet.prototype.hasRestrictions = function () {
    var keys = this._valueSet.toArray();
    for (var i = 0; i < keys.length; i++) {
        if (this._timeMap[keys[i]]) {
            return true;
        }
    }
    return this._valueSet.size() > 0;
};

Exhibit.MonthFacet.prototype.applyRestrictions = function(restrictions) {
    this._valueSet = new Exhibit.Set();

    for (var i = 0; i < restrictions.selections.length; i++) {
        this._valueSet.add(restrictions.selections[i]);
    }
    this._notifyCollection();
};

/*
 * Renders the go back and go forward buttons
 */
Exhibit.MonthFacet.prototype.renderIterator = function() {
    this._div = $('<div></div>').addClass('timegrid-iterator');
    $(this._div).css("margin-top", this._tabHeight || 18 + "px");

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

/*
 @param {Exhibit.Set} items
 @returns {Exhibit.Set}
*/
Exhibit.MonthFacet.prototype.restrict = function(items) {
    var i, key, itemsArr, keys, vals, j, val;
    if (this._valueSet.size() === 0) {
        return items;
    }

    keys = Object.keys(this._valueSet);
    for (i = 0; i < keys.length; i++) {
        vals = this._timeMap[keys[i]];
        if (vals) {
            for (j = 0; j < vals.length; j++) {
                val = vals[j];
                item = vals[0];
                if (items.contains(item)) {
                    this._valueSet.add(item);
                }
            }
        }
    }
    
    // add timeMap later for restrictions
    return this._valueSet;
};

Exhibit.MonthFacet.prototype._notifyCollection = function () {
    this._uiContext.getCollection().onFacetUpdated(this);
};

Exhibit.MonthFacet.prototype.update = function (items) {
    // method gone, replace: this._computeFacet
    this._constructBody(this._computeFacet(items));
};

/*
 Responsible for parsing through database items and filtering them
 for insertion into calendar
 @param items collection items
*/
Exhibit.MonthFacet.prototype._computeFacet = function(items) {
    var entries, i, item, label, event, allItemsList, days, j, label, day, obj;
    entries = [];
    this._timeMap = {};
    
    this._possibleDays = {};
    allItemsList = items.toArray();
    for (i in allItemsList) {
        item = allItemsList[i];
        var obj = this._database.getObject(item, "startTime");
        if (!this._timeMap[item] && obj) {
            event = {};
            event.label = this._database.getObject(item, "label");
            event.days = this._database.getObject(item, "recurring");
            event.startDate = this._database.getObject(item, "startDate") || new Date().toDateString();
            event.endDate = this._database.getObject(item, "endDate") || new Date().setFullYear(new Date().getFullYear() + 1).toDateString();
            event.startTime = this._database.getObject(item, "startTime");
            event.endTime = this._database.getObject(item, "endTime");
            event.color = this._database.getObject(item, "color") || "#104E8B";
            
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
            }
            days = days.split("");
            for (i in days) {
                if (days[i] in this._dayMap) {
                    eventDays.push(days[i]);   
                }
            }
            event.days = eventDays;
            if (this._database.getObject(item, "display")) {
                entries.push(event);
            }
        }
    }
    return entries;
};

/*
 Allows switching between week and month views
 on calendar
 */
Exhibit.MonthFacet.prototype.renderSwitchTab = function(container) {
    if ($(container).find(".timegrid-switch-tab").length == 0) {
        var self = this;
        var tabDiv = $('<div></div>').addClass('timegrid-switch-tab');
    
        $(container).prepend(tabDiv);
        this._switchTitle = "Week";
        
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
            self.switchToWeek();
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
Exhibit.MonthFacet.prototype.switchToWeek = function(view, container) {
    this._valueSet = new Exhibit.Set();
    this._notifyCollection();

    this._settings.defaultFacet = "week";
    this._uiContext.getCollection().removeFacet(this._timegridFacet);
    $(this._configElmt).empty();
    $(this._configElmt).attr("data-ex-default-facet", this._settings.defaultFacet);
    Exhibit.TimegridFacet.createFromDOM(this._configElmt, this._containerElmt, this._uiContext);
};

/**
 * @param {Array} entries
 */
Exhibit.MonthFacet.prototype._constructBody = function(entries) {
    this._events = [];
    var containerDiv, entry, i, labels, days, starts, ends, colors, j, k, day, dayArray, formats;
    containerDiv = this._dom.valuesContainer;
    Exhibit.jQuery(containerDiv).empty();

    $(containerDiv).addClass('month-default');

    this.render(containerDiv);

    for (i = 0; i < entries.length; i++) {
        labels = entries[i].label;
        days = entries[i].days;
        starts = entries[i].startTime;
        ends = entries[i].endTime;
        startDates = entries[i].startDate;
        endDates = entries[i].endDate;
        if (entries[i].dateFormat) {
            formats = entries[i].dateFormat;
        }
        colors = [];
        if (entries[i].color) {
            colors = entries[i].color.split(",;");
        }
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
                        formats ? formats : null
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
                    formats ? formats : null
                )
            );
        }
    }
    this.setEventPrototypes(this._events);
    this._updateGrid();
    this.renderSwitchTab($(this._containerElmt).find("div")[0]);
};

/*
 Clears the selection of times you want to view events
*/
Exhibit.MonthFacet.prototype._clearSelections = function () {
    Exhibit.History.pushComponentState(
        this,
        Exhibit.Facet.getRegistryKey(),
        this.exportEmptyState(),
        Exhibit._("%facets.facetClearSelectionsActionTitle", this._getLabel()),
        true
    );
    Exhibit.History.eraseState();
};

/*
 @param {Object} state
 @param {Array} state.selections
*/
Exhibit.MonthFacet.prototype.importState = function(state) {
    if (this.stateDiffers(state)) {
        this.applyRestrictions(state);
    }
};

/*
 @param {Object} state
 @param {Array} state.selection
*/
Exhibit.MonthFacet.prototype.stateDiffers = function(state) {
    var selectionStartCount, stateStartCount, stateSet;

    stateStartCount = state.selections.length;
    selectionsStartCount = this._valueSet.length;

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

Exhibit.MonthFacet.prototype.exportState = function() {
    return this._exportState(false);
};

Exhibit.MonthFacet.prototype.exportEmptyState = function() {
    return this._exportState(true);
};

Exhibit.MonthFacet.prototype._exportState = function(empty) {
    var s = [];

    if (!empty) {
        s = this._valueSet.toArray();
    }

    return {
        "selections": s
    };
};

Exhibit.MonthFacet.prototype._getEndpoints = function(evt) {
    return [ { type: "start",
               time: evt.getStart(),
               event: evt },
             { type: "end",
               time: evt.getEnd(),
               event: evt } ];
};

// Dummy variable for creating the "W23" label
Exhibit.MonthFacet.l10n = {};
 
/** Function to create a title string from an n-value */
Exhibit.MonthFacet.l10n.makeTitle = function(n) { return n + "-Day"; }

/** Function to combine two dates into a string describing the grid's range */
Exhibit.MonthFacet.l10n.makeRange = function(d1, d2) {
    return d1.format(Exhibit.MonthFacet.l10n.startFormat) + " - " +
           d2.format(Exhibit.MonthFacet.l10n.endFormat);
};

/** Format for horizontal "Mon 5/24" style labels */
Exhibit.MonthFacet.l10n.xLabelFormat = "E M/d";
Exhibit.MonthFacet.l10n.miniXLabelFormat = "e";

/** Format for displaying the grid's starting date, e.g. "6/12/2007" */
Exhibit.MonthFacet.l10n.startFormat = "M/d/yyyy";

/** Format for displaying the grid's ending date, e.g. "6/15/2007" */
Exhibit.MonthFacet.l10n.endFormat = "M/d/yyyy";
