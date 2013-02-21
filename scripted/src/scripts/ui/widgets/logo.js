/**
 * @fileOverview 
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @constructor
 * @class
 * @param {Element} elmt
 * @param {Exhibit._Impl} exhibit
 */ 
Exhibit.Logo = function(elmt, exhibit) {
    this._exhibit = exhibit;
    this._elmt = elmt;
    this._color = "Silver";
};

/**
 * @static
 * @param {Object} configuration
 * @param {Element} elmt
 * @param {Exhibit._Impl} exhibit
 * @returns {Exhibit.Logo}
 */
Exhibit.Logo.create = function(configuration, elmt, exhibit) {
    var logo;

    logo = new Exhibit.Logo(elmt, exhibit);
    
    if (typeof configuration.color !== "undefined") {
        logo._color = configuration.color;
    }
    
    logo._initializeUI();
    return logo;
};

/**
 * @static
 * @param {Element} elmt
 * @param {Exhibit._Impl} exhibit
 * @returns {Exhibit.Logo}
 */
Exhibit.Logo.createFromDOM = function(elmt, exhibit) {
    var logo, color;
    logo = new Exhibit.Logo(elmt, exhibit);
    
    color = Exhibit.getAttribute(elmt, "color");
    if (color !== null && color.length > 0) {
        logo._color = color;
    }
    
    logo._initializeUI();
    return logo;
};

/**
 *
 */
Exhibit.Logo.prototype.dispose = function() {
    this._elmt = null;
    this._exhibit = null;
};

/**
 * @private
 */
Exhibit.Logo.prototype._initializeUI = function() {
    var logoURL, img, id, a;

    logoURL = Exhibit.urlPrefix + "images/logos/exhibit-small-" + this._color + ".png";
    img = Exhibit.jQuery.simileBubble("createTranslucentImage", logoURL);
    id = "exhibit-logo-image";
    if (Exhibit.jQuery('#' + id).length === 0) {
        Exhibit.jQuery(img).attr("id", id);
    }
    a = Exhibit.jQuery("<a>")
        .attr("href", Exhibit.exhibitLink)
        .attr("title", Exhibit.exhibitLink)
        .attr("targe", "_blank")
        .append(img);
    
    Exhibit.jQuery(this._elmt).append(a);
};
