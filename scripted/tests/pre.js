/**
 * Parse incoming query parameters into module names.
 * Then run only those modules.
 * see post.js
 */
var Modules = {
    tests: {
        'String': 'util/string.js',
        'Array': 'util/array.js',
        'Exhibit.Set': 'util/set.js',
        'Exhibit.Util': 'util/util.js',
        'Exhibit.Util.HTML': 'util/html.js'
    },
    args: [],
    all: {},
    name: null
};

Modules.loadScript = function(url) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    // @@@ Not ideal.  When Envjs does this right, drop this.
    if (typeof Envjs !== "undefined") {
        var prefix = '';
        if (url.indexOf('file:///') === -1) {
            prefix += "tests/";
        }
        script.text = "load('" + prefix + url + "')";
    } else {
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('src', url);
    }
    head.appendChild(script);
};

Modules.loadScript("file://" + Envjs.tmpdir + "qunitargs");
if (Modules.original !== '') {
    Modules.args = Modules.original.split('&');
}
