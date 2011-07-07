/**
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 * @fileOverview Exhibit definition and bootstrapping.
 */

/**
 * @namespace The base namespace for Exhibit.
 */
var Exhibit = {
    /**
     * The version number for Exhibit.
     * @constant
     */
    version: "3.0.0",

    /**
     * The XML namespace for Exhibit.
     * @constant
     */
    namespace: "http://simile.mit.edu/2006/11/exhibit#",

    /**
     * Whether Exhibit has been loaded yet.
     */
    loaded: false,

    /**
     * Scripts Exhibit will load.
     */
    scripts: [],

    load: function() { }
};
