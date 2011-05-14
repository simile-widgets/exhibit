/**
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 * @fileOverview Fire unload event trigger on window.close call.
 */

window.close = function() {
    var event = document.createEvent("HTMLEvents");
    event.initEvent("unload", false, false);
    window.dispatchEvent(event, false);
};
