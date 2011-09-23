/**
 * @fileOverview Testing framework setup.
 * @seeAlso http://www.loose-bits.com/2011/02/browserless-ajax-testing-with-rhino-and.html
 */

load("lib/env.rhino.js");
load("lib/window.js");
load("lib/junit.js");

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
        },
        "exhibit-api\.js": function(script) {
            // LABjs makes some poor assumptions about what can be
            // done in Envjs just because it isn't Opera or Firefox,
            // so masquerade via LABjs' Firefox test.  This should
            // prevent it from preloading, which interferes with Exhibit
            // loading.
            document.documentElement.style.MozAppearance = "";
            return true;
        }
    },
    afterScriptLoad: {
        "qunit\.js": function() {
            var count = 0, testName, start, moduleName, fails = [];
            console.log("QUnit test runner loaded.");

            var junitr = new JUnitReporter('../build/tests/TEST-%(module)s.xml');

            QUnit.log = function(obj) {
                var message = "";
                if (typeof obj.message === "string") {
                    message = obj.message.replace(/<\/?.*?>/g, "");
                    if (!obj.result) {
                        fails.push(message + ": expected '" + obj.expected + "' but got '" + obj.actual + "'");
                    }
                }
                console.log(" [%s]{%s.%s}{%s} (%s->%s) %s",
                            obj.result ? "PASS" : "FAIL",
                            moduleName, testName, count++,
                            obj.expected, obj.actual, message);
            };
            QUnit.begin = function(obj) {
                // from https://twoguysarguing.wordpress.com/2010/11/26/qunit-cli-running-qunit-with-rhino/
                var origObjectParser = QUnit.jsDump.parsers.object;
                QUnit.jsDump.setParser('object', function(obj) {
                    if (typeof obj.rhinoException !== 'undefined') {
                        return obj.name + " { message: '" + obj.message + "', fileName: '" + obj.fileName + "', lineNumber: " + obj.lineNumber + " }";
                    }
                    else {
                        return origObjectParser(obj);
                    }
                });
                // /end
            };
            QUnit.moduleStart = function(obj) {
                moduleName = obj.name;
                junitr.moduleStart(obj.name, (new Date()).getTime());
            };
            QUnit.testStart = function(obj) {
                testName = obj.name;
                start = (new Date()).getTime();
                fails = [];
            };
            QUnit.testDone = function(obj) {
                var timer = ((new Date()).getTime() - start) / 1000.0;
                var passed = (obj.passed === obj.total);
                junitr.testDone(moduleName, obj.name, passed, fails, timer);
            };
            QUnit.moduleDone = function(obj) {
                junitr.moduleDone(obj.name, obj.failed, obj.total);
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
                window.close();
            };
        }
    }
});
