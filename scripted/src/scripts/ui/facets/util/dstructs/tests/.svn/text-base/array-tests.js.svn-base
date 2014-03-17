function setUp() {
    testArray = new DStructs.Array(1, 2, 3, 1);
}

function testSlice() {
    assertEquals("Wrong length!", testArray.slice(0, 1).length, 1);
}

function testConcat() {
    testArray.concat([4, 5, 6]);
    assertEquals("Wrong length!", testArray.length, 7);
}

function testReduce() {
    var add = function(a, b) { return a + b; };
    var acc = function(a, b) { a.push(b); return a; };
    assertEquals("Incorrect sum!", testArray.reduce(0, add), 7);
    assertEquals("Incorrect array!", testArray.reduce([], acc).length, 4);
}

function testIndexOf() {
    assertEquals("Incorrect index!", testArray.indexOf(2), 1);
    assertEquals("Incorrect index!", testArray.indexOf(1), 0);
    assertEquals("Incorrect index!", testArray.indexOf(22), -1);
}

function testIndicesOf() {
    assertEquals("Wrong number of indices!", testArray.indicesOf(1).length, 2);
}
