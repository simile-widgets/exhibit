/**
 * @fileOverview Coverage setup.
 */

load("lib/env.rhino.js");
load("lib/window.js");
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
                // Note that there are timing problems here.  The Env.js
                // methods takes a finite amount of time to go from a
                // setTimeout running to its removal from the queue, and
                // if window.close is called last, not all the timers will
                // have run their course.  Yes, it's weird.  Leave it be.
                window.close();
                console.log("Writing coverage report...");
                jscoverage_store();
                console.log("Coverage report written.");
            };
        }
    }
});
