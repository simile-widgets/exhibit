module("Exhibit.Database", {
    "setup": function() {
        this.indexA = {
            "a": {
                "b": ["c"]
            }
        };
        this.indexB = {
            "a": {
            }
        };
        this.indexC = {};
    },
    "teardown": function() {
        this.testIndex = null;
    }
});

test("create", function() {
    //expect();
});

test("_indexPut", function() {
    //expect();

    Exhibit.Database._indexPut(this.indexB, "a", "b", "c");
    deepEqual(this.indexB, this.indexA, "Put a new value and new secondary key into a mostly empty index");

    Exhibit.Database._indexPut(this.indexA, "a", "b", "c");
    deepEqual(this.indexA["a"]["b"], [ "c" ], "Attempt to put an existent value results in no change");

    Exhibit.Database._indexPut(this.indexA, "a", "b", "d");
    deepEqual(this.indexA["a"]["b"], [ "c", "d" ], "Put a new value in an existing array");

});

test("_indexPutList", function() {
    //expect();
});

test("_indexRemove", function() {
    //expect();
});

test("_indexRemoveList", function() {
    //expect();
});
