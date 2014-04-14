	// jquery-roundcorners-canvas
	// www.meerbox.nl
	
(function($){
	
	var _corner = function(options) {
		
		// no native canvas support, or its msie and excanvas.js not loaded
		var testcanvas = document.createElement("canvas");
		if (typeof G_vmlCanvasManager == 'undefined' && $.browser.msie) {
			return this.each(function() {});
		}
		
		// get lowest number from array
		var asNum = function(a, b) { return a-b; };
		var getMin = function(a) {
			var b = a.concat();
			return b.sort(asNum)[0];
		};
		
		// get CSS value as integer
		var getCSSint = function(el, prop) {
			return parseInt($.css(el.jquery?el[0]:el,prop))||0;
		};
			
		// draw the round corner in Canvas object
		var drawRoundCornerCanvasShape = function(canvas,radius,r_type,bg_color,border_width,border_color) {
			
			// change rgba(1,2,3,0.9) to rgb(1,2,3)
			var reg = /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/;   
			var bits = reg.exec(bg_color);
			if (bits) {
				channels = new Array(parseInt(bits[1]),parseInt(bits[2]),parseInt(bits[3]));
				bg_color = 'rgb('+channels[0]+', '+channels[1]+', '+channels[2]+')';
			} 
		
			var border_width = parseInt(border_width);
			
			var ctx = canvas.getContext('2d');
			
			if (radius == 1) {
				ctx.fillStyle = bg_color;
				ctx.fillRect(0,0,1,1);
				return;
			}
	
			if (r_type == 'tl') {
				var steps = new Array(0,0,radius,0,radius,0,0,radius,0,0);
			} else if (r_type == 'tr') {
				var steps = new Array(radius,0,radius,radius,radius,0,0,0,0,0);
			} else if (r_type == 'bl') {
				var steps = new Array(0,radius,radius,radius,0,radius,0,0,0,radius);
			} else if (r_type == 'br') {
				var steps = new Array(radius,radius,radius,0,radius,0,0,radius,radius,radius);
			}
	          
			ctx.fillStyle = bg_color;
	    	ctx.beginPath();
	     	ctx.moveTo(steps[0],steps[1]); 
	     	ctx.lineTo(steps[2], steps[3]); 
	    	if(r_type == 'br') ctx.bezierCurveTo(steps[4], steps[5], radius, radius, steps[6], steps[7]); 
	    	else ctx.bezierCurveTo(steps[4], steps[5], 0, 0, steps[6], steps[7]);
			ctx.lineTo(steps[8], steps[9]); 
	        ctx.fill(); 
	        
	        // draw border
	        if (border_width > 0 && border_width < radius) {
		        
		        // offset caused by border
		        var offset = border_width/2; 
		        
		        if (r_type == 'tl') {
					var steps = new Array(radius-offset,offset,radius-offset,offset,offset,radius-offset);
					var curve_to = new Array(0,0);
				} else if (r_type == 'tr') {
					var steps = new Array(radius-offset,radius-offset,radius-offset,offset,offset,offset);
					var curve_to = new Array(0,0);
				} else if (r_type == 'bl') {
					var steps = new Array(radius-offset,radius-offset,offset,radius-offset,offset,offset,offset,radius-offset);
					var curve_to = new Array(0,0);
				} else if (r_type == 'br') {
					var steps = new Array(radius-offset,offset,radius-offset,offset,offset,radius-offset,radius-offset,radius-offset);
					var curve_to = new Array(radius, radius);
				}
		        
		        ctx.strokeStyle = border_color;
		        ctx.lineWidth = border_width;
	    		ctx.beginPath();
	    		// go to corner to begin curve
	     		ctx.moveTo(steps[0], steps[1]); 
	     		// curve from righttop to leftbottom (for the tl canvas)
	    		ctx.bezierCurveTo(steps[2], steps[3], curve_to[0], curve_to[1], steps[4], steps[5]); 
				ctx.stroke();
		        
		    }
		};
		
		var creatCanvas = function(p,radius) {
			var elm = document.createElement('canvas');
			elm.setAttribute("height", radius);
    		elm.setAttribute("width", radius); 
			elm.style.display = "block";
			elm.style.position = "absolute";
			elm.className = "cornercanvas";
			elm = p.appendChild(elm); 
			// if G_vmlCanvasManager in defined the browser (ie only) has loaded excanvas.js 
			if (!elm.getContext && typeof G_vmlCanvasManager != 'undefined') {
				var elm = G_vmlCanvasManager.initElement(elm);
			}
			return elm;
		};
		
		// interpret the (string) argument
   		var o = (options || "").toLowerCase();
   		var radius = parseInt((o.match(/(\d+)px/)||[])[1]) || null; // corner width
   		var bg_color = ((o.match(/(#[0-9a-f]+)/)||[])[1]);  // strip color
   		if (radius == null) { radius = "auto"; }
   		
   		var edges = { T:0, B:1 };
    	var opts = {
        	tl:  /top|tl/.test(o),       
        	tr:  /top|tr/.test(o),
        	bl:  /bottom|bl/.test(o),    
        	br:  /bottom|br/.test(o)
    	};
    	if ( !opts.tl && !opts.tr && !opts.bl && !opts.br) {
        	opts = { tl:1, tr:1, bl:1, br:1 };
        }
      
		return this.each(function() {

			var elm = $(this);
			
			// give the element 'haslayout'
	   		if ($.browser.msie) { this.style.zoom = 1; }
			
			// the size of the corner is not defined...
			var widthheight_smallest = getMin(new Array(getCSSint(this,'height'),getCSSint(this,'width')));
			if (radius == "auto") {
				radius = widthheight_smallest/4;
				if (radius > 10) { radius = 10; }
			}

			// the size of the corner can't be to high
			if (widthheight_smallest < radius) { 
				radius = (widthheight_smallest/2); 
			}
			
			// remove old canvas objects
			elm.children("canvas.cornercanvas").remove();
			
			// some css thats required in order to position the canvas elements
			if (elm.css('position') == 'static') { 
				elm.css('position','relative'); 
			// only needed for ie6 and (ie7 in Quirks mode) , CSS1Compat == Strict mode
			} else if (elm.css('position') == 'fixed' && $.browser.msie && !(document.compatMode == 'CSS1Compat' && typeof document.body.style.maxHeight != "undefined")) { 
				elm.css('position','absolute'); 
			}
			elm.css('overflow','visible'); 
			
			// get border width
			var border_t = getCSSint(this, 'borderTopWidth');
			var border_r = getCSSint(this, 'borderRightWidth');
			var border_b = getCSSint(this, 'borderBottomWidth');
			var border_l = getCSSint(this, 'borderLeftWidth');
			
			// get the lowest borderwidth of the corners in use
			var bordersWidth = new Array();
			if (opts.tl || opts.tr) { bordersWidth.push(border_t); }
			if (opts.br || opts.tr) { bordersWidth.push(border_r); }
			if (opts.br || opts.bl) { bordersWidth.push(border_b); }
			if (opts.bl || opts.tl) { bordersWidth.push(border_l); }
			
			borderswidth_smallest = getMin(bordersWidth);
			
			// creat the canvas elements and position them
			var p_top = 0-border_t;
			var p_right = 0-border_r;
			var p_bottom = 0-border_b;
			var p_left = 0-border_l;	

			if (opts.tl) { var tl = $(creatCanvas(this,radius)).css({left:p_left,top:p_top}).get(0); }
			if (opts.tr) { var tr = $(creatCanvas(this,radius)).css({right:p_right,top:p_top}).get(0); }
			if (opts.bl) { var bl = $(creatCanvas(this,radius)).css({left:p_left,bottom:p_bottom}).get(0); }
			if (opts.br) { var br = $(creatCanvas(this,radius)).css({right:p_right,bottom:p_bottom}).get(0); }
			
			// get the background color of parent element
			
			if (bg_color == undefined) {
				
				var current_p = elm.parent();
				var bg = current_p.css('background-color');
				while((bg == "transparent" || bg == "rgba(0, 0, 0, 0)") && current_p.get(0).tagName.toLowerCase() != "html") {
					bg = current_p.css('background-color');
					current_p = current_p.parent();
				}
			} else {
				bg = bg_color;
			}

			if (bg == "transparent" || bg == "rgba(0, 0, 0, 0)") { bg = "#ffffff"; }
			
			if (opts.tl) { drawRoundCornerCanvasShape(tl,radius,'tl',bg,borderswidth_smallest,elm.css('borderTopColor')); }
			if (opts.tr) { drawRoundCornerCanvasShape(tr,radius,'tr',bg,borderswidth_smallest,elm.css('borderTopColor')); }
			if (opts.bl) { drawRoundCornerCanvasShape(bl,radius,'bl',bg,borderswidth_smallest,elm.css('borderBottomColor')); }
			if (opts.br) { drawRoundCornerCanvasShape(br,radius,'br',bg,borderswidth_smallest,elm.css('borderBottomColor')); }
			
			elm.addClass('roundCornersParent');
				
   		});  
	};
	
	if ($.browser.msie && typeof G_vmlCanvasManager == 'undefined') {
		
		var corner_buffer = new Array();
		var corner_buffer_args = new Array();
		
		$.fn.corner = function(options){
			corner_buffer[corner_buffer.length] = this;
    		corner_buffer_args[corner_buffer_args.length] = options;
			return this.each(function(){});
		};
		
		// load excanvas.pack.js
		document.execCommand("BackgroundImageCache", false, true);
		var elm = $("script[@src*=jquery.corner.]");
		if (elm.length == 1) {
			var jc_src = elm.attr('src');
			var pathArray = jc_src.split('/');
			pathArray.pop();
			var base = pathArray.join('/') || '.';
			var excanvasjs = base+'/excanvas.pack.js';
			$.getScript(excanvasjs,function(){
				 execbuffer();
			});
		}
		
		var execbuffer = function() {
			// set back function
			$.fn.corner = _corner;
			// execute buffer and set back function
			for(var i=0;i<corner_buffer.length;i++){
				corner_buffer[i].corner(corner_buffer_args[i]);
			}
			corner_buffer = null;
			corner_buffer_args = null;
		}
		
	} else {
		$.fn.corner = _corner;
	}
	
})(jQuery);
