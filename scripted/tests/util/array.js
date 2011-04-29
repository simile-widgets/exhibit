module("Array");

test("indexOf", function() {
    expect(4);

    var objA = ['a', 'b', 'c'];

    strictEqual(objA.indexOf('a'), 0, "['a', 'b', 'c'].indexOf('a') === 0");
    strictEqual(objA.indexOf('d'), -1, "['a', 'b', 'c'].indexOf('d') === -1");
    strictEqual(objA.indexOf('a', 1), -1, "['a', 'b', 'c'].indexOf('d', 1) === -1");
    strictEqual(objA.indexOf('c', "1"), 2, "['a', 'b', 'c'].indexOf('c', 1) === 2");
});

test("filter", function() {
    expect(3);

    var objA = ['a', 'b', 'c'];
    var objB = ['c', 'd'];
    var fun = function(v, i, arr) {
        return (v === 'b');
    };

    deepEqual(objA.filter(fun), ['b'], "Filter array");
    deepEqual(objA.filter(fun).filter(fun), ['b'], "Double filter array");
    deepEqual(objB.filter(fun), [], "Filter array to empty");
});

test("forEach", function() {
    expect(1);

    var objA = ['a', 'b', 'c'];
    var strA = "";
    var strB = "abc";
    var fun = function(v, i, arr) {
        strA += v;
    };

    objA.forEach(fun);

    strictEqual(strA, strB, "Array forEach to build a string");
});

test("map", function() {
    expect(2);

    var objA = [1, 2, 3];
    var objB = [2, 4, 6];
    var objC = [4, 8, 12];
    var fun = function(v, i, arr) {
        return v*2;
    };

    deepEqual(objA.map(fun), objB, "Array map");
    deepEqual(objA.map(fun).map(fun), objC, "Array double map");
});
