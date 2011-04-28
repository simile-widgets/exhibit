module("Exhibit.Util");

test("round", function() {
    expect(7);

    strictEqual(Exhibit.Util.round(10000.4), '10000', "Exhibit.Util.round(10000.4) === '10000'");
    strictEqual(Exhibit.Util.round(10001, 5000), '10000', "Exhibit.Util.round(10001, 5000) === '10000'");
    strictEqual(Exhibit.Util.round(10001, 5000.0), '10000', "Exhibit.Util.round(10001, 5000.0) === '10000'");
    strictEqual(Exhibit.Util.round(10000, 0.1), '10000.0', "Exhibit.Util.round(10000, 0.1) === '10000.0'");
    strictEqual(Exhibit.Util.round(0.1, 1e-12), '0.100000000000', "Exhibit.Util.round(0.1, 1e-12) === '0.100000000000'");
    strictEqual(Exhibit.Util.round(66000, 1024), '65536', "Exhibit.Util.round(66000, 1024) === '65536'");
    strictEqual(Exhibit.Util.round(0, 0.1), '0.0', "Exhibit.Util.round(0, 0.1) === '0.0'");
});
