/**
 * @fileOverview Error reporting.  This file is not localized in order to
 *      keep errors in that system from interfering with this one.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 * @author Ted Benson <eob@csail.mit.edu>
 */

/**
 * @namespace
 */
Exhibit.Debug = {
    silent: false,

    /**
     * Stores timers for performance tracking.
     */
    timers: {},

    /**
     * The default timer name
     */
    defaultTimerName: "__DEFAULT__"
};

/**
 * @static
 * @param {String} msg
 */
Exhibit.Debug.log = function(msg) {
    var f;
    if (typeof window["console"] !== "undefined" &&
        typeof window.console["log"] === "function") {
        f = function(msg2) {
            console.log(msg2);
        };
    } else {
        f = function(msg2) {
            if (!Exhibit.Debug.silent) {
                alert(msg2);
            }
        };
    }
    Exhibit.Debug.log = f;
    f(msg);
};

/**
 * @static
 * @pararm {String} msg
 */
Exhibit.Debug.warn = function(msg) {
    var f;
    if (typeof window["console"] !== "undefined" &&
        typeof window.console["warn"] === "function") {
        f = function(msg2) {
            console.warn(msg2);
        };
    } else {
        f = function(msg2) {
            if (!Exhibit.Debug.silent) {
                alert(msg2);
            }
        };
    }
    Exhibit.Debug.warn = f;
    f(msg);
};

/**
 * @static
 * @param {Exception} e
 * @param {String} msg
 */
Exhibit.Debug.exception = function(e, msg) {
    var f, params = Exhibit.parseURLParameters();
    if (params.errors === "throw" || Exhibit.params.errors === "throw") {
        f = function(e2, msg2) {
            throw(e2);
        };
    } else if (typeof window["console"] !== "undefined" &&
               typeof window.console["error"] !== "undefined") {
        f = function(e2, msg2) {
            if (typeof msg2 !== "undefined" && msg2 !== null) {
                console.error(msg2 + " %o", e2);
            } else {
                console.error(e2);
            }
            throw(e2); // do not hide from browser's native debugging features
        };
    } else {
        f = function(e2, msg2) {
            if (!Exhibit.Debug.silent) {
                alert("Caught exception: " + msg2 + "\n\nDetails: " + (typeof e2["description"] !== "undefined" ? e2.description : e2));
            }
            throw(e2); // do not hide from browser's native debugging features
        };
    }
    Exhibit.Debug.exception = f;
    f(e, msg);
};

/**
 * @static
 * @param {Object} o
 * @returns {String}
 */
Exhibit.Debug.objectToString = function(o) {
    return Exhibit.Debut._objectToString(o, "");
};

/**
 * @static
 * @param {Object} o
 * @param {String} indent
 * @returns {String}
 */
Exhibit.Debug._objectToString = function(o, indent) {
    var indent2 = indent + " ", s, n;
    if (typeof o === "object") {
        s = "{";
        for (n in o) {
            if (o.hasOwnProperty(n)) {
                s += indent2 + n + ": " + Exhibit.Debug._objectToString(o[n], indent2) + "\n";
            }
        }
        s += indent + "}";
        return s;
    } else if (typeof o === "array") {
        s = "[";
        for (n = 0; n < o.length; n++) {
            s += Exhibit.Debug._objectToString(o[n], indent2) + "\n";
        }
        s += indent + "]";
        return s;
    } else if (typeof o === "function") {
        return indent + "{function}\n";
    } else {
        return o;
    }
};

/**
 * @static
 * @param {String} label The name of the timer.
 */
Exhibit.Debug.tick = function(label) {
  // If they don't provide a label name, stick to a default.
  if (typeof label === 'undefined') {
    label = Exhibit.Debug.defaultTimerName;
  }

  if (typeof Exhibit.Debug.timers[label] != 'undefined') {
    Exhibit.Debug.log("Warning: overwriting timer for label: " + label);
  }

  Exhibit.Debug.timers[label] = (new Date()).getTime();
};

/**
 * @static
 * @param {String} label The name of the timer.
 * @returns {int} The nmber of milliseconds passed since tick for this timer.
 */
Exhibit.Debug.tock = function(label) {
  // If they don't provide a label name, stick to a default.
  if (typeof label === 'undefined') {
    label = Exhibit.Debug.defaultTimerName;
  }

  if (typeof Exhibit.Debug.timers[label] === 'undefined') {
    Exhibit.Debug.log("Warning: tock with no tick for label: " + label);
    return -1;
  } else {
    var then = Exhibit.Debug.timers[label];
    delete Exhibit.Debug.timers[label];
    var now = (new Date()).getTime();
    return (now - then);
  }
};
