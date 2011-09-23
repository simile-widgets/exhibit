/**
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 * @fileOverview Take QUnit output and write out Ant/JUnit XML reports.
 */

var JUnitReporter = function(pattern) {
    this._doc = null;
    this._root = null;
    this._init();
    this._suites = {};
    this._cases = {};
    this._pattern = pattern;
};

JUnitReporter.prototype._init = function() {
    this._doc = null;
    this._doc = JUnitReporter._createDocument();
    this._root = this._doc.createElement('testsuites');
    this._doc.appendChild(this._root);
};

JUnitReporter.prototype.write = function(file) {
    var str = '<?xml version="1.0" encoding="UTF-8"?>\n';
    str += JUnitReporter.serialize(this._doc);
    Envjs.writeToFile(str, Envjs.uri(file));
};

JUnitReporter.prototype.writeByPattern = function(module) {
    this.write(this._pattern.replace(/%\(module\)s/g, module));
};

JUnitReporter.prototype.moduleStart = function(name, start) {
    this._suites[name] = {'name': name, 'time': start};
};

JUnitReporter.prototype.moduleDone = function(name, failed, total) {
    if (typeof this._suites[name] === "undefined") {
        return;
    }
    this._suites[name]['tests'] = total;
    this._suites[name]['failures'] = failed;
    this._suites[name]['errors'] = 0;
    this._suites[name]['time'] -= (new Date()).getTime();
    this._suites[name]['time'] /= -1000.0;
    this._suites[name]['hostname'] = 'localhost';
    this._suites[name]['timestamp'] = JUnitReporter.date();
    var att, testcase, suite = this._doc.createElement('testsuite');
    for (att in this._suites[name]) {
        if (this._suites[name].hasOwnProperty(att)) {
            suite.setAttribute(att, this._suites[name][att]);
        }
    }
    if (typeof this._cases[name] !== "undefined") {
        for (testcase in this._cases[name]) {
            if (this._cases[name].hasOwnProperty(testcase)) {
                var testcaseEl = this._doc.createElement('testcase');
                for (att in this._cases[name][testcase]) {
                    if (this._cases[name][testcase].hasOwnProperty(att)) {
                        switch(att) {
                            case 'failure':
                                var failure = this._doc.createElement('failure');
                                failure.setAttribute('message', 'Failures recorded');
                                failure.appendChild(this._doc.createTextNode(this._cases[name][testcase][att]));
                                testcaseEl.appendChild(failure);
                                break;
                            case 'passed':
                                break;
                            default:
                                testcaseEl.setAttribute(att, this._cases[name][testcase][att]);
                                break;
                        }
                    }
                }
                suite.appendChild(testcaseEl);
            }
        }
    }
    var properties = this._doc.createElement('properties');
    var props = JUnitReporter.reportProperties();
    for (att in props) {
        if (props.hasOwnProperty(att)) {
            var propEl = this._doc.createElement('property');
            propEl.setAttribute('name', att);
            propEl.setAttribute('value', props[att]);
            properties.appendChild(propEl);
        }
    }
    suite.appendChild(properties);
    suite.appendChild(this._doc.createElement('system-out'));
    suite.appendChild(this._doc.createElement('system-err'));
    this._root.appendChild(suite);
    this.writeByPattern(name);
    this._init();
};

JUnitReporter.prototype.testDone = function(module, name, passed, fails, timer) {
    var failuresMsg = null;
    if (typeof this._cases[module] === "undefined") {
        this._cases[module] = {};
    }
    if (fails.length > 0) {
        failuresMsg = fails.join('\n');
    }
    this._cases[module][name] = {
        'name': name,
        'classname': 'QUnit.' + module + "." + JUnitReporter.classify(name),
        'time': timer,
        'passed': passed
    };
    if (failuresMsg != null) {
        this._cases[module][name]['failure'] = failuresMsg;
    }
};

JUnitReporter.classify = function(str) {
    return str.replace(/ /g, '_');
};

JUnitReporter.date = function() {
    var ts = new Date();
    var iso8601 = "" + ts.getUTCFullYear() + "-";
    if (ts.getUTCMonth() <= 8) {
        iso8601 += "0" + (ts.getUTCMonth() + 1);
    } else {
        iso8601 += (ts.getUTCMonth() + 1);
    }
    iso8601 += "-";
    if (ts.getUTCDate() <= 9) {
        iso8601 += "0" + ts.getUTCDate();
    } else {
        iso8601 += ts.getUTCDate();
    }
    iso8601 += "T";
    if (ts.getUTCHours() <= 9) {
        iso8601 += "0" + ts.getUTCHours();
    } else {
        iso8601 += ts.getUTCHours();
    }
    iso8601 += ":";
    if (ts.getUTCMinutes() <= 9) {
        iso8601 += "0" + ts.getUTCMinutes();
    } else {
        iso8601 += ts.getUTCMinutes();
    }
    iso8601 += ":";
    if (ts.getUTCSeconds() <= 9) {
        iso8601 += "0" + ts.getUTCSeconds();
    } else {
        iso8601 += ts.getUTCSeconds();
    }
    iso8601 += "Z";
    return iso8601;
};

JUnitReporter.reportProperties = function() {
    return {
        'window.navigator.appCodeName': window.navigator.appCodeName,
        'window.navigator.appName': window.navigator.appName,
        'window.navigator.appVersion': window.navigator.appVersion,
        'window.navigator.platform': window.navigator.platform,
        'window.navigator.userAgent': window.navigator.userAgent
    };
};

JUnitReporter.serialize = function(doc) {
    if (typeof XMLSerializer !== "undefined") {
        return (new XMLSerializer()).serializeToString(doc);
    } else if (typeof doc.xml !== "undefined") {
        return doc.xml;
    } else {
        return null;
    }
};

JUnitReporter._createDocument = function() {
    if (typeof document.implementation.createDocument !== "undefined") {
        return document.implementation.createDocument("", "", null);
    } else if (typeof ActiveXObject !== "undefined") {
        return ActiveXObject("Microsoft.XMLDOM");
    } else {
        return null;
    }
};
