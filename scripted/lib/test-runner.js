/**
 * @fileOverview Initiates Qunit test running.
 */

var args = arguments;

(function(){
    load('lib/test-setup.js');
    console.log("Starting QUnit tests...");
    // @@@ Passing args to the URL seems broken.  Delete the
    // following when it works the way it should.  See pre.js.
    if (Envjs.tmpdir[Envjs.tmpdir.length - 1] !== '/') {
        Envjs.tmpdir += '/';
    }
    Envjs.deleteFile(Envjs.uri(Envjs.tmpdir+"qunitargs"));
    Envjs.writeToFile("Modules.original = '" + args.join('&') + "';", Envjs.uri(Envjs.tmpdir+"qunitargs"));
    window.location = "tests/index.html";
    // Use this instead when it works.
    // + "?" + args.join('&');
})();
