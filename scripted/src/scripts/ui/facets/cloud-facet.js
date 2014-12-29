/**
 * @fileOverview Cloud facet functions and UI
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 * @author <a href="mailto:axel@pike.org">Axel Hecht</a>
 */

/**
 * @constructor
 * @class
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.CloudFacet = function(containerElmt, uiContext) {
    Exhibit.EnumeratedFacet.call(this,"cloud",containerElmt,uiContext);
    this.addSettingSpecs(Exhibit.CloudFacet._settingSpecs);
    this._colorCoder = null;
    this._dom = null;
};

Exhibit.CloudFacet.prototype = new Exhibit.EnumeratedFacet();
/**
 * @constant
 */
Exhibit.CloudFacet._settingSpecs = {
    "showMissing":      { "type": "boolean", "defaultValue": false},
    "maxFontSize":      { "type": "number" },
    "minFontSize":      { "type": "number" } 
};

/**
 * @static
 * @param {Element} configElmt
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.CloudFacet}
 */
Exhibit.CloudFacet.createFromDOM = function(configElmt, containerElmt, 
                                            uiContext) {
    return Exhibit.EnumeratedFacet
        .createFromDOM(Exhibit.CloudFacet, configElmt, 
                      containerElmt, uiContext);
};

/**
 * @static
 * @param {Element} configElmt
 * @param {Element} containerElmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.CloudFacet}
 */
Exhibit.CloudFacet.create = function(configObj, containerElmt, uiContext) {
    return Exhibit.EnumeratedFacet
        .createFromObj(Exhibit.CloudFacet, configObj, 
                       containerElmt, uiContext);
};

/**
 * @param {Exhibit.Set} items
 */
Exhibit.CloudFacet.prototype.update = function(items) {
    this._constructBody(this._computeFacet(items));
};

/**
 *
 */
Exhibit.CloudFacet.prototype._initializeUI = function() {
    Exhibit.jQuery(this.getContainer()).empty();
    Exhibit.jQuery(this.getContainer()).addClass("exhibit-cloudFacet");

    var dom = Exhibit.jQuery.simileDOM(
        "string",
        this.getContainer(),
        ((typeof this._settings.facetLabel !== "undefined") ?
         (   "<div class='exhibit-cloudFacet-header'>" +
             "<span class='exhibit-cloudFacet-header-title'>" + this.getLabel() + "</span>" +
             "</div>"
         ) :
         ""
        ) +
            '<div class="exhibit-cloudFacet-body" id="valuesContainer"></div>'
    );

    this._dom = dom;
};

/**
 * @param {Array} entries
 */
Exhibit.CloudFacet.prototype._constructBody = function(entries) {
    var self, containerDiv, constructFacetItemFunction,
    facetHasSelection, constructValue, j, min, max, entry, range,
    fontSize, minFontSize=null, maxFontSize=null;
    self = this;
    containerDiv = this._dom.valuesContainer;
    
    Exhibit.jQuery(containerDiv).hide();
    Exhibit.jQuery(containerDiv).empty();
    
    if (entries.length > 0) {
        min = Number.POSITIVE_INFINITY;
        max = Number.NEGATIVE_INFINITY;
        for (j = 0; j < entries.length; j++) {
            entry = entries[j];
            min = Math.min(min, entry.count);
            max = Math.max(max, entry.count);
        }
        range = max - min;
        
        constructValue = function(entry, settings) {
            var onSelect, onSelectOnly, elmt;
            onSelect = function(evt) {
                self._filter(entry.value, entry.actionLabel, !(evt.ctrlKey || evt.metaKey));
                evt.preventDefault();
                evt.stopPropagation();
            };
            
            elmt = Exhibit.jQuery("<span>");
            
            Exhibit.jQuery(elmt).append(document.createTextNode("\u00A0"));
            if (typeof entry.selectionLabel === "string") {
                Exhibit.jQuery(elmt).append(document.createTextNode(entry.selectionLabel));
            } else {
                Exhibit.jQuery(elmt).append(entry.selectionLabel);
            }
            Exhibit.jQuery(elmt).append(document.createTextNode("\u00A0"));
            
            Exhibit.jQuery(elmt).attr("class", entry.selected ? 
                         "exhibit-cloudFacet-value exhibit-cloudFacet-value-selected" :
                         "exhibit-cloudFacet-value");
                            
            if (entry.count > min || typeof settings.minFontSize !== "undefined") {
                fontsize = Math.ceil(100 + 100 * Math.log(1 + 1.5 * (entry.count - min) / range));
                minFontSize = null;
                maxFontSize = null;
                if (typeof settings.maxFontSize !== "undefined" && typeof settings.minFontSize !== "undefined") {
                    minFontSize = settings.minFontSize;
                    maxFontSize = settings.maxFontSize;
                    fontsize = Math.ceil(minFontSize + 100 * Math.log(1 + 1.5 * (entry.count - min) / range));
                    fontsize = Math.min(maxFontSize, fontsize);
                } else if (typeof settings.maxFontSize != "undefined") {
                    maxFontSize = settings.maxFontSize;
                    if (maxFontSize <= 100) {
                        fontSize = Math.ceil(100 * Math.log(1 + 1.5 * (entry.count - min) / range));
                    }
                    fontSize = Math.min(maxFontSize, fontSize);
                } else if (typeof settings.minFontSize != "undefined") {
                    minFontSize = settings.minFontSize;
                    if (minFontSize > 100) {
                        fontsize = Math.ceil(minFontSize + 100 * Math.log(1 + 1.5 * (entry.count - min) / range));
                    }
                }
                Exhibit.jQuery(elmt).css("fontSize",  fontsize + "%");
            }
            
            Exhibit.jQuery(elmt).bind("click", onSelect);
        
            Exhibit.jQuery(containerDiv).append(elmt);
            Exhibit.jQuery(containerDiv).append(document.createTextNode(" "));
        };
    
        for (j = 0; j < entries.length; j++) {
            constructValue(entries[j], this._settings);
        }
    
        Exhibit.jQuery(containerDiv).show();
    }
};
