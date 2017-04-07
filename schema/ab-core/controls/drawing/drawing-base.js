/*
 * Based on DrawingSvg.
 */
var DrawingBase = Base.extend({

	drawingController: null,
	
	config: {},
	
	/**
     * Constructor.
     *
     * @param divId String Id of <div/> that holds the svg
     * @param config configObject
     */
    constructor: function(divId, config) {
        this.inherit(divId, 'html', config);
        this.config = config;
        this.config.divId = divId;
        
        this.drawingController = new DrawingController(this.config);
    },

    /**
     * Returns the <div/> selection based on id
     * @return object HTMLDivElement
     */
    getDiv: function () {
        return d3.select("#" + this.config.divId);
    },

    /**
     * Returns the SVG selection based on <div/> id
     * @return object SVGSVGElement
     */
    getSvg: function () {
        return d3.select("#" + this.config.divId + "-svg");
    },
    
    
    getDrawingController: function(){
    	return this.drawingController;
    },
    
    getController: function(controllerId){
    	return this.drawingController.getController(controllerId);
    },
    
    /**
     * Returns the specified AddOn by Id.
     * @param addOnId
     * @return object registered add-on.
     */
    getAddOn: function (addOnId){
    	return this.drawingController.getAddOn(addOnId);
    },
    

 
    /**
     * Creates and return an svg.
     * @param div       (selection) Div to hold the svg
     * @param width     (number)  Width of the image
     * @param height    (number)  Height of the image
     * @returns {*}     (selection) svg
     */
    createSvg: function(div, width, height) {
    	
    	// remove the existing svg with the same id.
    	if (!div.select('#' + this.divId + "-svg").empty()) {
            div.select('#' + this.divId + "-svg").remove();
        }
    	
        var svg = div.append("svg")
            .attr("id", div.attr("id") + "-svg").attr("version", "1.1")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("xmlns:xmlns:xlink", "http://www.w3.org/1999/xlink")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", "0 0 " + width + " " + height);

        svg.append("style");
        svg.append("defs");

        var viewer = svg.append("g")
            .attr("id", "viewer");

        var mirror = viewer.append("g")
            .attr("id", "mirror")
            .attr("stroke-width", "0.9%")
            .attr("transform", "scale(1, 1)");

        mirror.append("g")
            .attr("id", "background")
            .attr("fill", "none");

        mirror.append("g")
            .attr("id", "assets")
            .attr("fill", "none");

        return svg;
    },

	 /**
	 * Gets drawing's Image Bytes
	 * 
	 */
	getImageBytes: function(){
		var result = '';
		var imageCapture = new ImageCapture();
		var drawingDiv = this.config.divId;
		imageCapture.captureImage(drawingDiv, false, function(image){
			result = image.substring(22);
 	   	});
		return result;
	},

    /**
     * Load an image into div.
     * @param div       (selection) Div to hold the image.
     * @param href      (string)    URL for the image.
     */
    loadImage: function(div, href) {
        var control = this;

        if (!div.select(div.attr("id") + "-svg").empty()) {
            div.select(div.attr("id") + "-svg").remove();
        }

        var img = new Image();
        img.onload = function () {
            var svg = control.createSvg(div, this.width, this.height);
        	var g = svg.select("#background").append("g");

            // create image
            g.append("image")
                .attr("id", div.node().id + "_image")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", '100%')
                .attr("height", '100%')
                .attr("xlink:xlink:href", href)
                .html(".");
        };
    	img.src = href;
    },
    
	/**
	 * Disable label selection.
	 */
    disableLabelSelection: function (svg) {
        svg.select("#asset-labels").classed({'no-selection': true});
        svg.select("#text").classed({'no-selection': true});
    }
});


