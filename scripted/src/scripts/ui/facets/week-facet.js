/*
 @fileOverview A facet for a customized Exhibit week
 @author Quanquan Liu <quanquan@mit.edu>
 @author Mason Tang
 */

/*
 @class
 @constructor
 @param {Element} containerElmt
 @param {Exhibit.UIContext} uiContext
 */
Exhibit.WeekFacet = function(containerElmt, uiContext) {
    Exhibit.jQuery.extend(this, new Exhibit.Facet("week", containerElmt, uiContext), new Exhibit.Timegrid.Layout(containerElmt, uiContext), new Exhibit.Timegrid.EventSource());
    this.addSettingSpecs(Exhibit.WeekFacet._settingSpecs);

    this._dom = null;
    this._containerElmt = containerElmt;
    this._uiContext = uiContext;

    this._valueSet = new Exhibit.Set();
    this._color = "#fefebf";

    // Specifications for a week layout
    this._xSize = 7;
    this._ySize = 24;
    this._iterable = true;

    this._n = 7;
    this._title = this._n + "-Day";

    var self = this;

    /**
     * A function to map date objects to a custom timezone
     * @type Function
     */
    this._timezoneMapper = function(date) {
        if (typeof self.timezoneoffset != "undefined") {
            return date.toTimezone(self.timezoneoffset);
        }
        return date;
    };

    this._scrollwidth = 0;
    this._xLabelHeight = 24;
    this._yLabelWidth = 48;

    this._xMapper = function(obj) {
        var time = self._timezoneMapper(obj.time);
        var start = self._timezoneMapper(self._startTime);
        var ivl = self.interval(time - start);
        return ivl.days;
    };
    this._yMapper = function(obj) {
        var time = self._timezoneMapper(obj.time);
        return (time.getHours() + time.getMinutes() / 60.0) - self._dayStart;
    };
};

/**
 * @constant
 */
Exhibit.WeekFacet._settingSpecs = {
    "title":            { "type": "text" },
    "daystart":         { "type": "int", "defaultValue": 8 },
    "dayend":           { "type": "int", "defaultValue": 22 },
    "xCellWidth":       { "type": "int" },
    "yCellWidth":       { "type": "int" },
    "startdate":        { "type": "text"},
    "enddate":          { "type": "text"},
    "gridheight":       { "type": "int", "defaultValue": 250 },
    "gridwidth":        { "type": "int", "defaultValue": 250 },
    "mini":             { "type": "boolean", "defaultValue": false }
};

/**
 * @param {Object} configuration
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.WeekFacet}
 */
Exhibit.WeekFacet.create = function(configuration, containerElmt, uiContext) {
    var facet, thisUIContext;
    thisUIContext = Exhibit.UIContext.create(configuration, uiContext);
    facet = new Exhibit.WeekFacet(containerElmt, thisUIContext);

    Exhibit.WeekFacet._configure(facet, configuration);
    facet._initializeUI();
    thisUIContext.getCollection().addFacet(facet);
    facet.register();

    return facet;
};

/**
 * @param {Element} configElmt
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.WeekFacet}
 */
Exhibit.WeekFacet.createFromDOM = function(configElmt, containerElmt, uiContext) {
    var configuration, thisUIContext, facet;
    configuration = Exhibit.getConfigurationFromDOM(configElmt);
    thisUIContext = Exhibit.UIContext.createFromDOM(configElmt, uiContext);
    facet = new Exhibit.WeekFacet(
        (typeof containerElmt !== "undefined" && containerElmt !== null) ?
            containerElmt :
            configElmt,
        thisUIContext
    );

    Exhibit.SettingsUtilities.collectSettingsFromDOM(configElmt, facet.getSettingSpecs(), facet._settings);

    facet.setExpression(Exhibit.ExpressionParser.parse("selected"));
    facet.setExpressionString("selected");

    Exhibit.WeekFacet._configure(facet, configuration);

    facet._initializeUI();
    thisUIContext.getCollection().addFacet(facet);
    facet.register();

    return facet;
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

/*
 * Updates grid layout from the passed in parameters
 */
Exhibit.WeekFacet.prototype._updateGrid = function() {
    var now = new Date();
    if (now.isBetween(this._startTime, this._endTime)) { this.now = now; }

    this._endpoints = [];
    if (this._startTime) {
        var iterator = this.getEventIterator(this._startTime,
            this._endTime);
        while (iterator.hasNext()) {
            var ends = this._getEndpoints(iterator.next());
            this._endpoints.push(ends[0]);
            this._endpoints.push(ends[1]);
        }
    }
    this._endpoints.sort(function(a, b) {
        var diff = a.time - b.time;
        if (!diff) {
            return a.type == "start" ? 1 : -1;
        } else {
            return diff;
        }
    });
    
    //this._endpoints = this.uniqueEventsArray(this._endpoints);
};

/**
 * @param {Exhibit.WeekFacet} facet
 * @param {Object} configuration
 */
Exhibit.WeekFacet._configure = function(facet, configuration) {
    Exhibit.SettingsUtilities.collectSettings(configuration, facet.getSettingSpecs(), facet._settings);

    /*
     Check how to retrieve from cache UI selections of
     times to look at classes
     */
    facet._cache = new Exhibit.FacetUtilities.Cache(
        facet.getUIContext().getDatabase(),
        facet.getUIContext().getCollection(),
        facet.getExpression()
    );
};

/**
 *  Makes the week interface
 */
Exhibit.WeekFacet.prototype._initializeUI = function() {
    Exhibit.jQuery(this.getContainer()).empty();
    Exhibit.jQuery(this.getContainer()).addClass("exhibit-weekFacet");

    var dom = Exhibit.jQuery.simileDOM(
        "string",
        this.getContainer(),
        ((typeof this._settings.facetLabel !== "undefined") ?
         (   "<div class='exhibit-weekFacet-header'>" +
             "<span class='exhibit-weekFacet-header-title'>" + this._getLabel() + "</span>" +
             "</div>"
         ) :
         ""
        ) +
            '<div class="exhibit-weekFacet-body" id="valuesContainer"></div>'
    );
    
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
    var database, entries, i, item, label, event, allItemsList, days, j, startTime, endTime, label, day, obj;
    database = this.getUIContext().getDatabase();

    entries = [];
    this._timeMap = {};

    allItemsList = items.toArray();
    for (i in allItemsList) {
        item = allItemsList[i];
        var obj = database.getObject(item, "startTime");
        if (!this._timeMap[item] && obj){
            event = {};
            event.label = database.getObject(item, "label");
            event.days = database.getObject(item, "recurring");
            event.startDate = database.getObject(item, "startDate") || new Date().toDateString();
            event.endDate = database.getObject(item, "endDate") || new Date("12/12/2015").toDateString();
            event.startTime = database.getObject(item, "startTime");
            event.endTime = database.getObject(item, "endTime");
            event.color = database.getObject(item, "color") || "#104E8B";
    
            days = event.days;
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
            days = days.split("");
            if (days.indexOf("Sn") > -1) {
                days = days.remove("Sn");
                for (k = 8; k < 22; k++) {
                    if (startTime <= k && k <= endTime) {
                        label = "Sn" + k;
                        if (this._timeMap[label]) {
                            this._timeMap[label].push(event.label);
                        } else {
                            this._timeMap[label] = [event.label];
                        }
                    }
                }
            }
            for (j = 0; j < days.length; j++) {
                day = days[j];
                for (k = 8; k < 22; k++) {
                    if (startTime <= k && k <= endTime) {
                        label = day + k;
                        if (this._timeMap[label]) {
                            this._timeMap[label].push(event.label);
                        } else {
                            this._timeMap[label] = [event.label];
                        }
                    }
                }
            }
            if (database.getObject(item, "display")) {
                entries.push(event);
            }
        }
    }
    return entries;
};

/**
 * @param {Array} entries
 */
Exhibit.WeekFacet.prototype._constructBody = function(entries) {
    this._events = [];
    var containerDiv, entry, i, labels, days, starts, ends, colors, dayMap, j, k, day, dayArray, formats;
    containerDiv = this._dom.valuesContainer;
    // TODO: once everything starts working, uncomment the following
    //Exhibit.jQuery(containerDiv).hide();
    Exhibit.jQuery(containerDiv).empty();

    dayMap = {'M' : 1, 'T' : 2, 'W' : 3, 'R' : 4, 'F' : 5, 'S': 6, 'Sn': 0 };

    $(containerDiv).addClass('week-default');

    this.render(containerDiv);

    for (i = 0; i < entries.length; i++) {
        labels = entries[i].label.split(",;");
        days = entries[i].days.split(",;");
        starts = entries[i].startTime.split(",;");
        ends = entries[i].endTime.split(",;");
        startDates = entries[i].startDate.split(",;");
        endDates = entries[i].endDate.split(",;");
        if (entries[i].dateFormat) {
            formats = entries[i].dateFormat.split(",;");   
        }
        colors = [];
        if (entries[i].color) {
            colors = entries[i].color.split(",;");
        }

        for (j = 0; j < labels.length; j++) {
            //rewrite this so includes all functionalities instead of just the ones
            // that pertain to Picker which is what it is currently doing....
            day = days[j];
            dayArray = []
            if (day.indexOf("Sn") > -1) {
                day = day.split("Sn").join("");
                dayArray = day.split("");
                dayArray.push("Sn");
            } else {
                dayArray = day.split("");
            }
            if (dayArray.length > 0) {
                for (k = 0; k < dayArray.length; k++) {
                    this._events.push(
                        new Exhibit.Timegrid.EventSource.EventPrototype(
                            [ dayMap[dayArray[k]] ],
                            starts[j],
                            ends[j],
                            startDates[j],
                            endDates[j],
                            labels[j],
                            "",
                            "",
                            "",
                            "",
                            colors[j],
                            "white",
                            formats ? formats[j] : null
                        )
                    );   
                }   
            } else {
                this._events.push(
                    new Exhibit.Timegrid.EventSource.EventPrototype(
                        "",
                        starts[j],
                        ends[j],
                        startDates[j],
                        endDates[j],
                        labels[j],
                        "",
                        "",
                        "",
                        "",
                        colors[j],
                        "white",
                        formats ? formats[j] : null
                    )
                );   
            }
        }
    }
    this.setEventPrototypes(this._events);
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

Exhibit.Timegrid.Layout.prototype.renderEvents = function(doc) {
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
                    var newWidth = this._xCellWidth / currentCount;
                    var newLeft = this._xCellWidth * x + newWidth * hIndex;
                    $(eDiv).css("width", newWidth + "px");
                    $(eDiv).css("left", newLeft + "px");
                    hIndex++;
                }
            } else if (endpoint.type == "end") {
                // Pop event from current events set
                delete currentEvents[endpoint.event.getID()];
                currentCount--;
            }
        }
    }
    return eventContainer;
};

Exhibit.WeekFacet.prototype._renderEvent = function(evt, x, y) {
    var ediv = document.createElement('div');
    var tediv = document.createElement('div');
    
    var self = this;
    
    var onSelect = function(evt) {
        var label = evt.target.innerHTML.split("<div>").join("").split("</div>").join("");
        if (self._valueSet.contains(label)) {
            self._valueSet.remove(label);
        } else {
            self._valueSet.add(label);
        }
        self._filter();
        self._notifyCollection();
    };
    
    if (!this._mini) { tediv.innerHTML = evt.getText(); }
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

Exhibit.WeekFacet.prototype._goPrevious = function() {
    this._endTime = this._startTime;
    this._startTime = this._computeStartTime(this._endTime);
    this._updateGrid();
    this.renderChanged();
};

Exhibit.WeekFacet.prototype._goNext = function() {
    this._startTime = this._endTime;
    this._endTime = this._computeEndTime(this._startTime);
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
    if ( this._valueSet.size() === 0 ) {
        return items;
    }

    // TODO: might need to fix what is added to the Exhibit set
    keys = Object.keys(this._valueSet);
    for (i = 0; i < keys.length; i++) {
        vals = this._timeMap[keys[i]];
        if (vals) {
            for (j = 0; j < vals.length; j++) {
                val = vals[j];
                if (items.contains(val)) {
                    this._valueSet.add(val);
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
Exhibit.WeekFacet.prototype._reconstruct = function(items) {
    //TODO: see if this is needed
};

/**
 * @private
 */
Exhibit.WeekFacet.prototype._notifyCollection = function() {
    this.getUIContext().getCollection().onFacetUpdated(this);
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
 * Clears the selections of times you want to view classes
 */
Exhibit.WeekFacet.prototype._clearSelections = function() {
    Exhibit.History.pushComponentState(
        this,
        Exhibit.Facet.getRegistryKey(),
        this.exportEmptyState(),
        Exhibit._("%facets.facetClearSelectionsActionTitle", this._getLabel()),
        true
    );
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
Exhibit.CloudFacet.prototype.exportState = function() {
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
