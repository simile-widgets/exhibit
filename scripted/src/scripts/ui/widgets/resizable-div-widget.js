/**
 * @fileOverview Resizable element widget
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

/**
 * @param {Object} configuration
 * @param {Element} elmt
 * @param {Exhibit.UIContext} uiContext
 */
Exhibit.ResizableDivWidget = function(configuration, elmt, uiContext) {
    this._div = elmt;
    this._configuration = configuration;
    if (typeof configuration.minHeight === "undefined") {
        configuration.minHeight = 10; // pixels
    }
    
    this._initializeUI();
};

/**
 * @param {Object} configuration
 * @param {Element} elmt
 * @param {Exhibit.UIContext} uiContext
 * @returns {Exhibit.ResizableDivWidget}
 */
Exhibit.ResizableDivWidget.create = function(configuration, elmt, uiContext) {
    return new Exhibit.ResizableDivWidget(configuration, elmt, uiContext);
};

/**
 *
 */
Exhibit.ResizableDivWidget.prototype.dispose = function() {
    this._div.innerHTML = "";
    this._contentDiv = null;
    this._resizerDiv = null;
    this._div = null;
};

/**
 * @returns {Element}
 */
Exhibit.ResizableDivWidget.prototype.getContentDiv = function() {
    return this._contentDiv;
};

/**
 *
 */
Exhibit.ResizableDivWidget.prototype._initializeUI = function() {
    var self = this;
    
    $(this._div).html(
        "<div></div>" +
        "<div class='exhibit-resizableDivWidget-resizer'>" +
            Exhibit.UI.createTranslucentImageHTML("images/down-arrow.png") +
            "</div>");
        
    this._contentDiv = $(this._div).children().get(0);
    this._resizerDiv = $(this._div).children().get(1);
    /**
       @@@ having removed SimileAjax, this needs replacing
    SimileAjax.WindowManager.registerForDragging(
        this._resizerDiv,
        {   onDragStart: function() {
                this._height = self._contentDiv.offsetHeight;
            },
            onDragBy: function(diffX, diffY) {
                this._height += diffY;
                self._contentDiv.style.height = Math.max(
                    self._configuration.minHeight, 
                    this._height
                ) + "px";
            },
            onDragEnd: function() {
                if ("onResize" in self._configuration) {
                    self._configuration["onResize"]();
                }
            }
        }
    );
    */
};
