/**
 * @fileOverview Utility functions for generating a marker suitable for
 *   external libraries to use in making a marker.
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @class
 * @constructor
 * @param {Object} icon
 * @param {Array} icon.anchor
 * @param {Array} icon.size
 * @param {String} icon.url
 * @param {Object} shadow
 * @param {Array} shadow.anchor
 * @param {Array} shadow.size
 * @param {String} shadow.url
 * @param {Object} shape
 * @param {String} shape.type
 * @param {Array} shape.coords
 * @param {Object} settings
 */
Exhibit.MapExtension.Marker = function(icon, shadow, shape, settings) {
    this.icon = icon;
    this.shadow = shadow;
    this.shape = shape;
    this.settings = settings;
};

/**
 * Sets Exhibit.MapExtension.hasCanvas
 */
Exhibit.MapExtension.Marker.detectCanvas = function() {
    var canvas = Exhibit.jQuery('<canvas>');
    Exhibit.MapExtension.hasCanvas =
        (typeof canvas.get(0).getContext !== "undefined"
         && canvas.get(0).getContext("2d") !== null);
    canvas = null;
};

/**
 * Passes icon generation to appropriate service.
 * @param {Numeric} width
 * @param {Numeric} height
 * @param {String} color
 * @param {String} label
 * @param {String|Image} icon
 * @param {Numeric} iconSize
 * @param {Object} settings
 * @returns {Object}
 */
Exhibit.MapExtension.Marker.makeIcon = function(width, height, color, label, icon, size, settings) {
    return (Exhibit.MapExtension.hasCanvas) ?
        Exhibit.MapExtension.Canvas.makeIcon(width, height, color, label, icon, size, settings) :
        Exhibit.MapExtension.Painter.makeIcon(width, height, color, label, icon, size, settings);
};

/**
 * @static
 * @param {String} shape
 * @param {String} color
 * @param {Numeric} iconSize
 * @param {String} iconURL
 * @param {String} label
 * @returns {String}
 */
Exhibit.MapExtension.Marker._makeMarkerKey = function(shape, color, iconSize, iconURL, label) {
    return "#" + [shape, color, iconSize, iconURL, label].join("#");
};

/**
 * @static
 * @param {String} shape
 * @param {String} color
 * @param {Numeric} iconSize
 * @param {String} iconURL
 * @param {String} label
 * @param {Object} settings
 * @param {Exhibit.View} view
 * @returns {Exhibit.MapExtension.Marker}
 */
Exhibit.MapExtension.Marker.makeMarker = function(shape, color, iconSize, iconURL, label, settings, view) {
    var extra, halfWidth, bodyHeight, width, height, pin, markerImage, markerShape, shadowImage, pinHeight, pinHalfWidth, markerPair, marker, image, resolver;

    extra = label.length * 3;
    halfWidth = Math.ceil(settings.shapeWidth / 2) + extra;
    bodyHeight = settings.shapeHeight+2*extra; // try to keep circular
    width = halfWidth * 2;
    height = bodyHeight;
    pin = settings.pin;

    if (iconSize > 0) {
        width = iconSize;
        halfWidth = Math.ceil(iconSize / 2);
        height = iconSize;
        bodyHeight = iconSize;
    }

    markerImage = {
        "anchor": null,
        "size": null,
        "url": null
    };
    markerShape = {
        "type": "poly",
        "coords": null
    };
    shadowImage = {
        "anchor": null,
        "size": null,
        "url": null
    };

    if (pin) {
        pinHeight = settings.pinHeight;
        pinHalfWidth = Math.ceil(settings.pinWidth / 2);
        
        height += pinHeight;

        markerImage.anchor = [halfWidth, height];
        shadowImage.anchor = [halfWidth, height];
	
        markerShape.coords = [
	        0, 0, 
	        0, bodyHeight, 
	        halfWidth - pinHalfWidth, bodyHeight,
	        halfWidth, height,
	        halfWidth + pinHalfWidth, bodyHeight,
	        width, bodyHeight,
	        width, 0
        ];

        markerImage.infoWindowAnchor = (settings.bubbleTip === "bottom") ?
            [halfWidth, height] :
            [halfWidth, 0];
    } else {
        markerImage.anchor = [halfWidth, Math.ceil(height / 2)];
        shadowImage.anchor = [halfWidth, Math.ceil(height / 2)];
        markerShape.coords = [
	        0, 0, 
	        0, bodyHeight, 
	        width, bodyHeight,
	        width, 0
        ];
        markerImage.infoWindowAnchor = [halfWidth, 0];
    }

    markerImage.size = [width, height];
    shadowImage.size = [width + height / 2, height];
   
    if (!Exhibit.MapExtension.hasCanvas) {
        markerPair = Exhibit.MapExtension.Painter.makeIcon(width, bodyHeight, color, label, iconURL, iconSize, settings);
    } else {
        markerPair = Exhibit.MapExtension.Canvas.makeIcon(width, bodyHeight, color, label, null, iconSize, settings);
    }
    markerImage.url = markerPair.iconURL;
    shadowImage.url = markerPair.shadowURL;
    
    marker = new Exhibit.MapExtension.Marker(markerImage, shadowImage, markerShape, settings);

    if (iconURL !== null) {
        // canvas needs to fetch image:
        // - return a marker without the image
        // - add a callback that adds the image when available.
        image = new Image();
        // To use CORS would mean adding .attr("crossOrigin", "") here
        Exhibit.jQuery(image).one("load error", function(evt) {
            var url, icon, key;
            if (evt.type !== "error") {
                try {
	                url = Exhibit.MapExtension.Canvas.makeIcon(width, bodyHeight, color, label, image, iconSize, settings).iconURL;
                } catch (e) {
                    // remote icon fetch caused canvas tainting, fall to painter
                    if (!Exhibit.MapExtension._CORSWarned) {
                        Exhibit.MapExtension._CORSWarned = true;
                        Exhibit.Debug.warn(Exhibit._("%MapView.error.remoteImage", iconURL));
                    }
                    url = Exhibit.MapExtension.Painter.makeIcon(width, bodyHeight, color, label, iconURL, iconSize, settings).iconURL;
                }
                key = Exhibit.MapExtension.Marker._makeMarkerKey(shape, color, iconSize, iconURL, label);
                view.updateMarkerIcon(key, url);
            }
        }).attr("src", iconURL);
    }
    return marker;
};

/**
 * @returns {Boolean}
 */
Exhibit.MapExtension.Marker.prototype.hasShadow = function() {
    return this.shadow !== null;
};

/**
 * @param {Object} icon
 */
Exhibit.MapExtension.Marker.prototype.setIcon = function(icon) {
    this.icon = icon;
};

/**
 * @returns {Object}
 */
Exhibit.MapExtension.Marker.prototype.getIcon = function() {
    return this.icon;
};

/**
 * @param {Object} shadow
 */
Exhibit.MapExtension.Marker.prototype.setShadow = function(shadow) {
    this.shadow = shadow;
};

/**
 * @returns {Object}
 */
Exhibit.MapExtension.Marker.prototype.getShadow = function() {
    return this.shadow;
};

/**
 * @param {Object} shape
 */
Exhibit.MapExtension.Marker.prototype.setShape = function(shape) {
    this.shape = shape;
};

/**
 * @returns {Object}
 */
Exhibit.MapExtension.Marker.prototype.getShape = function() {
    return this.shape;
};

/**
 * @param {Object} settings
 */
Exhibit.MapExtension.Marker.prototype.setSettings = function(settings) {
    this.settings = settings;
};

/**
 * @returns {Object}
 */
Exhibit.MapExtension.Marker.prototype.getSettings = function() {
    return this.settings;
};

/**
 *
 */
Exhibit.MapExtension.Marker.prototype.dispose = function() {
    this.icon = null;
    this.shadow = null;
    this.shape = null;
    this.settings = null;
};
