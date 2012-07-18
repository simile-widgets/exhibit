module("Exhibit.Set");

test("constructor", function() {
    expect(6);

    equal((new Exhibit.Set()).size(), 0, "Exhibit.Set() === Exhibit.Set([])");
    equal((new Exhibit.Set(undefined)).size(), 0, "Exhibit.Set(undefined) === Exhibit.Set([])");
    equal((new Exhibit.Set(null)).size(), 0, "Exhibit.Set(null) === Exhibit.Set([])");
    equal((new Exhibit.Set("")).size(), 0, "Exhibit.Set('') === Exhibit.Set([])");

    var members = ["a"];
    var obj = new Exhibit.Set(members);
    equal(obj.size(), 1, "Exhibit.Set([]) (add)");
    equal((new Exhibit.Set(obj)).size(), 1, "Exhibit.Set(Exhibit.Set) (addSet)");
});

test("add", function() {
    expect(10);

    var member = "a";
    var member2 = 1;
    var member3 = false;
    var obj = new Exhibit.Set();

    ok(obj.add(member), "Exhibit.Set.add('a')");
    equal(obj.size(), 1, "Exhibit.Set.size()");
    ok(!obj.add(member), "!Exhibit.Set.add('a')");
    equal(obj.size(), 1, "Exhibit.Set.size()");
    ok(!obj.add(undefined), "!Exhibit.Set.add(undefined)");
    ok(!obj.add(null), "!Exhibit.Set.add(null)");
    ok(!obj.add([]), "!Exhibit.Set.add([])");
    ok(obj.add(member2), "Exhibit.Set.add(1)");
    ok(obj.add(member3), "Exhibit.Set.add(false)");
    equal(obj.size(), 3, "Exhibit.Set.size()");
});

test("addSet", function() {
    expect(3);

    var objA = new Exhibit.Set(["a"]);
    var obj1 = new Exhibit.Set([1]);
    var obj2 = new Exhibit.Set([1]);
    var obj3 = new Exhibit.Set([1, 2]);

    objA.addSet(obj1);
    equal(objA.size(), 2, "Exhibit.Set(['a']).addSet(Exhibit.Set[1])");

    objA.addSet(obj2);
    equal(objA.size(), 2, "Exhibit.Set(['a', 1]).addSet(Exhibit.Set[1])");

    objA.addSet(obj3);
    equal(objA.size(), 3, "Exhibit.Set(['a', 1]).addSet(Exhibit.Set[1, 2])");
});

test("remove", function() {
    expect(5);

    var objA = new Exhibit.Set(['a']);
    ok(!objA.remove('b'), "Exhibit.Set(['a']).remove('b')");
    equal(objA.size(), 1, "Exhibit.Set(['a']).remove('b') size");
    ok(objA.remove('a'), "Exhibit.Set(['a']).remove('a')");
    equal(objA.size(), 0, "Exhibit.Set(['a']).remove('a') size");
    ok(!objA.remove('a'), "Repeat removal");
});

test("removeSet", function() {
    expect(3);

    var objA = new Exhibit.Set(['a', 'b', 'c']);
    var objB = new Exhibit.Set(['b', 'c']);
    var objC = new Exhibit.Set(['d']);

    objA.removeSet(objB);
    equal(objA.size(), 1, "Partial removal");
    objA.removeSet(objB);
    equal(objA.size(), 1, "Repeat removal");
    objA.removeSet(objC);
    equal(objA.size(), 1, "Non-removal");
});

test("retainSet", function() {
    expect(3);

    var objA = new Exhibit.Set(['a', 'b', 'c']);
    var objB = new Exhibit.Set(['b', 'c']);
    var objC = new Exhibit.Set(['d']);

    objA.retainSet(objB);
    equal(objA.size(), 2, "Partial intersection");
    objA.retainSet(objB);
    equal(objA.size(), 2, "Repeat intersection");
    objB.retainSet(objC);
    equal(objB.size(), 0, "Empty intersection");
});

test("contains", function() {
    expect(3);

    var member = 'a';
    var member2 = false;
    var nonmember = 'b';
    var obj = new Exhibit.Set([member, member2]);

    ok(obj.contains(member), "Exhibit.Set(['a', false]).contains('a')");
    ok(!obj.contains(nonmember), "Exhibit.Set(['a', false]).contains('b')");
    ok(obj.contains(member2), "Exhibit.Set['a', false]).contains(false)");
});

test("toArray", function() {
    expect(4);

    var original = ['a', 'b'];
    var obj = new Exhibit.Set(original);

    equal(typeof obj.toArray(), "object", "Exhibit.Set().toArray() type");
    ok(obj.toArray().hasOwnProperty('length'), "Exhibit.Set().toArray() property");
    equal(obj.toArray().length, 2, "Exhibit.Set().toArray().length");
    deepEqual(obj.toArray(), original, "Exhibit.Set().toArray() value comparison");
});

test("size", function() {
    expect(2);

    var objA = new Exhibit.Set(['a', 'b']);
    var objB = new Exhibit.Set();

    equal(objA.size(), 2, "Exhibit.Set(['a', 'b']).size()");
    equal(objB.size(), 0, "Exhibit.Set().size()");
});

test("visit", function() {
    expect(1);

    var visited = {};
    var objA = new Exhibit.Set(['a', 'b', 'c']);
    var stop = 'b';
    var visitor = function(member) {
        visited[member] = true;
        if (member === stop) {
            return true;
        }
    };
    objA.visit(visitor);

    ok((stop in visited), "Visitor function visited stopping member");
});

test("createIntersection", function() {
    expect(4);

    var objA = new Exhibit.Set(['a', 'b', 'c']);
    var objB = new Exhibit.Set(['b', 'c', 'd']);
    var objC = new Exhibit.Set(['b', 'c']);
    var objD = new Exhibit.Set(['e']);
    var objE = new Exhibit.Set(['b', 'c', 'e']);
    var objF = Exhibit.Set.createIntersection(objA, objB);
    var objG = Exhibit.Set.createIntersection(objA, objB, objD);
    var objH = Exhibit.Set.createIntersection(objB, objA);
    var objI = Exhibit.Set.createIntersection(objC, objB);

    deepEqual(objF, objC, "Create intersection into new set");
    deepEqual(objG, objE, "Create intersection into existing set");
    deepEqual(objF, objH, "Argument order does not influence outcome");
    deepEqual(objI, objC, "Smaller first argument set");
});
