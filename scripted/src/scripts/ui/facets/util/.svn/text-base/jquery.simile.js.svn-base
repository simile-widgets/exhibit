/**
 * This code implements the Simile jQuery plugin, which in turns simply
 * provides several convenient and useful functions for manipulating the
 * DOM, etc.
 * @overview Simile jQuery plugin
 */
 
jQuery.extend({
    /**
     * Simply capitalizes the first letter of each word in its argument.
     */
    capitalize: function(s) {
        return s.charAt(0).toUpperCase() + s.substring(1).toLowerCase();
    },
    /**
     * Provides a basic mechanism for Javascript inheritance.
     */
    inherit: function(subclass, superclass) {
        function Dummy() {};
        Dummy.prototype = superclass.prototype;
        subclass.prototype = new Dummy();
        subclass.prototype.constructor = subclass;
        subclass.superclass = superclass;
        subclass.superproto = superclass.prototype;
    },
    /**
     * Recursively deep-copies the given object.
     */
    clone: function(obj, deep) {
        if (deep == null) { deep = true; }
        var objectClone = new obj.constructor();
        for (var property in obj) {
            if (!deep) {
                objectClone[property] = obj[property];
            } else if (typeof obj[property] == 'object') {
                objectClone[property] = obj[property].clone(deep);
            } else {
                objectClone[property] = obj[property];
            }
        }
        return objectClone;
    },
    /**
     * Returns the width of the scrollbar.
     */
    scrollWidth: function() {
        var scr = null;
        var inn = null;
        var wNoScroll = 0;
        var wScroll = 0;

        // Outer scrolling div
        scr = document.createElement('div');
        scr.style.position = 'absolute';
        scr.style.top = '-1000px';
        scr.style.left = '-1000px';
        scr.style.width = '100px';
        scr.style.height = '50px';
        // Start with no scrollbar
        scr.style.overflow = 'hidden';

        // Inner content div
        inn = document.createElement('div');
        inn.style.width = '100%';
        inn.style.height = '200px';

        // Put the inner div in the scrolling div
        scr.appendChild(inn);
        // Append the scrolling div to the doc
        document.body.appendChild(scr);

        // Width of the inner div sans scrollbar
        wNoScroll = inn.offsetWidth;
        // Add the scrollbar
        scr.style.overflow = 'auto';
        // Width of the inner div width scrollbar
        wScroll = inn.offsetWidth;

        // Remove the scrolling div from the doc
        document.body.removeChild(
            document.body.lastChild);

        // Pixel width of the scroller, with an awful, awful hack
        // FIXME: Fix hardcoded scrollwidth
        return (wNoScroll - wScroll) || 17;
    }
});

jQuery.fn.extend({
    /**
     * The attrs method extends jQuery to allow for aggregating attributes of 
     * all matched elements in a $('..') expression into a nice hash.  It also
     * supports only returning attributes within a certain namespace, e.g. 
     * ex:role, when provided with the namespace prefix as an argument.
     */
    attrs: function(ns) {
        // Caching the compiled regex speeds this up a bit
        if (!this.__namespaceRegexps) {
            this.__namespaceRegexps = {};
        }
        var regexp = this.__namespaceRegexps[ns];
        if (!regexp) {
            this.__namespaceRegexps[ns] = regexp = 
            ns ? eval("/^" + ns + ":(.+)/") : /^([^:]*)$/;
        }
        var result = {};
        this.each(function() {
            // Within this loop, 'this' refers to each matched DOM element
            var atts = this.attributes;
            var l = atts.length;
            for (var i = 0; i < l; i++) {
                var m = atts[i].name.match(regexp);
                if (m) { result[m[1]] = atts[i].value; }
            }
        });
        return result;
    }
});
