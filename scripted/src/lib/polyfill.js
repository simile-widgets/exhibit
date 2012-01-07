/**
 * @fileOverview Gap fillers in browser implementations.  Only defined if
 *    native implementation is not detected.
 */

/**
 * @seeAlso https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/create
 */
if (typeof Object.create !== "function") {
    Object.create = function (o) {
        if (arguments.length > 1) {
            throw new Error('Object.create implementation only accepts the first parameter.');
        }
        function F() {}
        F.prototype = o;
        return new F();
    }; 
}
