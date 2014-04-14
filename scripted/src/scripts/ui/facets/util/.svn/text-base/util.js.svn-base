/******************************************************************************
 * Utility Functions
 *****************************************************************************/

Timegrid.abstract = function(name) {
    return function() { 
        throw "A " + name + " method has not been implemented!"; 
        return;
    };
};

SimileAjax.DateTime.Interval = function(ms) {
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
};

SimileAjax.DateTime.Interval.prototype.toString = function() {
    return this.milliseconds.toString();
};
