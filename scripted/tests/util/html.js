module("Exhibit.Util.HTML");

test("deEntify", function() {
    expect(2);
    
    var orig = "A &amp;";
    var res = "A &";
    strictEqual(Exhibit.Util.HTML.deEntify(orig), res, "deEntify('A &amp;') === 'A &'");
    strictEqual(Exhibit.Util.HTML.deEntify(res), res, "deEntify('A &') === 'A &'");
});
