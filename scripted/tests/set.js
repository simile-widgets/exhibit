module("Exhibit.Set");

test("constructor", function() {
    expect(6);
    equal((new Exhibit.Set()).size(), 0, "Exhibit.Set() === Exhibit.Set([])");
    equal((new Exhibit.Set(undefined)).size(), 0, "Exhibit.Set(undefined) === Exhibit.Set([])");
    equal((new Exhibit.Set(null)).size(), 0, "Exhibit.Set(null) === Exhibit.Set([])");
    equal((new Exhibit.Set("")).size(), 0, "Exhibit.Set('') === Exhibit.Set([])");

    var members = ["a", "b"];
    var obj = new Exhibit.Set(members);
    equal(obj.size(), 2, "Exhibit.Set([]) (add)");
    equal((new Exhibit.Set(obj)).size(), 2, "Exhibit.Set(Exhibit.Set) (addSet)");
});

test("add", function() {
    expect(4);
    var member = "a";
    var obj = new Exhibit.Set();

    ok(obj.add(member), "Exhibit.Set.add({})");
    equal(obj.size(), 1, "Exhibit.Set.size()");
    ok(!obj.add(member), "!Exhibit.Set.add({})");
    equal(obj.size(), 1, "Exhibit.Set.size()");
});
