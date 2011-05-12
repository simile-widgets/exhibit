/**
 * @fileOverview Coverage setup.
 */

load("lib/env.rhino.js");
load("lib/jscoverage-report.js");

Envjs({
    scriptTypes: {
        "": true,
        "text/javascript": true,
        "text/envjs": false
    },
    afterScriptLoad: {
        "qunit\.js": function() {
            QUnit.done = function(obj) {
                jscoverage_store();
                console.log("Coverage report written.");
            };
        }
    }
});
