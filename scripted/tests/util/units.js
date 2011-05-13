module("Exhibit.NativeDateUnit");

test("makeDefaultValue", function() {
    expect(1);

    var obj = Exhibit.NativeDateUnit.makeDefaultValue();

    ok(obj instanceof Date, "Check instance of constructor function");
});

test("cloneValue", function() {
    expect(4);

    var obj = new Date();

    strictEqual(Exhibit.NativeDateUnit.cloneValue(obj).getTime(), obj.getTime(), "Cloned time equals original");
    notEqual(Exhibit.NativeDateUnit.cloneValue(obj), obj, "Cloned object not equal to original");
    deepEqual(Exhibit.NativeDateUnit.cloneValue(obj), obj, "Cloned object like original");
    notStrictEqual(Exhibit.NativeDateUnit.cloneValue(obj), obj, "Cloned object not the same as original");
});

test("getParser", function() {
    expect(7);

    strictEqual(typeof Exhibit.NativeDateUnit.getParser(), 'function', "typeof Exhibit.NativeDateUnit.getParser() === 'function'");
    deepEqual(Exhibit.NativeDateUnit.getParser(), Exhibit.DateTime.parseGregorianDateTime, "Exhibit.NativeDateUnit.getParser() equals Exhibit.DateTime.parseGregorianDateTime");
    notDeepEqual(Exhibit.NativeDateUnit.getParser(), Exhibit.DateTime.parseIso8601DateTime, "Exhibit.NativeDateUnit.getParser() !equals Exhibit.DateTime.parseIso8601DateTime");
    strictEqual(typeof Exhibit.NativeDateUnit.getParser('ISO8601'), 'function', "typeof Exhibit.NativeDateUnit.getParser('ISO8601') === 'function'");
    deepEqual(Exhibit.NativeDateUnit.getParser('ISO8601'), Exhibit.DateTime.parseIso8601DateTime, "Exhibit.NativeDateUnit.getParser('ISO8601') equals Exhibit.DateTime.parseIso8601DateTime");
    deepEqual(Exhibit.NativeDateUnit.getParser('iso 8601'), Exhibit.DateTime.parseIso8601DateTime, "Exhibit.NativeDateUnit.getParser('iso 8601') equals Exhibit.DateTime.parseIso8601DateTime");
    notDeepEqual(Exhibit.NativeDateUnit.getParser('ISO8601'), Exhibit.DateTime.parseGregorianDateTime, "Exhibit.NativeDateUnit.getParser() !equals Exhibit.DateTime.parseGregorianDateTime");
});

test("parseFromObject", function() {
    expect(4);

    var n = 0;
    var n2 = 1304992937000;
    var day = "Jan 01 1970 00:00:00 GMT";
    var day2 = "May 10 2011 02:02:17 GMT";
    var obj = new Date(n);
    var obj2 = new Date(n2);

    deepEqual(Exhibit.NativeDateUnit.parseFromObject(day), obj, "Exhibit.NativeDateUnit.parseFromObject('Jan 01 1970 00:00:00 GMT') == new Date(0)");
    deepEqual(Exhibit.NativeDateUnit.parseFromObject(obj), obj, "Exhibit.NativeDateUnit.parseFromObject(new Date(0)) == new Date(0)");
    deepEqual(Exhibit.NativeDateUnit.parseFromObject(day2), obj2, "Exhibit.NativeDateUnit.parseFromObject('May 10 2011 02:02:17 GMT') == new Date(1304992937000)");
    deepEqual(Exhibit.NativeDateUnit.parseFromObject(obj2), obj2, "Exhibit.NativeDateUnit.parseFromObject(new Date(1304992937000)) == new Date(1304992937000)");
});

test("toNumber", function() {
    expect(2);

    var n = 0;
    var n2 = Math.round(1000000000*Math.random())
    var obj = new Date(n);
    var obj2 = new Date(n2);

    equal(Exhibit.NativeDateUnit.toNumber(obj), n, "Exhibit.NativeDateUnit.toNumber(new Date(0)) == 0");
    equal(Exhibit.NativeDateUnit.toNumber(obj2), n2, "Random date to number");
});

test("fromNumber", function() {
    expect(2);

    var n = 0;
    var n2 = Math.round(1000000000*Math.random())
    var obj = new Date(n);
    var obj2 = new Date(n2);

    deepEqual(Exhibit.NativeDateUnit.fromNumber(n), obj, "Exhibit.NativeDateUnit.fromNumber(0) === new Date(0)");
    deepEqual(Exhibit.NativeDateUnit.fromNumber(n2), obj2, "Date from random number");
});

test("compare", function() {
    expect(5);

    var obj = new Date(0);
    var obj2 = new Date(1);

    ok(Exhibit.NativeDateUnit.compare(obj, obj2) < 0, "Exhibit.NativeDateUnit.compare(new Date(0), new Date(1)) < 0"); 
    ok(Exhibit.NativeDateUnit.compare(obj2, obj) > 0, "Exhibit.NativeDateUnit.compare(new Date(1), new Date(0)) > 0"); 
    strictEqual(Exhibit.NativeDateUnit.compare(obj, new Date(0)), 0, "Exhibit.NativeDateUnit.compare(new Date(0), new Date(0)) === 0"); 
    ok(Exhibit.NativeDateUnit.compare(0, 1000) < 0, "Exhibit.NativeDateUnit.compare(0, 1) < 0");
    ok(Exhibit.NativeDateUnit.compare("0", "1000") < 0, "Exhibit.NativeDateUnit.compare('0', '1000') < 0");
});

test("earlier", function() {
    expect(2);

    var obj = new Date(0);
    var obj2 = new Date(1);

    deepEqual(Exhibit.NativeDateUnit.earlier(obj, obj2), obj, "Exhibit.NativeDateUnit.earlier(new Date(0), new Date(1)) equals new Date(0)");
    deepEqual(Exhibit.NativeDateUnit.earlier(obj2, obj2), obj2, "!Exhibit.NativeDateUnit.earlier(new Date(1), new Date(1)) equals new Date(1)");
});

test("later", function() {
    expect(2);

    var obj = new Date(0);
    var obj2 = new Date(1);

    deepEqual(Exhibit.NativeDateUnit.later(obj, obj2), obj2, "Exhibit.NativeDateUnit.later(new Date(0), new Date(1)) equals new Date(1)");
    deepEqual(Exhibit.NativeDateUnit.later(obj, obj), obj, "!Exhibit.NativeDateUnit.later(new Date(0), new Date(0)) equals new Date(0)");
});

test("change", function() {
    expect(3);

    var obj = new Date(0);
    var obj2 = new Date(1);
    var obj3 = new Date(2);

    deepEqual(Exhibit.NativeDateUnit.change(obj2, 0), obj2, "Exhibit.NativeDateUnit.change(new Date(1), 0) equals new Date(1)");
    deepEqual(Exhibit.NativeDateUnit.change(obj2, 1), obj3, "Exhibit.NativeDateUnit.change(new Date(1), 1) equals new Date(2)");
    deepEqual(Exhibit.NativeDateUnit.change(obj2, -1), obj, "Exhibit.NativeDateUnit.change(new Date(1), -1) equals new Date(0)");
});
