(function($) {
    var createCanvas = function() {
        var canvas = document.createElement("canvas");
        if ("G_vmlCanvasManager" in window) {
            document.body.appendChild(canvas);
            canvas = G_vmlCanvasManager.initElement(canvas);
        }
        return canvas;
    };
    var DropShadow = function(backgroundColor, cornerRadius, shadowRadius, shadowOffset, shadowAlpha) {
        this.backgroundColor = backgroundColor;
        this.cornerRadius = cornerRadius;
        this.shadowRadius = Math.max(cornerRadius, shadowRadius);
        this.shadowOffset = shadowOffset;
        this.shadowAlpha = shadowAlpha;
        
        this.elmt = createCanvas();//document.createElement("canvas");
        this.elmt.style.position = "absolute";
    };

    DropShadow.prototype = {
        draw: function() {
            var darkColor = "rgba(128,128,128," + this.shadowAlpha + ")";
            var lightColor = "rgba(128,128,128,0)";
            
            var cornerRadius = this.cornerRadius;
            var shadowRadius = this.shadowRadius;
            var radiusDiff = shadowRadius - cornerRadius;
            var innerWidth = this.width - 2 * cornerRadius;
            var innerHeight = this.height - 2 * cornerRadius;
            
            var ctx = this.elmt.getContext("2d");
            ctx.translate(this.shadowRadius, this.shadowRadius);
            ctx.globalCompositeOperation = "copy";
            
            /*
             * Inside
             */
            ctx.fillStyle = darkColor;
            ctx.fillRect(-cornerRadius, -cornerRadius, this.width, this.height);
            
            /*
             * Corners
             */
            if (true) {
                // top left
                ctx.fillStyle = this._createRadialGradient(ctx, 0, 0, cornerRadius, shadowRadius, darkColor, lightColor);
                ctx.fillRect(-shadowRadius, -shadowRadius, shadowRadius, shadowRadius);
                
                // top right
                ctx.fillStyle = this._createRadialGradient(ctx, innerWidth, 0, cornerRadius, shadowRadius, darkColor, lightColor);
                ctx.fillRect(innerWidth, -shadowRadius, shadowRadius, shadowRadius);
                
                // bottom right
                ctx.fillStyle = this._createRadialGradient(ctx, innerWidth, innerHeight, cornerRadius, shadowRadius, darkColor, lightColor);
                ctx.fillRect(innerWidth, innerHeight, shadowRadius, shadowRadius);
                
                // bottom left
                ctx.fillStyle = this._createRadialGradient(ctx, 0, innerHeight, cornerRadius, shadowRadius, darkColor, lightColor);
                ctx.fillRect(-shadowRadius, innerHeight, shadowRadius, shadowRadius);
            }
            
            /*
             * Edges
             */
            if (true) {
                // top
                ctx.fillStyle = this._createLinearGradient(ctx, 0, -cornerRadius, 0, -shadowRadius, darkColor, lightColor);
                ctx.fillRect(0, -shadowRadius, innerWidth, radiusDiff);
                
                // right
                ctx.fillStyle = this._createLinearGradient(ctx, innerWidth + cornerRadius, 0, innerWidth + shadowRadius, 0, darkColor, lightColor);
                ctx.fillRect(innerWidth + cornerRadius, 0, radiusDiff, innerHeight);
                
                // bottom
                ctx.fillStyle = this._createLinearGradient(ctx, 0, innerHeight + cornerRadius, 0, innerHeight + shadowRadius, darkColor, lightColor);
                ctx.fillRect(0, innerHeight + cornerRadius, innerWidth, radiusDiff);
                
                // left
                ctx.fillStyle = this._createLinearGradient(ctx, -radiusDiff, 0, -shadowRadius, 0, darkColor, lightColor);
                ctx.fillRect(-shadowRadius, 0, radiusDiff, innerHeight);
            }
            
            /*
             * Foreground
             */
            if (true) {
                ctx.translate(-this.shadowOffset, -this.shadowOffset);
                
                var curvy = 0.5;
                
                ctx.moveTo(-cornerRadius, 0);
                ctx.bezierCurveTo(
                    -cornerRadius, -cornerRadius * (1 - curvy), 
                    -cornerRadius * (1 - curvy), -cornerRadius, 
                    0, -cornerRadius);
                    
                ctx.lineTo(innerWidth, -cornerRadius);
                ctx.bezierCurveTo(
                    innerWidth + cornerRadius * (1 - curvy), -cornerRadius, 
                    innerWidth + cornerRadius, -cornerRadius * (1 - curvy), 
                    innerWidth + cornerRadius, 0);
                
                ctx.lineTo(innerWidth + cornerRadius, innerHeight);
                ctx.bezierCurveTo(
                    innerWidth + cornerRadius, innerHeight + cornerRadius * (1 - curvy), 
                    innerWidth + cornerRadius * (1 - curvy), innerHeight + cornerRadius, 
                    innerWidth, innerHeight + cornerRadius);
                    
                ctx.lineTo(0, innerHeight + cornerRadius);
                ctx.bezierCurveTo(
                    -cornerRadius * (1 - curvy), innerHeight + cornerRadius, 
                    -cornerRadius, innerHeight + cornerRadius * (1 - curvy), 
                    -cornerRadius, innerHeight);
                    
                ctx.closePath();
                
                ctx.fillStyle = this.backgroundColor;
                ctx.fill();
            }
        },
        move: function(left, top, width, height) {
            this.left = left;
            this.top = top;
            this.width = width;
            this.height = height;
            
            var radiusDiff = this.shadowRadius - this.cornerRadius;
            var elmt = this.elmt;
            elmt.style.top = (this.top - radiusDiff + this.shadowOffset) + "px";
            elmt.style.left = (this.left - radiusDiff + this.shadowOffset) + "px";
            elmt.style.width = (this.width + 2 * radiusDiff) + "px";
            elmt.style.height = (this.height + 2 * radiusDiff) + "px";
            elmt.width = this.width + 2 * radiusDiff;
            elmt.height = this.height + 2 * radiusDiff;
            
            this.draw();
        },
        _createRadialGradient: function(ctx, x, y, r1, r2, darkColor, lightColor) {
            var g = ctx.createRadialGradient(x, y, r1, x, y, r2);
            g.addColorStop(0, darkColor);
            g.addColorStop(1, lightColor);
            return g;
        },
        _createLinearGradient: function(ctx, x1, y1, x2, y2, darkColor, lightColor) {
            var g = ctx.createLinearGradient(x1, y1, x2, y2);
            g.addColorStop(0, darkColor);
            g.addColorStop(1, lightColor);
            return g;
        }
    };

    $.fn.extend({
        prettybox: function(cornerRadius, shadowRadius, shadowOffset, shadowAlpha) {
            this.each(function() {
                var elem = $(this);
                var bgColor = elem.css('background-color');
                var positions = elem.position();
                var pbox = new DropShadow(bgColor, cornerRadius, shadowRadius,
                                          shadowOffset, shadowAlpha);
                elem.parent().append(pbox.elmt);
                pbox.move(positions.left, positions.top,
                          elem.outerWidth(), elem.outerHeight());
                elem.css('background', 'transparent');
                elem.css('border', '0px');
            });
            return this;
        }
    });

}) (jQuery);
