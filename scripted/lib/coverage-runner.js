/**
 * @fileOverview Initiates coverage reporting.
 */
var args = arguments;
(function(){
    load('lib/setup.js');
    console.log("Starting coverage reporting...");
    // @@@ Passing args to the URL seems broken.  Delete the
    // following when it works the way it should.  See pre.js.
    if (Envjs.tmpdir[Envjs.tmpdir.length - 1] !== '/') {
        Envjs.tmpdir += '/';
    }
    Envjs.deleteFile(Envjs.uri(Envjs.tmpdir+"qunitargs"));
    Envjs.writeToFile("Modules.original = '" + args.join('&') + "';", Envjs.uri(Envjs.tmpdir+"qunitargs"));
    window.location = "http://127.0.0.1:9876/build/instrument/src/jscoverage.html?w=../tests/index.html";
    // Use this instead when it works.
    // + "?" + args.join('&');
})();
