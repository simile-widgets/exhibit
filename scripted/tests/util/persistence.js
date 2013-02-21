module("Exhibit.Persistence");

test("getBaseURL", function() {
    expect(6);

    equal(Exhibit.Persistence.getBaseURL(""), document.location.href.substr(0, document.location.href.lastIndexOf("/")+1), "Base of empty string");
    equal(Exhibit.Persistence.getBaseURL("index.html"), document.location.href.substr(0, document.location.href.lastIndexOf("/")+1), "Base of relative path relative URL");
    equal(Exhibit.Persistence.getBaseURL(""), document.location.href.substr(0, document.location.href.lastIndexOf("/")+1), "Base of empty string");
    equal(Exhibit.Persistence.getBaseURL("/"), document.location.protocol + "//" + document.location.host + "/", "Base of absolute path relative URL");
    equal(Exhibit.Persistence.getBaseURL("http://example.com/path/file"), "http://example.com/path/", "Base of absolute URL");
    equal(Exhibit.Persistence.getBaseURL("http://example.com/path/file?query#hash"), "http://example.com/path/", "Base of absolute URL with query and hash");
});

test("resolveURL", function() {
    expect(3);

    equal(Exhibit.Persistence.resolveURL("http://example.com/path/"), "http://example.com/path/", "Resolve absolute URL"); 
    equal(Exhibit.Persistence.resolveURL("/path/"), document.location.protocol + "//" + document.location.host + "/path/", "Resolve absolute path relative URL"); 
    equal(Exhibit.Persistence.resolveURL("file"), document.location.href.substr(0, document.location.href.lastIndexOf("/")+1) + "file", "Resolve relative path relative URL"); 
});

test("getURLWithoutQueryAndHash", function() {
    //expect();

    // A bit difficult to test properly, depends on document.location value
    // which, as of this writing, does not include a query or hash.
});

test("getURLWithoutQuery", function() {
    //expect();

    // A bit difficult to test properly, depends on document.location value
    // which, as of this writing, does not include a query or hash.
});

test("getItemLink", function() {
    expect(2);

    // depends on getURLWithoutQueryAndHash working
    var url = Exhibit.Persistence.getURLWithoutQueryAndHash();

    equal(Exhibit.Persistence.getItemLink("A"), url + "#A", "Item link for item A"); 
    equal(Exhibit.Persistence.getItemLink("A&B"), url + "#A%26B", "Item link for item A&B"); 
});
