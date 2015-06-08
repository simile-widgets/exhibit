/**
 * @fileOverview jQuery 1.6+ plugin for making popup bubbles.
 * @author David Huynh
 * @author <a href="mailto:ryanlee@zepheira.com">Ryan Lee</a>
 */

(function($) {
    var defaultBubbleConfig, methods, _init;

    _init = false;

    defaultBubbleConfig = {
        closeGraphicCSSClass:           "exhibit-bubble-close",
        extraPadding:                   50
    };

    methods = {
        "configure": function(options) {
            var opt;
            for (opt in options) {
                if (options.hasOwnProperty(opt)) {
                    defaultBubbleConfig[opt] = options[opt];
                }
            }
        },
        "createBubbleForContentAndPoint": function(div, pageX, pageY, contentWidth, orientation, maxHeight) {
            if (typeof contentWidth !== "number") {
                contentWidth = 300;
            }
            if (typeof maxHeight !== "number") {
                maxHeight = 0;
            }

            div = $(div);
            div.css("position", "absolute").
                css("left", "-5000px").
                css("top", "0px").
                css("width", contentWidth + "px");
            $(document.body).append(div);
            
            window.setTimeout(function() {
                var width, height, scrollDivW, bubble, scrollDiv;
                width = div.prop("scrollWidth") + 10;
                height = div.prop("scrollHeight") + 10;
                scrollDivW = 0; // width of the possible inner container when we want vertical scrolling
                if (maxHeight > 0 && height > maxHeight) {
                    height = maxHeight;
                    scrollDivW = width - 25;
                }
       
                bubble = methods.createBubbleForPoint(pageX, pageY, width, height, orientation);
        
                div.remove();
                div.css("position", "static");
                div.css("left", null);
                div.css("top", null);
        
                // create a scroll div if needed
                if (scrollDivW > 0) {
                    scrollDiv = $("<div>");
                    div.css("width", null);
                    scrollDiv.css("width", scrollDivW + "px");
                    scrollDiv.append(div);
                    $(bubble.content).append(scrollDiv);
                } else {
                    div.css("width", width + "px");
                    $(bubble.content).append(div);
                }
            }, 200);
        },
        "createBubbleForPoint": function(pageX, pageY, contentWidth, contentHeight, orientation) {
            var bubbleConfig, div, bubble, close, divContentContainer, divClose;

            contentWidth = parseInt(contentWidth, 10);
            contentHeight = parseInt(contentHeight, 10);

            bubbleConfig = defaultBubbleConfig;
    
            /*
             *  Render container divs
             */
            div = $("<div>").
                addClass("exhibit-bubble")
                .css({left: pageX, top: pageY});

            /*
             *  Create layer for bubble
             */
            close = function() { 
                if (!bubble._closed) {
                    $(bubble._div).remove();
                    bubble._doc = null;
                    bubble._div = null;
                    bubble._content = null;
                    bubble._closed = true;
                }
            };

            /*
             *  Render content
            extra div layer with padding to prevent margin of inner
            items from expanding the bubble from its original fixed size
             */
            divContentContainer = $("<div><div></div></div>")
                .appendTo(div)
                .css({width: contentWidth, height: contentHeight,
                      padding: "1px"})
                .children(0);
            
            bubble = { _closed: false,
                       _div: div.get(0),
                       close: close,
                       content: divContentContainer.get(0)};
            /*
             *  Render close button
             */
            divClose = $("<div>").
                addClass("exhibit-bubble-close-btn").
                appendTo(div).
                bind("click", bubble.close);

            
            //hide bubble so doesn't flicker while trying placements
            //div.hide ruins getBoundingClientRect
            div.css({opacity: "0"}); 
            $(document.body).append(div); 

            (function() {
                var
                vw=$(window).width(), 
                vh=$(window).height(), 
                rect,
                vizPixels=0,
                bestViz=0,
                bestPosition = 'below-right',
                elt = div.get(0),
                positionClass, i, 
                positionClasses = [
                    'above','below','right','above-right',
                    'below-right','left','above-left','below-left'
                ];

                for (i=0; i<positionClasses.length;i++) {
                    positionClass='exhibit-bubble-' +
                        positionClasses[i];
                    div.addClass(positionClass);
                    rect=elt.getBoundingClientRect();
                    if (rect.left >= 0 && rect.top >= 0) {
                        if (rect.right < vw && rect.bottom < vh) {
                            //found a placement that's fully visible
                            return; 
                        }
                        //determine visible area
                        vizPixels = 
                            (Math.min(rect.right,vw) - Math.max(rect.left,0)) *
                            (Math.min(rect.bottom, vh) - Math.max(rect.top,0));
                        if (vizPixels > bestViz) {
                            bestViz = vizPixels;
                            bestPosition = positionClass;
                        }
                    }
                    div.removeClass(positionClass);
                }
                //nothing fully visible, so use what's most visible.
                div.addClass(bestPosition);
            }());
            div.css({opacity: "1"});

            return bubble;            
        },
        "createMessageBubble": function() {
            var containerDiv, topDiv, topRightDiv, middleDiv, middleRightDiv, contentDiv, bottomDiv, bottomRightDiv;

            containerDiv = Exhibit.jQuery("<div>");
            contentDiv = Exhibit.jQuery("<div>");
            containerDiv.append(contentDiv);
            containerDiv.addClass('exhibit-message-bubble');
            contentDiv.addClass('exhibit-message-bubble-content');

            return {
                containerDiv:   containerDiv,
                contentDiv:     contentDiv
            };
        },
        "createTranslucentImage": function(url, verticalAlign) {
            var elmt = $("<img />");
                elmt.attr("src", url);

            if (typeof verticalAlign !== "undefined" &&
                verticalAlign !== null) {
                elmt.css("vertical-align", verticalAlign);
            } else {
                elmt.css("vertical-align", "middle");
            }
            return elmt.get(0);            
        },
        "createTranslucentImageHTML": function(url, verticalAlign) {
                return "<img src=\"" + url + "\"" +
                    (typeof verticalAlign !== "undefined" && verticalAlign !== null ? " style=\"vertical-align: " + verticalAlign + ";\"" : "") +
                    " />";
        },
        "pngIsTranslucent": function() {
            return true;
        }
    };

    $.simileBubble = function(method) {
        if (typeof method !== "undefined" &&
            method !== null &&
            typeof method === "string" &&
            method.indexOf("_") !== 0 &&
            typeof methods[method] !== "undefined") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === "object" ||
                   typeof method === "undefined" ||
                   method === null) {
            return methods.configure.apply(this, arguments);
        } else {
            $.error("Method " + method + " does not exist on jQuery.simileBubble");
        }
    };
}(jQuery));
