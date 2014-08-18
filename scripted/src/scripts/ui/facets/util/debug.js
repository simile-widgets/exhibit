/*==================================================
 *  Debug Utility Functions
 *==================================================
 */

Timegrid.Debug = new Object();

Timegrid.Debug.log = function(msg) {
};

Timegrid.Debug.exception = function(e) {
    e = $.getIsIE() ? e.message : e;
    $.debugException(e, "Caught exception");
};

