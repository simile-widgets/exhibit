/**
 * @fileOverview Testing framework setup.
 * @seeAlso http://www.loose-bits.com/2011/02/browserless-ajax-testing-with-rhino-and.html
 */

load("lib/env.rhino.js");
load("lib/qunit.js");

var start = new Date().getTime();

Envjs({
    scriptTypes: {
        "": true,
        "text/javascript": true
    },
    beforeScriptLoad: {
        "sharethis": function(script) {
            script.src = "";
            return false;
        }
    },
    afterScriptLoad: {
        "qunit": function() {
            var count = 0, testName;
            console.log("* QUnit test runner loaded.");
            QUnit.testStart = function(name, testEnvironment) {
                testName = name;
            };
            QUnit.log = function(result, message) {
                message = message.replace(/<\/?.*?>/g, "");
                console.log("  * {%s}{%s}[%s] %s",
                            testName, count++,
                            result ? "PASS" : "FAIL", message);
            };
            QUnit.done = function(fail, total) {
                var end = new Date().getTime();
                var pass = total - fail;
                console.log("\n"+
                            "*****************\n" +
                            "* QUnit Results *\n" +
                            "*****************\n" +
                            "* PASSED: %s\n" +
                            "* FAILED: %s\n" +
                            "* Completed %s tests total in %s seconds.\n",
                            pass, fail, total,
                            parseFloat(end-start) / 1000.0);
            };
        },
        ".": function(script) {
            script.type = "text/envjs";
        }
    }
});
