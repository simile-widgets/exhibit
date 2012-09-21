Exhibit.MapExtension.Painter = {};

/**
 * @param {Numeric} width
 * @param {Numeric} height
 * @param {String} color
 * @param {String} label
 * @param {String} iconURL
 * @param {Numeric} iconSize
 * @param {Object} settings
 */
Exhibit.MapExtension.Painter.makeIcon = function(width, height, color, label, iconURL, iconSize, settings) {
    var imageParameters, shadowParameters, pinParameters, pinHeight, pinHalfWidth;

    if (iconSize > 0) {
        width = iconSize;
        height = iconSize;
        settings.pin = false;
    }

    imageParameters = [
        "renderer=map-marker",
        "shape=" + settings.shape,
        "alpha=" + settings.shapeAlpha,
        "width=" + width,
        "height=" + height,
        "background=" + color.substr(1),
        "label=" + label
    ];
    shadowParameters = [
        "renderer=map-marker-shadow",
        "shape=" + settings.shape,
        "width=" + width,
        "height=" + height
    ];
    pinParameters = [];
    if (settings.pin && iconSize <= 0) {
        pinHeight = settings.pinHeight;
        pinHalfWidth = Math.ceil(settings.pinWidth / 2);
        
        pinParameters.push("pinHeight=" + pinHeight);
        pinParameters.push("pinWidth=" + (pinHalfWidth * 2));
    } else {
	    pinParameters.push("pin=false");
    }

    if (iconURL !== null) {
        imageParameters.push("icon=" + iconURL);
        if (settings.iconFit !== "smaller") {
            imageParameters.push("iconFit=" + settings.iconFit);
        }
        if (settings.iconScale !== 1) {
            imageParameters.push("iconScale=" + settings.iconScale);
        }
        if (settings.iconOffsetX !== 1) {
            imageParameters.push("iconX=" + settings.iconOffsetX);
        }
        if (settings.iconOffsetY !== 1) {
            imageParameters.push("iconY=" + settings.iconOffsetY);
        }
    }

    return {
	    "iconURL": Exhibit.MapExtension.markerUrlPrefix + imageParameters.concat(pinParameters).join("&") + "&.png",
	    "shadowURL": Exhibit.MapExtension.markerUrlPrefix + shadowParameters.concat(pinParameters).join("&") + "&.png" 
    };
};
