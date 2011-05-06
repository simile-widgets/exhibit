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
    // @@@
    // expect();
});

test("parseFromObject", function() {
    // @@@
    // expect();
});

test("toNumber", function() {
    // expect();
});

test("fromNumber", function() {
    // expect();
});

test("compare", function() {
    // expect();
});

test("earlier", function() {
    // expect();
});

test("later", function() {
    // expect();
});

test("change", function() {
    // expect();
});
