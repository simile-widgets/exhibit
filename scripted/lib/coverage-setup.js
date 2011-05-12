/**
 * @fileOverview Coverage setup.
 */

load("lib/env.rhino.js");


Envjs({
    scriptTypes: {
        "": true,
        "text/javascript": true,
        "text/envjs": false
    },
    afterScriptLoad: {
        "qunit\.js": function() {
            QUnit.done = function(obj) {

                console.log("Coverage report written.");
            };
        }
    }
});
