module("Exhibit.DateTime");

zero_time = function(d) {
    d.setUTCHours(0);
    d.setUTCMinutes(0);
    d.setUTCSeconds(0);
    d.setUTCMilliseconds(0);
    return d;
};

test("setIso8601Date", function() {
    expect(19);

    // Check some gdates
    var d = new Date();
    Exhibit.DateTime.setIso8601Date(d,"2011-05-01");
    equal(2011,d.getUTCFullYear(),'Date 1 year');
    equal(4,d.getUTCMonth(),'Date 1 month');
    equal(1,d.getUTCDate(),'Date 1 day');

    var d = new Date();
    Exhibit.DateTime.setIso8601Date(d,"2011-12-31");
    equal(2011,d.getUTCFullYear(),'Date 2 year');
    equal(11,d.getUTCMonth(),'Date 2 month');
    equal(31,d.getUTCDate(),'Date 2 day');

    var d = new Date();
    Exhibit.DateTime.setIso8601Date(d,"2000-02-29");
    equal(2000,d.getUTCFullYear(),'Date 3 year');
    equal(1,d.getUTCMonth(),'Date 3 month');
    equal(29,d.getUTCDate(),'Date 3 day');

    // Date overflow
    var d = new Date();
    Exhibit.DateTime.setIso8601Date(d,"1999-12-32");
    equal(2000,d.getUTCFullYear(),'Date 4 year');
    equal(0,d.getUTCMonth(),'Date 4 month');
    equal(1,d.getUTCDate(),'Date 4 day');

    var d = new Date();
    Exhibit.DateTime.setIso8601Date(d,"1900-02-29");
    equal(1900,d.getUTCFullYear(),'Date 5 year');
    equal(2,d.getUTCMonth(),'Date 5 month');
    equal(1,d.getUTCDate(),'Date 5 day');

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
    equal(12,d.getUTCHours(),'Time 1 hours');
    equal(19,d.getUTCMinutes(),'Time 1 minutes');
    equal(28,d.getUTCSeconds(),'Time 1 seconds');

    // Extended form
    var d = new Date();
    Exhibit.DateTime.setIso8601Time(d,"12:19:28");
    equal(12,d.getUTCHours(),'Time 2 hours');
    equal(19,d.getUTCMinutes(),'Time 2 minutes');
    equal(28,d.getUTCSeconds(),'Time 2 seconds');

    // Fractional time
    // until requirements are clearer
    //var d = new Date()
    //Exhibit.DateTime.setIso8601Time(d,"08:29,5")
    //equal(8,d.getHours())
    //equal(29,d.getMinutes())
    //equal(30,d.getSeconds())

    //var d = new Date()
    //Exhibit.DateTime.setIso8601Time(d,"08:29.5")
    //equal(8,d.getHours())
    //equal(29,d.getMinutes())
    //equal(30,d.getSeconds())

    // Unparseable
    raises(function(){var d = new Date(); Exhibit.DateTime.setIso8601Time(d,"34235")},'Time 3 raises');
});

test("setIso8601", function() {
    expect(12);

    // Extended form T delimited
    var d = new Date();
    Exhibit.DateTime.setIso8601(d,"2004-08-12T03:33:09Z");
    equal(3,d.getUTCHours(),'Date/time 1 hours');
    equal(33,d.getUTCMinutes(),'Date/time 1 minutes');
    equal(9,d.getUTCSeconds(),'Date/time 1 seconds');
    equal(2004,d.getUTCFullYear(),'Date/time 1 year');
    equal(7,d.getUTCMonth(),'Date/time 1 month');
    equal(12,d.getUTCDate(),'Date/time 1 day');

    // Extended form space delimited
    var d = new Date();
    Exhibit.DateTime.setIso8601(d,"2004-08-12 03:33:09Z");
    equal(3,d.getUTCHours(),'Date/time 1 hours');
    equal(33,d.getUTCMinutes(),'Date/time 1 minutes');
    equal(9,d.getUTCSeconds(),'Date/time 1 seconds');
    equal(2004,d.getUTCFullYear(),'Date/time 1 year');
    equal(7,d.getUTCMonth(),'Date/time 1 month');
    equal(12,d.getUTCDate(),'Date/time 1 day');
});

test("parseIso8601DateTime", function() {
    // Method is just an object-creation wrapper around setIso8601,
    // so we can keep tests to a minimum to show coverage
    expect(1);

    var d = Exhibit.DateTime.parseIso8601DateTime("2004-08-12T03:33:09Z");
    equal(3,d.getUTCHours(),'Parse Date/time 1 hours');
});

test("parseGregorianDateTime", function() {
    expect(2);

    var d = Exhibit.DateTime.parseGregorianDateTime('181 BC');
    equal(-181,d.getFullYear(),'Parse Gregorian Date/time 1 year');

    var d = zero_time(Exhibit.DateTime.parseGregorianDateTime('1982/04/13'));
    equal(d.valueOf(),zero_time(new Date("1982/04/13")).valueOf(),"Parse Gregorian Date/time 2");
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
    var d_round_day_10 = zero_time(new Date("1993/02/20")).valueOf();
    //var d_round_week_10 = zero_time(new Date("1992/12/13")).valueOf();
    var d_round_month_10 = zero_time(new Date("1993/01/01")).valueOf();
    var d_round_year_10 = zero_time(new Date("1990/01/01")).valueOf();
    // multiple=1 for the big guys
    var d_round_decade = zero_time(new Date("1990/01/01")).valueOf();
    var d_round_century = zero_time(new Date("1900/01/01")).valueOf();
    var d_round_mill = zero_time(new Date("1000/01/01")).valueOf();

    round(d,Exhibit.DateTime.MILLISECOND,0,10,0);
    equal(d_round_mils_10,d.valueOf(),"Millisecond round down");

    round(d,Exhibit.DateTime.SECOND,0,10,0);
    equal(d_round_sec_10,d.valueOf(),"Second round down");

    round(d,Exhibit.DateTime.MINUTE,0,10,0);
    equal(d_round_min_10,d.valueOf(),"Minute round down");

    round(d,Exhibit.DateTime.HOUR,0,10,0);
    equal(d_round_hour_10,d.valueOf(),"Hour round down");

    round(d,Exhibit.DateTime.DAY,0,10,0);
    equal(d_round_day_10,d.valueOf(),"Day round down");

    //round(d,Exhibit.DateTime.WEEK,0,10,0);
    //equal(d_round_week_10,d.valueOf(),"Week round down");

    round(d,Exhibit.DateTime.MONTH,0,10,0);
    equal(d_round_month_10,d.valueOf(),"Month round down");

    round(d,Exhibit.DateTime.YEAR,0,10,0);
    equal(d_round_year_10,d.valueOf(),"Year round down");

    round(d,Exhibit.DateTime.DECADE,0,0,0);
    equal(d_round_decade,d.valueOf(),"Decade round down");

    round(d,Exhibit.DateTime.CENTURY,0,0,0);
    equal(d_round_century,d.valueOf(),"Century round down");

    round(d,Exhibit.DateTime.MILLENNIUM,0,10,0);
    equal(d_round_mill,d.valueOf(),"Millennium round down");
});

test("roundUpToInterval", function() {
    //expect(6);

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
    var d_round_day_10 = zero_time(new Date("1993/02/30")).valueOf();
    //var d_round_week_10 = zero_time(new Date("1993/02/23")).valueOf();
    var d_round_month_10 = zero_time(new Date("1993/10/01")).valueOf();
    var d_round_year_10 = zero_time(new Date("2010/01/01")).valueOf();

    round(d,Exhibit.DateTime.MILLISECOND,0,10,0);
    //equal(d_round_mils_10,d.valueOf(),"Millisecond round up");

    round(d,Exhibit.DateTime.SECOND,0,10,0);
    //equal(d_round_sec_10,d.valueOf(),"Second round up");

    round(d,Exhibit.DateTime.MINUTE,0,10,0);
    //equal(d_round_min_10,d.valueOf(),"Minute round up");

    round(d,Exhibit.DateTime.HOUR,0,10,0);
    //equal(d_round_hour_10,d.valueOf(),"Hour round up");

    round(d,Exhibit.DateTime.DAY,0,10,0);
    //equal(d_round_day_10,d.valueOf(),"Day round up");

    //round(d,Exhibit.DateTime.WEEK,0,10,0);
    //equal(d_round_week_10,d.valueOf(),"Week round up");

    round(d,Exhibit.DateTime.MONTH,0,10,0);
    //equal(d_round_month_10,d.valueOf(),"Month round up");

    round(d,Exhibit.DateTime.YEAR,0,10,0);
    //equal(d_round_year_10,d.valueOf(),"Year round up");
});

test("incrementByInterval", function() {
    // expect();

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
    equal(d_inc_mils,d.valueOf(),"Millisecond increment");

    inc(d,Exhibit.DateTime.SECOND,0);
    equal(d_inc_sec,d.valueOf(),"Second increment");

    inc(d,Exhibit.DateTime.MINUTE,0);
    equal(d_inc_min,d.valueOf(),"Minute increment");

    inc(d,Exhibit.DateTime.HOUR,0);
    equal(d_inc_hour,d.valueOf(),"Hour increment");

    inc(d,Exhibit.DateTime.DAY,0);
    equal(d_inc_day,d.valueOf(),"Day increment");

    inc(d,Exhibit.DateTime.WEEK,0);
    equal(d_inc_week,d.valueOf(),"Week increment");

    inc(d,Exhibit.DateTime.MONTH,0);
    equal(d_inc_month,d.valueOf(),"Month increment");

    inc(d,Exhibit.DateTime.YEAR,0);
    equal(d_inc_year,d.valueOf(),"Year increment");
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
