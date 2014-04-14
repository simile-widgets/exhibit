/**
 * Copyright (c)2005-2007 Matt Kruse (javascripttoolbox.com)
 * 
 * Dual licensed under the MIT and GPL licenses. 
 * This basically means you can use this code however you want for
 * free, but don't claim to have written it yourself!
 * Donations always accepted: http://www.JavascriptToolbox.com/donate/
 * 
 * Please do not link to the .js files on javascripttoolbox.com from
 * your site. Copy the files locally to your server instead.
 * 
 * Modified by Mason Tang, SIMILE Project, 2007
 *   - Changed behavior of format and parse for AM/PM, behavior of 'a' is now
 *     bound to 'A', while 'a' will print a lowercase 'am/pm'.
 */
/*
Date functions

These functions are used to parse, format, and manipulate Date objects.
See documentation and examples at http://www.JavascriptToolbox.com/lib/date/

*/
Date.$VERSION = 1.02;

// Utility function to append a 0 to single-digit numbers
Date.LZ = function(x) {return(x<0||x>9?"":"0")+x};

/**
 * Parse a string and convert it to a Date object.
 * If no format is passed, try a list of common formats.
 * If string cannot be parsed, return null.
 * Avoids regular expressions to be more portable.
 */
Date.parseString = function(val, format) {
    // If no format is specified, try a few common formats
    if (typeof(format)=="undefined" || format==null || format=="") {
        var generalFormats=new Array('y-M-d','MMM d, y','MMM d,y','y-MMM-d','d-MMM-y','MMM d','MMM-d','d-MMM');
        var monthFirst=new Array('M/d/y','M-d-y','M.d.y','M/d','M-d');
        var dateFirst =new Array('d/M/y','d-M-y','d.M.y','d/M','d-M');
        var checkList=new Array(generalFormats,Date.preferAmericanFormat?monthFirst:dateFirst,Date.preferAmericanFormat?dateFirst:monthFirst);
        for (var i=0; i<checkList.length; i++) {
            var l=checkList[i];
            for (var j=0; j<l.length; j++) {
                var d=Date.parseString(val,l[j]);
                if (d!=null) { 
                    return d; 
                }
            }
        }
        return null;
    };

    this.isInteger = function(val) {
        for (var i=0; i < val.length; i++) {
            if ("1234567890".indexOf(val.charAt(i))==-1) { 
                return false; 
            }
        }
        return true;
    };
    this.getInt = function(str,i,minlength,maxlength) {
        for (var x=maxlength; x>=minlength; x--) {
            var token=str.substring(i,i+x);
            if (token.length < minlength) { 
                return null; 
            }
            if (this.isInteger(token)) { 
                return token; 
            }
        }
    return null;
    };
    val=val+"";
    format=format+"";
    var i_val=0;
    var i_format=0;
    var c="";
    var token="";
    var token2="";
    var x,y;
    var year=new Date().getFullYear();
    var month=1;
    var date=1;
    var hh=0;
    var mm=0;
    var ss=0;
    var ampm="";
    while (i_format < format.length) {
        // Get next token from format string
        c=format.charAt(i_format);
        token="";
        while ((format.charAt(i_format)==c) && (i_format < format.length)) {
            token += format.charAt(i_format++);
        }
        // Extract contents of value based on format token
        if (token=="yyyy" || token=="yy" || token=="y") {
            if (token=="yyyy") { 
                x=4;y=4; 
            }
            if (token=="yy") { 
                x=2;y=2; 
            }
            if (token=="y") { 
                x=2;y=4; 
            }
            year=this.getInt(val,i_val,x,y);
            if (year==null) { 
                return null; 
            }
            i_val += year.length;
            if (year.length==2) {
                if (year > 70) { 
                    year=1900+(year-0); 
                }
                else { 
                    year=2000+(year-0); 
                }
            }
        }
        else if (token=="MMM" || token=="NNN"){
            month=0;
            var names = (token=="MMM"?(Date.l10n.monthNames.concat(Date.l10n.monthAbbreviations)):Date.l10n.monthAbbreviations);
            for (var i=0; i<names.length; i++) {
                var month_name=names[i];
                if (val.substring(i_val,i_val+month_name.length).toLowerCase()==month_name.toLowerCase()) {
                    month=(i%12)+1;
                    i_val += month_name.length;
                    break;
                }
            }
            if ((month < 1)||(month>12)){
                return null;
            }
        }
        else if (token=="EE"||token=="E"){
            var names = (token=="EE"?Date.l10n.dayNames:Date.l10n.dayAbbreviations);
            for (var i=0; i<names.length; i++) {
                var day_name=names[i];
                if (val.substring(i_val,i_val+day_name.length).toLowerCase()==day_name.toLowerCase()) {
                    i_val += day_name.length;
                    break;
                }
            }
        }
        else if (token=="MM"||token=="M") {
            month=this.getInt(val,i_val,token.length,2);
            if(month==null||(month<1)||(month>12)){
                return null;
            }
            i_val+=month.length;
        }
        else if (token=="dd"||token=="d") {
            date=this.getInt(val,i_val,token.length,2);
            if(date==null||(date<1)||(date>31)){
                return null;
            }
            i_val+=date.length;
        }
        else if (token=="hh"||token=="h") {
            hh=this.getInt(val,i_val,token.length,2);
            if(hh==null||(hh<1)||(hh>12)){
                return null;
            }
            i_val+=hh.length;
        }
        else if (token=="HH"||token=="H") {
            hh=this.getInt(val,i_val,token.length,2);
            if(hh==null||(hh<0)||(hh>23)){
                return null;
            }
            i_val+=hh.length;
        }
        else if (token=="KK"||token=="K") {
            hh=this.getInt(val,i_val,token.length,2);
            if(hh==null||(hh<0)||(hh>11)){
                return null;
            }
            i_val+=hh.length;
            hh++;
        }
        else if (token=="kk"||token=="k") {
            hh=this.getInt(val,i_val,token.length,2);
            if(hh==null||(hh<1)||(hh>24)){
                return null;
            }
            i_val+=hh.length;
            hh--;
        }
        else if (token=="mm"||token=="m") {
            mm=this.getInt(val,i_val,token.length,2);
            if(mm==null||(mm<0)||(mm>59)){
                return null;
            }
            i_val+=mm.length;
        }
        else if (token=="ss"||token=="s") {
            ss=this.getInt(val,i_val,token.length,2);
            if(ss==null||(ss<0)||(ss>59)){
                return null;
            }
            i_val+=ss.length;
        }
        else if (token=="A") {
            if (val.substring(i_val,i_val+2).toLowerCase()=="am") {
                ampm="AM";
            }
            else if (val.substring(i_val,i_val+2).toLowerCase()=="pm") {
                ampm="PM";
            }
            else {
                return null;
            }
            i_val+=2;
        }
        else {
            if (val.substring(i_val,i_val+token.length)!=token) {
                return null;
            }
            else {
                i_val+=token.length;
            }
        }
    }
    // If there are any trailing characters left in the value, it doesn't match
    if (i_val != val.length) { 
        return null; 
    }
    // Is date valid for month?
    if (month==2) {
        // Check for leap year
        if ( ( (year%4==0)&&(year%100 != 0) ) || (year%400==0) ) { // leap year
            if (date > 29){ 
                return null; 
            }
        }
        else { 
            if (date > 28) { 
                return null; 
            } 
        }
    }
    if ((month==4)||(month==6)||(month==9)||(month==11)) {
        if (date > 30) { 
            return null; 
        }
    }
    // Correct hours value
    if (hh<12 && ampm=="PM") {
        hh=hh-0+12; 
    }
    else if (hh>11 && ampm=="AM") { 
        hh-=12; 
    }
    return new Date(year,month-1,date,hh,mm,ss);
};

(function() {
	/**
	 * Adds a given method under the given name 
	 * to the Date prototype if it doesn't
	 * currently exist.
	 *
	 * @private
	 */
	function add(name, method) {
		if( !Date.prototype[name] ) {
			Date.prototype[name] = method;
		}
	};
    
    add('getFullYear', function() { 
        var yy=this.getYear(); 
        return (yy<1900?yy+1900:yy);
    });
    
    /**
     * Check if a date string is valid
     */
    add('isValid', function(val, format) {
        return (Date.parseString(val,format) != null);
    });
    
    /**
     * Check if a date object is before another date object
     */
    add('isBefore', function(date2) {
    	if (date2==null) { 
    		return false; 
    	}
    	return (this.getTime()<date2.getTime());
    });
    
    /**
     * Check if a date object is after another date object
     */
    add('isAfter', function(date2) {
    	if (date2==null) { 
    		return false; 
    	}
    	return (this.getTime()>date2.getTime());
    });
    
    /**
     * Check if a date object is between two dates
     */
    add('isBetween', function(date1, date2) {
        return this.isAfter(date1) && this.isBefore(date2);
    });
    
    /**
     * Check if two date objects have equal dates and times
     */
    add('equals', function(date2) {
    	if (date2==null) { 
    		return false; 
    	}
    	return (this.getTime()==date2.getTime());
    });
    
    /**
     * Check if two date objects have equal dates, disregarding times
     */
    add('equalsIgnoreTime', function(date2) {
    	if (date2==null) { 
    		return false; 
    	}
    	var d1 = new Date(this.getTime()).clearTime();
    	var d2 = new Date(date2.getTime()).clearTime();
    	return (d1.getTime()==d2.getTime());
    });
    
    /**
     * Format a date into a string using a given format string
     */
     add('format', function(format) {
    	format=format+"";
    	var result="";
    	var i_format=0;
    	var c="";
    	var token="";
    	var y=this.getYear()+"";
    	var M=this.getMonth()+1;
    	var d=this.getDate();
    	var E=this.getDay();
    	var H=this.getHours();
    	var m=this.getMinutes();
    	var s=this.getSeconds();
        var w=this.getWeekOfYear();
    	var yyyy,yy,MMM,MM,dd,hh,h,mm,ss,ampm,HH,H,KK,K,kk,k;
    	// Convert real date parts into formatted versions
    	var value=new Object();
    	if (y.length < 4) {
    		y=""+(+y+1900);
    	}
    	value["y"]=""+y;
    	value["yyyy"]=y;
    	value["yy"]=y.substring(2,4);
    	value["M"]=M;
    	value["MM"]=Date.LZ(M);
    	value["MMM"]=Date.l10n.monthNames[M-1];
    	value["NNN"]=Date.l10n.monthAbbreviations[M-1];
    	value["d"]=d;
    	value["dd"]=Date.LZ(d);
    	value["E"]=Date.l10n.dayAbbreviations[E];
    	value["EE"]=Date.l10n.dayNames[E];
        value["e"]=value["E"].substr(0,1);
    	value["H"]=H;
    	value["HH"]=Date.LZ(H);
    	if (H==0){
    		value["h"]=12;
    	}
    	else if (H>12){
    		value["h"]=H-12;
    	}
    	else {
    		value["h"]=H;
    	}
    	value["hh"]=Date.LZ(value["h"]);
    	value["K"]=value["h"]-1;
    	value["k"]=value["H"]+1;
    	value["KK"]=Date.LZ(value["K"]);
    	value["kk"]=Date.LZ(value["k"]);
    	if (H > 11) { 
    		value["A"]="PM"; 
            value["a"]="pm";
    	}
    	else { 
    		value["A"]="AM"; 
            value["a"]="am";
    	}
    	value["m"]=m;
    	value["mm"]=Date.LZ(m);
    	value["s"]=s;
    	value["ss"]=Date.LZ(s);
        value["w"]=w;
    	while (i_format < format.length) {
    		c=format.charAt(i_format);
    		token="";
    		while ((format.charAt(i_format)==c) && (i_format < format.length)) {
    			token += format.charAt(i_format++);
    		}
    		if (typeof(value[token])!="undefined") { 
    			result=result + value[token]; 
    		}
    		else { 
    			result=result + token; 
    		}
    	}
    	return result;
    });
    
    /**
     * Get the full name of the day for a date
     */
    add('getDayName', function() { 
        return Date.l10n.dayNames[this.getDay()];
    });
    
    /**
     * Get the abbreviation of the day for a date
     */
    add('getDayAbbreviation', function() { 
        return Date.l10n.dayAbbreviations[this.getDay()];
    });
    
    /**
     * Get the full name of the month for a date
     */
    add('getMonthName', function() {
        return Date.l10n.monthNames[this.getMonth()];
    });
    
    /**
     * Get the abbreviation of the month for a date
     */
    add('getMonthAbbreviation',  function() { 
        return Date.l10n.monthAbbreviations[this.getMonth()];
    });
    
	/**
	 * Get the number of the week of the year.
	 * 
	 * @example var dtm = new Date("01/12/2008");
	 * dtm.getWeekOfYear();
	 * @result 2
	 * 
	 * @name getWeekOfYear
	 * @type Number
	 * @cat Plugins/Methods/Date
	 */
	add("getWeekOfYear", function() {
        dowOffset = Date.l10n.firstDayOfWeek;
        var newYear = new Date(this.getFullYear(),0,1);
        var day = newYear.getDay() - dowOffset; //the day of week the year begins on
        day = (day >= 0 ? day : day + 7);
        var daynum = Math.floor((this.getTime() - newYear.getTime() -
        (this.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1;
        var weeknum;
        //if the year starts before the middle of a week
        if(day < 4) {
            weeknum = Math.floor((daynum+day-1)/7) + 1;
            if(weeknum > 52) {
                nYear = new Date(this.getFullYear() + 1,0,1);
                nday = nYear.getDay() - dowOffset;
                nday = nday >= 0 ? nday : nday + 7;
                /*if the next year starts before the middle of
                the week, it is week #1 of that year*/
                weeknum = nday < 4 ? 1 : 53;
            }
        } else {
            weeknum = Math.floor((daynum+day-1)/7);
        }
        return weeknum;
	});
    
    /**
     * Given a timezone offset in hours, returns a new Date object that has
     * been adjusted to that timezone.
     *
     * @function
     * @memberOf Date
     * @param {Number} timezoneOffset the timezone offset in hours
     * @return {Date} a new Date object
     */
    add('toTimezone', function(timezoneOffset) {
        var minutesToMs = 60000; var hoursToMs = 60 * minutesToMs;
        var utcMs    = this.getTime() + (this.getTimezoneOffset() * minutesToMs);
        var offsetMs = hoursToMs * timezoneOffset;
        return new Date(utcMs + offsetMs);
    });
    
    /**
     * Clear all time information in a date object
     */
    add('clearTime', function() {
        this.setHours(0); 
        this.setMinutes(0);
        this.setSeconds(0); 
        this.setMilliseconds(0);
        return this;
    });
    
    /**
     * Clones this date into a new object, optionally modifying the provided
     * instance instead.
     */
    add('clone', function(date) {
        if (date && date instanceof Date) {
            date.setTime(this.getTime());
            return date;
        } else {
            return new Date(this);
        }
    });

    /**
     * Set the day of the week of the date within this same week
     */
    add('setDay', function(n) {
        var day = this.getDay();
        if (day == n) { return this; }
        if (n == 7) { this.add('d', 7); return this.setDay(0); }
        if (day < n) { this.add('d', 1); return this.setDay(n); }
        if (day > n) { this.add('d', -1); return this.setDay(n); }
    });
    
    /**
     * Add an amount of time to a date. Negative numbers can be passed to 
     * subtract time.
     */
    add('add', function(interval, number) {
    	if (typeof(interval)=="undefined" || interval==null || typeof(number)=="undefined" || number==null) { 
    		return this; 
    	}
    	number = +number;
    	if (interval=='y') { // year
    		this.setFullYear(this.getFullYear()+number);
    	}
    	else if (interval=='M') { // Month
    		this.setMonth(this.getMonth()+number);
    	}
    	else if (interval=='d') { // Day
    		this.setDate(this.getDate()+number);
    	}
    	else if (interval=='w') { // Weekday
    		var step = (number>0)?1:-1;
    		while (number!=0) {
    			this.add('d',step);
    			while(this.getDay()==0 || this.getDay()==6) { 
    				this.add('d',step);
    			}
    			number -= step;
    		}
    	}
    	else if (interval=='h') { // Hour
    		this.setHours(this.getHours() + number);
    	}
    	else if (interval=='m') { // Minute
    		this.setMinutes(this.getMinutes() + number);
    	}
    	else if (interval=='s') { // Second
    		this.setSeconds(this.getSeconds() + number);
    	}
    	return this;
    });
    
})();
