/**
 * @fileOverview A facet for a customized Exhibit month
 * @fileoverview
 *   This is where the monthly layout is defined.  The layout is designed to 
 *   resemble the equivalent Google Calendar view.
 * @author Quanquan Liu <quanquan@mit.edu>
 * @author masont
 */

/*
 *TODO: Add all the interpretor methods that are currently in week facet
 *Make sure all the Timegrid facet methods goes through here and all the methods
 *here goes through Timegrid Facet.
 */

Exhibit.MonthFacet = function(containerElmt, uiContext) {
    var self = this;
    this._dom = null;

    // Specifications for a month layout
    this._xSize = 7;
    this._ySize = 0; // This is re-calculated later based on n
    this._n     = 3;
    this._iterable = true;

    // We put title here because it depends on this.n
    this._title = this._n + "-Month";

    // Configure our mappers
    this._xMapper = function(obj) {
        return self.timezoneMapper(obj.time).getDay();
    };
    this._yMapper = function(obj) { 
        var time = self.timezoneMapper(obj.time);
        var start = self.timezoneMapper(self.startTime);
        // Simply divide by the number of milliseconds in a week
        return Math.floor((time - start) / (1000 * 60 * 60 * 24 * 7.0));
    };
};

Exhibit.MonthFacet.prototype.initializeGrid = function() {
    this.startTime     = this.eventSource.getEarliestDate() || new Date();
    this.dataStartTime = new Date(this.eventSource.getEarliestDate()) ||
                         new Date();
    this.updateGrid();
};
Exhibit.MonthFacet.prototype.updateGrid = function() {
    this.computeDimensions();
    var now = new Date();
    if (now.isBetween(this.startTime, this.endTime)) { this.now = now; }
    this.eventGrid = new Timegrid.Grid([], this.xSize, this.ySize, 
                                       this.xMapper, this.yMapper);
    if (this.startTime) {
        var iterator = this.eventSource.getEventIterator(this.startTime,
                                                         this.endTime);
        while (iterator.hasNext()) {
            var endpoints = Exhibit.MonthFacet.getEndpoints(iterator.next());
            this.eventGrid.addAll(endpoints);
        }
    }
};

Exhibit.MonthFacet.prototype.computeDimensions = function() {
    this.startTime = this.computeStartTime(this.startTime);
    
    // Use a method to compute cell and y-labels (non-trivial).  This method
    // will also compute ySize based on n, an unfortunate grouping.
    this.computeYSize(this.startTime);
    this.computeLabels(this.startTime);

    this.endTime = this.computeEndTime(this.startTime);
    
    // Compute the cell sizes for the grid
    this.computeCellSizes();
};

Exhibit.MonthFacet.prototype.renderEvents = function(doc) {
    var eventContainer = doc.createElement("div");
    var labelContainer = doc.createElement("div");
    var colorContainer = doc.createElement("div");
    $(eventContainer).addClass("timegrid-events");
    $(labelContainer).addClass("timegrid-month-labels");
    $(colorContainer).addClass("timegrid-month-colors");
    var i = 0;
    var dates = this.cellLabels;
    for (y = 0; y < this.ySize; y++) {
        for (x = 0; x < this.xSize; x++) {
            var endpoints = this.eventGrid.get(x,y);
            var events = $.map(endpoints, function(e) { 
                return e.type == "start" ? e.event : null;
            });
            var n = dates[i];
            var m = this.months[i];
            eventContainer.appendChild(this.renderEventList(events, x, y,
                                                                    n, m));
            colorContainer.appendChild(this.renderCellColor(x, y, m));
            i++;
        }
    }
    $(labelContainer).append($(this.renderMonthLabels()));
    return $([eventContainer, labelContainer, colorContainer]);
};

Exhibit.MonthFacet.prototype.renderEventList = function(evts, x, y, n, m) {
    var jediv = $("<div></div>").addClass("timegrid-month-cell");
    var eList = $("<ul></ul>").addClass("timegrid-event-list");
    for (var i = 0; i < evts.length; i++) {
        eList.append('<li>' + evts[i].getText() + '</li>');
    }
    jediv.append(eList);
    jediv.append('<span class="timegrid-month-date-label">' + n + '</span>');
    jediv.css("height", this.yCell).css("width", this.xCell + "px");
    jediv.css("top", this.yCell * y);
    jediv.css("left", this.xCell * x + 'px');
    return jediv.get()[0]; // Return the actual DOM element
};

Exhibit.MonthFacet.prototype.renderCellColor = function(x, y, m) {
    var jcdiv = $("<div></div>").addClass("timegrid-month-cell");
    jcdiv.addClass("timegrid-month-cell-" + (m % 2 ? "odd" : "even"));
    jcdiv.css("height", this.yCell).css("width", this.xCell + "px");
    jcdiv.css("top", this.yCell * y);
    jcdiv.css("left", this.xCell * x + "px");
    
    if (this.now) {
        var nowX = this.xMapper({ time: this.now });
        var nowY = this.yMapper({ time: this.now });
        if (x == nowX && y == nowY) { 
            jcdiv.addClass("timegrid-month-cell-now"); 
        }
    }
    
    return jcdiv.get()[0];

};

Exhibit.MonthFacet.prototype.renderMonthLabels = function() {
    var self = this;
    return $.map(this.monthStarts, function(monthStart) {
        var monthString = monthStart.date.getMonthName();
        var mDiv = $('<div><span>' + monthString + '</span></div>');
        mDiv.addClass('timegrid-month-label');
        mDiv.css('top', self.yCell * monthStart.i + "px");
        var height = monthStart.height * self.yCell;
        mDiv.height(height + "px");
        mDiv.children().css('line-height', height + "px");
        return mDiv.get(0);
    });
};

Exhibit.MonthFacet.prototype.highlightNow = function() {
    var now = new Date();
    var x = this.xMapper({ time: now });
    var y = this.yMapper({ time: now });
};

Exhibit.MonthFacet.prototype.getXLabels = function() {
    return Date.l10n.dayNames;
};

Exhibit.MonthFacet.prototype.getYLabels = function() {
    return this.yLabels;
};

Exhibit.MonthFacet.prototype.goPrevious = function() {
    this.dataStartTime.add('M', 0 - this.n);
    this.startTime = new Date(this.dataStartTime);
    this.updateGrid();
    this.render();
};

Exhibit.MonthFacet.prototype.goNext = function() {
    this.dataStartTime.add('M', this.n);
    this.startTime = new Date(this.dataStartTime);
    this.updateGrid();
    this.render();
};

Exhibit.MonthFacet.prototype.getCurrent = function() {
    var start = this.monthStarts[0].date;
    var end   = this.monthStarts[this.monthStarts.length - 1].date;
    if (this.n > 1) {
        return Exhibit.MonthFacet.l10n.makeRange(start, end);
    } else {
        return Exhibit.MonthFacet.l10n.makeRange(start);
    }
};

Exhibit.MonthFacet.prototype.computeStartTime = function(date) {
    if (date) {
        var startTime = new Date(date);
        startTime.setDate(1);
        startTime.setHours(0);
        // Roll back to the first day on the grid
        while (this.xMapper({ time: startTime }) > 0) {
            startTime.setHours(-24);
        }
        return startTime;
    }
};

Exhibit.MonthFacet.prototype.computeEndTime = function(date) {
    if (date) {
        var endTime = new Date(date);
        endTime.add('d', this.ySize * 7);
        return endTime;
    }
    return false;
};

Exhibit.MonthFacet.prototype.computeYSize = function(date) {
    var gridStart = { time: new Date(date) };
    var month = this.dataStartTime.getMonth();
    this.ySize = 0;
    this.monthStarts = [{ i: this.ySize, date: new Date(this.dataStartTime) }]; 
    while (this.xMapper(gridStart) > 0 && this.yMapper(gridStart) >= 0) {
        gridStart.time.setHours(-24);
    }
    gridStart.time.add('d', 7);
    for (; this.monthStarts.length <= this.n; gridStart.time.add('d', 7)) {
        if (gridStart.time.getMonth() != month) { 
            month = gridStart.time.getMonth();
            var year = gridStart.time.getFullYear();
            this.monthStarts.push({i: this.ySize, date: new Date(gridStart.time)});
            var old = this.monthStarts[this.monthStarts.length - 2];
            old.height = this.ySize - old.i + 1;
        }
        this.ySize++;
    }
    this.monthStarts.pop();
};

Exhibit.MonthFacet.prototype.computeLabels = function(date) {
    var gridStart = { time: new Date(date) };
    this.cellLabels = [];
    this.months = [];
    this.yLabels = [];

    // Iterate through and collect the tasty data
    while (this.xMapper(gridStart) < this.xSize && 
           this.yMapper(gridStart) < this.ySize) {
        var d = gridStart.time;
        this.cellLabels.push(d.getDate());
        this.months.push(d.getMonth());
        if (d.getDay() == 0) { 
            this.yLabels.push(d.format(Exhibit.MonthFacet.l10n.yLabelFormat)); 
        }
        d.setHours(24);
    }
};

Exhibit.MonthFacet.getEndpoints = function(evt) {
    return [ { type: "start",
               time: evt.getStart(),
               event: evt },
             { type: "end",
               time: evt.getEnd(),
               event: evt } ];
};

