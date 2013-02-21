/**
 * Parse incoming query parameters into module names.
 * Then run only those modules.
 * see post.js
 */
var Modules = {
    tests: {
        'String': 'util/string.js',
        'Exhibit.Set': 'util/set.js',
        'Exhibit.Util': 'util/util.js',
        'Exhibit.Util.HTML': 'util/html.js',
        'Exhibit.DateTime': 'util/date-time.js',
        'Exhibit.NativeDateUnit': 'util/units.js',
        'Exhibit.Persistence': 'util/persistence.js',
        'Exhibit.History': 'util/history.js',
        'Exhibit.Bookmark': 'util/bookmark.js',
        'Exhibit.Database': 'data/database.js'
    },
    args: [],
    all: {},
    name: null
};

Modules.loadScript = function(url) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', url);
    head.appendChild(script);
};

if (typeof Envjs !== "undefined" && window.location.protocol === "file:") {
    Modules.loadScript("file://" + Envjs.tmpdir + "qunitargs");
}

if (typeof Modules.original !== "undefined" && Modules.original !== '') {
    Modules.args = Modules.original.split('&');
}
