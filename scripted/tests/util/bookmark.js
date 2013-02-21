module("Exhibit.Bookmark");

test("generateBookmarkHash", function() {
    expect(8);

    equal(Exhibit.Bookmark.generateBookmarkHash(), '', 'Hash of empty argument');
    equal(Exhibit.Bookmark.generateBookmarkHash(undefined), '', 'Hash of undefined argument');
    equal(Exhibit.Bookmark.generateBookmarkHash(null), '', 'Hash of null argument');
    equal(Exhibit.Bookmark.generateBookmarkHash({}), '', 'Hash of dataless state');
    equal(Exhibit.Bookmark.generateBookmarkHash({data: null}), '', 'Hash of null data state');
    equal(Exhibit.Bookmark.generateBookmarkHash({data: {state: undefined}}), '', 'Hash of undefined state data');
    equal(Exhibit.Bookmark.generateBookmarkHash({data: {state: {}}}), 'eyJkYXRhIjp7InN0YXRlIjp7fX19', 'Hash of basic state object');
    equal(Exhibit.Bookmark.generateBookmarkHash({data: {state: {a: '\u00FF'}}}), 'eyJkYXRhIjp7InN0YXRlIjp7ImEiOiL_In19fQ==', 'Hash with non-alphanumeric characters included');
});

test("interpretBookmarkHash", function() {
    expect(4);

    equal(Exhibit.Bookmark.interpretBookmarkHash(''), null, 'Empty hash returns null');
    deepEqual(Exhibit.Bookmark.interpretBookmarkHash('e30='), {}, 'Empty object hash');
    deepEqual(Exhibit.Bookmark.interpretBookmarkHash('eyJkYXRhIjp7InN0YXRlIjp7fX19'), {data: {state: {}}}, 'Reverse of hash of basic state object');
    deepEqual(Exhibit.Bookmark.interpretBookmarkHash('eyJkYXRhIjp7InN0YXRlIjp7ImEiOiL_In19fQ=='), {data: {state: {a: '\u00FF'}}}, 'Reverse of hash with non-alphanumeric characters included');
});

test("generateBookmark", function() {
    // Note this test depends on the browser that runs it.  This is
    // an integration test, relying on Exhibit.History.

    expect(1);

    var location = document.location.href;

    equal(Exhibit.Bookmark.generateBookmark(), location, "Empty history test");

    // Change Exhibit.History state.
    // Test the resulting bookmark.
});

/**
test("implementBookmark", function() {
    // Note this test depends on the browser that runs it.  This is
    // an integration test, relying on Exhibit.History.

    // expect();

    // Pass in a hash.
    // Verify the state of History.getState() corresponds to the hash.
});
*/

/**
test("init", function() {
    // This wouldn't be so much a functional test as an integration test -
    // it runs implementBookmark when the page loads to interpret the current
    // location's bookmark.  This isn't really possible in this testing
    // infrastructure, QUnit is more functional than integration oriented.

    // Perhaps this will be folded into page initialization testing down
    // the road.
});
*/
