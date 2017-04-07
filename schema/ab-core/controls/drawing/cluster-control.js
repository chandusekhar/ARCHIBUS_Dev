/**
 * Copyright (c) 2015, ARCHIBUS Inc. All rights reserved.
 * Created by: JD
 * Modified by: ED
 * 
 * Defines the HTML5 Base Cluster Control.
*/
var ClusterControl = Base.extend({
		
	layerName: '',				// the layer name of which to apply cluster
	
	svg: [],					// the svg of the drawing
	
	zoom: null,					// zoom drawing
	
	enabled: true,
	
	radius: [10.5, 20.5],
	
	fontSize: [12, 20],
	
	minClampScale: 0.25,
	
	maxClampScale: 0.75,
	
    /**
     * Constructor.
     */
	constructor: function(config){		
		this.config = config;				
		Ext.apply(this, config);
		this.setSvg(d3.select('#' + this.divId + '-svg'));
	},
	
	/**
	 * Cluster similarity metric: Euclidean squared distance.
	 */
	distance: function(a, b) {
		var dx = a.x - b.x, dy = a.y - b.y;
		return dx * dx + dy * dy;	
	},
	
	/**
	 * Minimum distance based on current scale.
	 * Squared, since we are using Euclidean squared distance.
	 */
	minDistance: function(scale) {
		return 25 * 25 / (scale * scale);
	},
	
	/**
	 * Allow scaling within a range, otherwise clamp to one end of the range.
	 */
	clampScale: function(min, max, s) {
		return s < min ? min / s : s > max ? max / s : 1;
	},
	
	/**
	 * Click handler for clusters.
	 * @param c
	 */
	clickHandler: function(c) {
	},
	
	/**
	 * Private. Build the initial cluster.
	 * @param layerName 	String.	 Name of the marker layer
	 * @param config		Object.  Config options.
	 */
	build: function(layerName, config) {
				
		var self = this;		
		var fontSize = d3.scale.log().domain([1, 10]).range(self.fontSize).clamp(true);
		var cluster = zoomCluster()
			.distance(this.distance) // similarity metric
			.minDistance(this.minDistance) // anything closer than this projected distance is clustered.
			.radius(d3.scale.log().domain([1, 10]).range(this.radius).clamp(true))
			.fontSize(function(d) { return fontSize(d) + "px"; })
			.layerName(this.layerName);
				
		this.zoom = viewBoxZoom()
	      .on("zoomstart.cluster", function() {
	    	  if (self.enabled) {
	    		  self.zoom.on("zoom.cluster", cluster(d3.select(this).selectAll("#" + layerName).selectAll("g")));
	    	  }
	      })
	      .on("zoom.scale", function(scale) {
	      })
	      .on("zoomend.cluster", function(scale) {
	    	  d3.select(this).selectAll("#" + layerName).selectAll("g")
	            .each(function() {
		              var transforms = this.transform.baseVal,
		                  last = transforms.getItem(transforms.numberOfItems - 1),
		                  s = self.clampScale(self.minClampScale, self.maxClampScale, scale);
		              if (last.type === SVGTransform.SVG_TRANSFORM_SCALE) {
		            	  last.setScale(s, s);
		              } else {
		            	  var transform = this.ownerSVGElement.createSVGTransform();
		            	  transform.setScale(s, s);
		            	  transforms.appendItem(transform);
		              }
		      });  
	    	  d3.select(this).selectAll(".cluster").on("click", self.clickHandler);
	    	  self.zoom.on("zoom.cluster", null);
	      });

	  var svg = this.getSvg()
	      .style("cursor", "move")
	      .call(self.zoom); // attach zoom event listeners, and executes an initial zoom gesture to render initial clusters
	},
	
	/**
	 * Private. Initial cluster (for use in the drawing control).
	 */
	cluster: function() {		
		this.build(this.layerName, this.config);
	},
	
	/**
	 * API to update clusters (for application developers).
	 */
	recluster: function() {
		this.getSvg().call(this.zoom);	
	},
	
	
	// ---------------------------- Getters and Setters -----------------------------------------------
	getSvg: function() {
		return this.svg;
	},

	setSvg: function(svg) {
		this.svg = svg;
		this.cluster();
	},
	
	setEnabled: function(enabled) {
		this.enabled = enabled;
		var svg = this.getSvg();
		if (this.enabled === false) {
		    svg.selectAll("#" + this.layerName).selectAll("g").style("display", null);
		    svg.selectAll(".cluster." + this.layerName).remove();
		}
	    svg.call(this.zoom); // attach zoom event listeners, and executes an initial zoom gesture to render initial clusters
	},
	
	getEnabled: function() {
		return this.enabled;
	}
}); 

