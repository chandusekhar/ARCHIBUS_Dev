/**
 * Controller to handler pan/zoom functionality.
 * 
 * Used by both Desktop and Mobile.
 */

PanZoomController = Base.extend({
	
	/*
	 * config in JSON format
	 */
	config: {},
	
	/**
	 * the zoom factor relative to the "zoom extents" (default, 1)
	 */
	zoomFactor: 1,
	
	/**
	 * max zoom factor allowed
	 */
	maxZoomFactor: 10,
	
	/**
	 * min zoom factor allowed
	 */
	minZoomFactor: 0.2,
	
	/**
	 * default relative factor to increase/decrease when zoom in/out
	 */
	defaultFactor: 1.25,

	/**
	 * state of the zoom: 0 (default), 1 (zoom extents), 2 (max zoom), 3 (min zoom)
	 */
	zoomState: 0,
	
	constructor: function(config){
		this.config = config;
		
		this.maxZoomFactor = (this.config.maxZoomFactor? this.config.maxZoomFactor : this.maxZoomFactor);
		this.minZoomFactor = (this.config.minZoomFactor? this.config.minZoomFactor : this.minZoomFactor);
		this.zoomState = (this.config.zoomState? this.config.zoomState : 0);
	},

	zoomIn: function(){
		return this.zoom(this.defaultFactor);
	},
	
	zoomOut: function(){
		return this.zoom(1/this.defaultFactor);
	},

	zoom: function(factor){

		factor = this.calculateFactor(factor);

		//no change
		if(factor != 1){
			if(typeof this.config.svg === 'undefined' || !this.config.svg){
				this.config.svg = d3.select("#" + this.config.divId + "-svg");
			}
			
			var svg = this.config.svg,
				box = svg.attr("viewBox").split(/[\s,]/g).map(Number);
		    
			var viewBox = [];
			
			viewBox[2] = Math.round(box[2] / factor);
			viewBox[3] = Math.round(box[3] / factor);
	  
			viewBox[0] = Math.round(box[0] - (viewBox[2] - box[2]) / 2);
			viewBox[1] = Math.round(box[1] - (viewBox[3] - box[3]) / 2);          
		  
			//console.log("zoomFactor="+this.zoomFactor + "box=[" + box.join(" ") + "] viewBox=[" +viewBox.join(" ") + "]");
			
			// ??? d3 issue - frequent set viewbox could cause the svg placed in the wrong coordinates.
	  	    svg.attr("viewBox", viewBox);
		}
		
		return this.getZoomState();

	},

	zoomIntoArea: function(bBox){
		
        var svg = this.config.svg,
		mirror = svg.selectAll("#mirror").node().transform.baseVal.getItem(0).matrix.d;
	 
        var w = svg.node().clientWidth || +svg.style("width").replace(/px$/, ""),
     	h = svg.node().clientHeight || +svg.style("height").replace(/px$/, "");
		
        var rect = svg.node().getBoundingClientRect();
        
        this.pan(rect.left + w/2 - bBox.x - bBox.width/2, rect.top + h/2 - bBox.y - bBox.height/2);
		 
		var zoomFactor = Math.min(w/bBox.width, h/bBox.height);
         
		return this.zoom(zoomFactor);

	},
	
	calculateFactor: function(factor){
		
		if(this.zoomFactor*factor > this.maxZoomFactor){
			factor = Math.round(this.maxZoomFactor*100/this.zoomFactor)/100;
			this.zoomFactor = this.maxZoomFactor;
		} else if(this.zoomFactor*factor < this.minZoomFactor){
			factor = Math.round(this.minZoomFactor*100/this.zoomFactor)/100;
			this.zoomFactor = this.minZoomFactor;
		} else {
			this.zoomFactor = Math.round(this.zoomFactor*100*factor)/100;
		}
		
		return factor;
	},
	
	/**
	 * set zoom factor from the mouse wheel event
	 */
	setZoomFactor: function(delta){
		if(delta > 0){
			this.calculateFactor(Math.round(1/delta));
		} else {
			this.calculateFactor(Math.round(-delta*100)/100);
		}
		
		return this.getZoomState();
	},
	
	/**
     * Zoom to the extent of the drawing
     * @param divId String
     */
    zoomExtents: function () {
        var defaultView = d3.select('#' + this.config.divId + '-svg view[id=defaultView]');

        if (defaultView[0][0] !== null) {
            // console.log('Execute defaultView');
            this.config.svg = d3.select("#" + this.config.divId + "-svg");
            this.config.svg.attr("viewBox", defaultView.attr("viewBox"));
        }
        
        this.zoomFactor = 1;
        
        // return status 1 (zoom extents)
        return 1;
    },
    
   
    /**
	 * Checks if svg is zoomed 
	 * @ return true if svg is zoomed, false otherwise
	 */
	isZoomed: function(){
		this.updateZoomFactor();
		return (this.zoomFactor !== 1);
	},
	

	updateZoomFactor: function(){
		var  defaultView = d3.select('#' + this.config.divId + ' svg view[id=defaultView]');
		var defaultViewBox = '';
		 if (defaultView[0][0] !== null) {
			 defaultViewBox = defaultView.attr("viewBox");
		 }
		var currentViewBox = this.getViewBox(this.config.divId).join(' ');
		
		if(currentViewBox === defaultViewBox){
	        this.zoomFactor = 1;
		} else {
			this.zoomFactor = Math.round(currentViewBox[2]/defaultViewBox[2] * 100)/100;
		}
		
		return this.getZoomState();
	},
	
	getZoomState: function(){
		if(this.zoomFactor == 1){
			this.zoomState = 1;
		} else if (this.zoomFactor == this.maxZoomFactor){
			this.zoomState = 2;
		} else if (this.zoomFactor == this.minZoomFactor){
			this.zoomState = 3;
		} else {
			this.zoomState = 0;
		}
		return this.zoomState;
	},
	
	pan: function(x, y){
		var svg = this.config.svg,
			box = svg.attr("viewBox").split(/[\s,]/g).map(Number),
			w = svg.node().clientWidth || +svg.style("width").replace(/px$/, ""),
			h = svg.node().clientHeight || +svg.style("height").replace(/px$/, ""),
			p = box[2] / w,
			q = box[3] / h,
			r = Math.max(p, q);

		box[0] = box[0] - x * r;
		box[1] = box[1] - y * r;

		svg.attr("viewBox", box);
	},
	
	/**
	 * Returns the viewBox based on <div/> id
	 * @param divId
	 * @return viewBox Array
	 */
	getViewBox: function (divId) {
	    var viewBox = d3.select("#" + divId + "-svg").attr("viewBox").split(" ");
	    if (viewBox.length === 1) {
	        viewBox = d3.select("#" + divId + "-svg").attr("viewBox").split(",");
	    }

	    for (var i = 0; i < viewBox.length; i++) {
	        viewBox[i] = Number(viewBox[i]);
	    }
	    return viewBox;
	}

}, {});

(function() {

	var vendor = (function(p) {
	  var i = -1, n = p.length, s = document.documentElement.style;
	  while (++i < n) if (p[i] + "Transform" in s) return p[i].toLowerCase();
	})(["webkit", "ms", "Moz", "O"]);

	var prefix = vendor ? "-" + vendor.toLowerCase() + "-" : "",
	    use3d = vendor && vendor + "Perspective" in document.documentElement.style;
	
	var modernBrowser = isModernBrowser();

	this.viewBoxZoom = viewBoxZoom;

	function viewBoxZoom() {
	  var event = d3.dispatch("zoomstart", "zoom", "zoomend");

	  function viewBoxZoom(svg) {
	    svg
	        //.style(prefix + "transform-origin", "0 0")
	        //.style(prefix + "backface-visibility", "hidden")
	        .each(zoomable);
	    
        if (modernBrowser) {
            svg.style(prefix + "transform-origin", "0 0")
                .style(prefix + "backface-visibility", "hidden");
        }
	  }

	  return d3.rebind(viewBoxZoom, event, "on");

	  function zoomable() {
	    var that = this,
	        svg = d3.select(that),
	        w = d3.select(window),
	        drag = false,
	        dx0 = 0,
	        dy0 = 0,
	        scale0 = this.getScreenCTM().a,
	        zoom = d3.behavior.zoom()
	          .on("zoomstart", function() { event.zoomstart.call(that); })
	          .on("zoom", function() {
	            if (drag) {
	              if (modernBrowser) {	
		              svg.style(prefix + "transform", "translate3d(" +
		                  Math.floor(d3.event.translate[0] - dx0 * d3.event.scale) + "px," +
		                  Math.floor(d3.event.translate[1] - dy0 * d3.event.scale) + "px,0)" +
		                  "scale3d(" + d3.event.scale + "," + d3.event.scale + ",1)");
	              }
	              event.zoom.call(that, d3.event.scale * scale0);
	            } else {
	              svg.call(viewBox);
	              event.zoom.call(that, scale0);
	            }
	          })
	          .on("zoomend", function() { event.zoomend.call(that, scale0); });

	    svg.call(viewBox);

	    d3.select(this.parentNode)
	        .on("touchstart.viewboxzoom", touchstart)
	        .on("mousedown.viewboxzoom", mousedown)
	        .call(zoom)
	        .call(zoom.event);

	    function touchstart() {
	      // Work around a strange issue in Android 4.1.x, where subsequent touch
	      // events are fired with a null "touches" property, probably due to native
	      // scrolling being triggered.
	      //d3.event.preventDefault();
	      drag = true;
	      w
	          .on("touchend.viewboxzoom", function() {
	            var touchById = {},
	                touches = d3.event.touches,
	                changed = d3.event.changedTouches;
	            for (var i = 0, n = changed.length; i < n; ++i) touchById[changed[i].identifier] = i;
	            for (var i = 0, n = touches.length; i < n; ++i) if (!touchById[touches[i].identifier]) return;
	            w.on("touchend.viewboxzoom", null);
	            svg.call(viewBox);
	          });
	    }

	    function mousedown() {
	      drag = true;
	      w
	          .on("mouseup.viewboxzoom", function() {
	            drag = false;
	            w.on("mouseup.viewboxzoom", null);
	            svg.call(viewBox);
	          });
	    }

	    function viewBox(svg) {
	      var t = zoom.translate(),
	          s = zoom.scale(),
	          box = svg.attr("viewBox").split(/[\s,]/g).map(Number),
	          // See https://bugzilla.mozilla.org/show_bug.cgi?id=874811
	          w = svg.node().clientWidth || +svg.style("width").replace(/px$/, ""),
	          h = svg.node().clientHeight || +svg.style("height").replace(/px$/, ""),
	          p = box[2] / w,
	          q = box[3] / h,
	          r = Math.max(p, q);

	      box[0] = box[0] - (t[0] - dx0) * r / s;
	      box[1] = box[1] - (t[1] - dy0) * r / s;
	      box[2] /= s;
	      box[3] /= s;

	      svg
	          .attr("viewBox", box);
	      
          if (modernBrowser) {
              svg.style(prefix + "transform", "translate3d(0, 0, 0)");
          }

	      // If preserveAspectRatio == "xMidYMid".
	      dx0 = q > p && .5 * (w - s * box[2] / q);
	      dy0 = p > q && .5 * (h - s * box[3] / p);

	      zoom.translate([dx0, dy0]).scale(1);
	      scale0 *= s;
	    }
	  }
	}

    function isIE() {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
    }

    function isModernBrowser() {
        return (isIE () > 9 || !isIE());
    }
    
	})();
