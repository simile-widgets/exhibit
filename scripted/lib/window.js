window.close = function() {
    event = document.createEvent("HTMLEvents");
    event.initEvent("unload", false, false);
    window.dispatchEvent(event, false);
};
