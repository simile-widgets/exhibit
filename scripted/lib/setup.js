/**
 * @fileOverview Testing framework setup.
 * @seeAlso http://www.loose-bits.com/2011/02/browserless-ajax-testing-with-rhino-and.html
 */

load("lib/env.rhino.js");

Envjs({
    scriptTypes: {
        "": true,
        "text/javascript": true,
        "text/envjs": false
    },
    beforeScriptLoad: {
        "sharethis": function(script) {
            script.src = "";
            return false;
        },
        "gat": function(script) {
            script.src = "";
            return false;
        }
    },
    afterScriptLoad: {
        "qunit": function() {
            var count = 0, testName;
            console.log("* QUnit test runner loaded.");
            QUnit.testStart = function(name) {
                testName = name.name;
            };
            QUnit.log = function(obj) {
                var message = "";
                if (typeof obj.message === "string") {
                    message = obj.message.replace(/<\/?.*?>/g, "");
                }
                console.log("  * {%s}{%s}[%s] %s",
                            testName, count++,
                            obj.result ? "PASS" : "FAIL", message);
            };
            QUnit.done = function(obj) {
                var runtime = obj.runtime / 1000.0;
                console.log("\n"+
                            "*****************\n" +
                            "* QUnit Results *\n" +
                            "*****************\n" +
                            "* PASSED: %s\n" +
                            "* FAILED: %s\n" +
                            "* Completed %s tests total in %s seconds.\n",
                            obj.passed, obj.failed, obj.total, runtime);
            };
        },
        ".": function(script) {
            script.type = "text/envjs";
        }
    }
});
