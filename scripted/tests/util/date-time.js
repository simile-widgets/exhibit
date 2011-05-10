module("Exhibit.DateTime");

test("setIso8601Date", function() {
    // expect();
});

test("setIso8601Time", function() {
    // expect();
});

test("setIso8601", function() {
    // expect();
});

test("parseIso8601DateTime", function() {
    // expect();
});

test("parseGregorianDateTime", function() {
    // expect();
});

test("roundDownToInterval", function() {
    // expect();
});

test("roundUpToInterval", function() {
    // expect();
});

test("incrementByInterval", function() {
    // expect();
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
