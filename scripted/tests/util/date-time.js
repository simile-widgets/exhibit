module("Exhibit.DateTime");

test("setIso8601Date", function() {
    expect(19);

    // Check some gdates
    var d = new Date();
    Exhibit.DateTime.setIso8601Date(d,"2011-05-01");
    equal(d.getUTCFullYear(),2011,'Date 1 year');
    equal(d.getUTCMonth(),4,'Date 1 month');
    equal(d.getUTCDate(),1,'Date 1 day');

    var d = new Date();
    Exhibit.DateTime.setIso8601Date(d,"2011-12-31");
    equal(d.getUTCFullYear(),2011,'Date 2 year');
    equal(d.getUTCMonth(),11,'Date 2 month');
    equal(d.getUTCDate(),31,'Date 2 day');

    var d = new Date();
    Exhibit.DateTime.setIso8601Date(d,"2000-02-29");
    equal(d.getUTCFullYear(),2000,'Date 3 year');
    equal(d.getUTCMonth(),1,'Date 3 month');
    equal(d.getUTCDate(),29,'Date 3 day');

    // Date overflow
    var d = new Date();
    Exhibit.DateTime.setIso8601Date(d,"1999-12-32");
    equal(d.getUTCFullYear(),2000,'Date 4 year');
    equal(d.getUTCMonth(),0,'Date 4 month');
    equal(d.getUTCDate(),1,'Date 4 day');

    var d = new Date();
    Exhibit.DateTime.setIso8601Date(d,"1900-02-29");
    equal(d.getUTCFullYear(),1900,'Date 5 year');
    equal(d.getUTCMonth(),2,'Date 5 month');
    equal(d.getUTCDate(),1,'Date 5 day');

    // ingor unparseable dates should throw
    raises(function(){var d = new Date(); Exhibit.DateTime.setIso8601Date(d,"1968-8-15")},'Date 6 raises');
    raises(function(){var d = new Date(); Exhibit.DateTime.setIso8601Date(d,"08-15-1968")},'Date 7 raises');
    raises(function(){var d = new Date(); Exhibit.DateTime.setIso8601Date(d,"1968/08/15")},'Date 8 raises');
    raises(function(){var d = new Date(); Exhibit.DateTime.setIso8601Date(d,"852-12-16")},'Date 9 raises');
});

test("setIso8601Time", function() {
    expect(7);

    // Basic form
    var d = new Date();
    Exhibit.DateTime.setIso8601Time(d,"121928");
    equal(d.getUTCHours(),12,'Time 1 hours');
    equal(d.getUTCMinutes(),19,'Time 1 minutes');
    equal(d.getUTCSeconds(),28,'Time 1 seconds');

    // Extended form
    var d = new Date();
    Exhibit.DateTime.setIso8601Time(d,"12:19:28");
    equal(d.getUTCHours(),12,'Time 2 hours');
    equal(d.getUTCMinutes(),19,'Time 2 minutes');
    equal(d.getUTCSeconds(),28,'Time 2 seconds');

    // Unparseable
    raises(function(){var d = new Date(); Exhibit.DateTime.setIso8601Time(d,"34235")},'Time 3 raises');
});

test("setIso8601", function() {
    expect(12);

    // Extended form T delimited
    var d = new Date();
    Exhibit.DateTime.setIso8601(d,"2004-08-12T03:33:09Z");
    equal(d.getUTCHours(),3,'Date/time 1 hours');
    equal(d.getUTCMinutes(),33,'Date/time 1 minutes');
    equal(d.getUTCSeconds(),9,'Date/time 1 seconds');
    equal(d.getUTCFullYear(),2004,'Date/time 1 year');
    equal(d.getUTCMonth(),7,'Date/time 1 month');
    equal(d.getUTCDate(),12,'Date/time 1 day');

    // Extended form space delimited
    var d = new Date();
    Exhibit.DateTime.setIso8601(d,"2004-08-12 03:33:09Z");
    equal(d.getUTCHours(),3,'Date/time 1 hours');
    equal(d.getUTCMinutes(),33,'Date/time 1 minutes');
    equal(d.getUTCSeconds(),9,'Date/time 1 seconds');
    equal(d.getUTCFullYear(),2004,'Date/time 1 year');
    equal(d.getUTCMonth(),7,'Date/time 1 month');
    equal(d.getUTCDate(),12,'Date/time 1 day');
});

test("parseIso8601DateTime", function() {
    // Method is just an object-creation wrapper around setIso8601,
    // so we can keep tests to a minimum to show coverage
    expect(1);

    var d = Exhibit.DateTime.parseIso8601DateTime("2004-08-12T03:33:09Z");
    equal(d.getUTCHours(),3,'Parse Date/time 1 hours');
});

test("parseGregorianDateTime", function() {
    expect(2);

    var d = Exhibit.DateTime.parseGregorianDateTime('181 BC');
    equal(d.getUTCFullYear(), -180, 'Parse Gregorian Date/time 1 year');

    var d = Exhibit.DateTime.zeroTimeUTC(Exhibit.DateTime.parseGregorianDateTime('1982/04/13'));
    equal(d.valueOf(),Exhibit.DateTime.zeroTimeUTC(new Date("1982/04/13")).valueOf(),"Parse Gregorian Date/time 2");
});

test("roundDownToInterval", function() {
    expect(10);

    var round = Exhibit.DateTime.roundDownToInterval;

    // Start here, then progressively round it down
    var d = new Date("1993/02/23 18:45:09 -00:00");
    d.setUTCMilliseconds(123);

    // Expected round-downs for multiple=10, no offset, sunday as first day of week
    var mils_date = new Date("1993/02/23 18:45:09 -00:00");
    mils_date.setUTCMilliseconds(120);
    var d_round_mils_10 = mils_date.valueOf();
    var d_round_sec_10 = new Date("1993/02/23 18:45:00 -00:00").valueOf();
    var d_round_min_10 = new Date("1993/02/23 18:40 -00:00").valueOf();
    var d_round_hour_10 = new Date("1993/02/23 10:00 -00:00").valueOf();
    var d_round_day_10 = Exhibit.DateTime.zeroTimeUTC(new Date("1993/02/20")).valueOf();
    //var d_round_week_10 = Exhibit.DateTime.zeroTimeUTC(new Date("1992/12/13")).valueOf();
    var d_round_month_10 = Exhibit.DateTime.zeroTimeUTC(new Date("1993/01/01")).valueOf();
    var d_round_year_10 = Exhibit.DateTime.zeroTimeUTC(new Date("1990/01/01")).valueOf();
    // multiple=1 for the big guys
    var d_round_decade = Exhibit.DateTime.zeroTimeUTC(new Date("1990/01/01")).valueOf();
    var d_round_century = Exhibit.DateTime.zeroTimeUTC(new Date("1900/01/01")).valueOf();
    var d_round_mill = Exhibit.DateTime.zeroTimeUTC(new Date("1000/01/01")).valueOf();

    round(d,Exhibit.DateTime.MILLISECOND,0,10,0);
    equal(d.valueOf(),d_round_mils_10,"Millisecond round down");

    round(d,Exhibit.DateTime.SECOND,0,10,0);
    equal(d.valueOf(),d_round_sec_10,"Second round down");

    round(d,Exhibit.DateTime.MINUTE,0,10,0);
    equal(d.valueOf(),d_round_min_10,"Minute round down");

    round(d,Exhibit.DateTime.HOUR,0,10,0);
    equal(d.valueOf(),d_round_hour_10,"Hour round down");

    round(d,Exhibit.DateTime.DAY,0,10,0);
    equal(d.valueOf(),d_round_day_10,"Day round down");

    //round(d,Exhibit.DateTime.WEEK,0,10,0);
    //equal(d.valueOf(),d_round_week_10,"Week round down");

    round(d,Exhibit.DateTime.MONTH,0,10,0);
    equal(d.valueOf(),d_round_month_10,"Month round down");

    round(d,Exhibit.DateTime.YEAR,0,10,0);
    equal(d.valueOf(),d_round_year_10,"Year round down");

    round(d,Exhibit.DateTime.DECADE,0,0,0);
    equal(d.valueOf(),d_round_decade,"Decade round down");

    round(d,Exhibit.DateTime.CENTURY,0,0,0);
    equal(d.valueOf(),d_round_century,"Century round down");

    round(d,Exhibit.DateTime.MILLENNIUM,0,10,0);
    equal(d.valueOf(),d_round_mill,"Millennium round down");
});

test("roundUpToInterval", function() {
    expect(5);

    var round = Exhibit.DateTime.roundUpToInterval;

    // Start here, then progressively round it up
    var d = new Date("1993/02/23 18:45:09 -00:00");
    d.setUTCMilliseconds(123);

    // Expected round-ups for multiple=10, no offset, sunday as first day of week
    var mils_date = new Date("1993/02/23 18:45:09 -00:00");
    mils_date.setUTCMilliseconds(130);
    var d_round_mils_10 = mils_date.valueOf();
    var d_round_sec_10 = new Date("1993/02/23 18:45:10 -00:00").valueOf();
    var d_round_min_10 = new Date("1993/02/23 18:50 -00:00").valueOf();
    var d_round_hour_10 = new Date("1993/02/23 20:00 -00:00").valueOf();
    var d_round_day_10 = Exhibit.DateTime.zeroTimeUTC(new Date("1993/02/30")).valueOf();
    //var d_round_week_10 = Exhibit.DateTime.zeroTimeUTC(new Date("1993/02/23")).valueOf();
    var d_round_month_10 = Exhibit.DateTime.zeroTimeUTC(new Date("1993/10/01")).valueOf();
    var d_round_year_10 = Exhibit.DateTime.zeroTimeUTC(new Date("2000/01/01")).valueOf();

    round(d,Exhibit.DateTime.MILLISECOND,0,10,0);
    equal(d.valueOf(),d_round_mils_10,"Millisecond round up");

    round(d,Exhibit.DateTime.SECOND,0,10,0);
    equal(d.valueOf(),d_round_sec_10,"Second round up");

    round(d,Exhibit.DateTime.MINUTE,0,10,0);
    equal(d.valueOf(),d_round_min_10,"Minute round up");

    round(d,Exhibit.DateTime.HOUR,0,10,0);
    equal(d.valueOf(),d_round_hour_10,"Hour round up");

    round(d,Exhibit.DateTime.DAY,0,10,0);
    equal(d.valueOf(),d_round_day_10,"Day round up");

    //round(d,Exhibit.DateTime.WEEK,0,10,0);
    //equal(d.valueOf(),d_round_week_10,"Week round up");

    round(d,Exhibit.DateTime.MONTH,0,10,0);
    //equal(d.valueOf(),d_round_month_10,"Month round up");

    round(d,Exhibit.DateTime.YEAR,0,10,0);
    //equal(d.valueOf(),d_round_year_10,"Year round up");
});

test("incrementByInterval", function() {
    expect(8);

    var inc = Exhibit.DateTime.incrementByInterval;

    // Start here, then progressively round it up
    var d = new Date("1993/02/23 18:45:09 -00:00");
    d.setUTCMilliseconds(123);

    // Expected results. Increments are cumulative.
    var mils_date = new Date("1993/02/23 18:45:09 -00:00");
    mils_date.setUTCMilliseconds(124);
    var d_inc_mils = mils_date.valueOf();
    var d_inc_sec = new Date("1993/02/23 18:45:10 -00:00").setMilliseconds(124).valueOf();
    var d_inc_min = new Date("1993/02/23 18:46:10 -00:00").setMilliseconds(124).valueOf();
    var d_inc_hour = new Date("1993/02/23 19:46:10 -00:00").setMilliseconds(124).valueOf();
    var d_inc_day = new Date("1993/02/24 19:46:10 -00:00").setMilliseconds(124).valueOf();
    var d_inc_week = new Date("1993/03/03 19:46:10 -00:00").setMilliseconds(124).valueOf();
    var d_inc_month = new Date("1993/04/03 19:46:10 -00:00").setMilliseconds(124).valueOf();
    var d_inc_year = new Date("1994/04/03 19:46:10 -00:00").setMilliseconds(124).valueOf();

    inc(d,Exhibit.DateTime.MILLISECOND,0);
    equal(d.valueOf(),d_inc_mils,"Millisecond increment");

    inc(d,Exhibit.DateTime.SECOND,0);
    equal(d.valueOf(),d_inc_sec,"Second increment");

    inc(d,Exhibit.DateTime.MINUTE,0);
    equal(d.valueOf(),d_inc_min,"Minute increment");

    inc(d,Exhibit.DateTime.HOUR,0);
    equal(d.valueOf(),d_inc_hour,"Hour increment");

    inc(d,Exhibit.DateTime.DAY,0);
    equal(d.valueOf(),d_inc_day,"Day increment");

    inc(d,Exhibit.DateTime.WEEK,0);
    equal(d.valueOf(),d_inc_week,"Week increment");

    inc(d,Exhibit.DateTime.MONTH,0);
    equal(d.valueOf(),d_inc_month,"Month increment");

    inc(d,Exhibit.DateTime.YEAR,0);
    equal(d.valueOf(),d_inc_year,"Year increment");
});

test("removeTimeZoneOffset", function() {
    // expect();
});

test("getTimezone", function() {
    // NB, this is a bit awkward to test; the user's timezone offset is
    // dependent on the user's location.

    expect(1);

    var tz = new Date().getTimezoneOffset();

    strictEqual(Exhibit.DateTime.getTimezone(), tz / -60, "Facile timezone test");
});
