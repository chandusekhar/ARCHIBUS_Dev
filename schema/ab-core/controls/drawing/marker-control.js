/**
 *  Copyright (c) 2015, ARCHIBUS Inc. All rights reserved.
 *  Author: ED
 *  
 *  Defines the HTML5 Base Marker Control.
**/
var MarkerControl = Base.extend({
	
	labelOffset: 5,	
	
	svg: [],
	
	z_DELETE_MESSAGE: 'Are you sure you want to delete this item?',
	z_EDIT_MESSAGE: 'Edit',
	
	constructor: function(config) {
		this.config = config;
    },
			
	/**
	 * Adds a marker to the floor plan. Sets up any event listeners and properties based on the specified parameters.
	 * @param parameters  Object.  Properties of the marker.
	 */
	addMarker: function(parameters) {
        var self = this,
        	svg = self.getSvg();
        
        // add layer if not exists
        if (svg.select('#' + parameters.layer).empty()) {
            svg.select("#assets").append("g").attr("id", parameters.layer);
        }

        // add g container
        var rotate = (parameters.rotate) ? parameters.rotate : 0;
        var g = svg.select('#' + parameters.layer)
            .append("g")
            .classed("editable", true)
            .attr("transform", "translate(" + parameters.x + "," + parameters.y + ")rotate(" + rotate + ")");
        
        // add id, if known
        if (parameters.id) {
            g.attr("id", parameters.layer + '_' + parameters.id);
        }

        // consolidate definition
        var defId = this.consolidateSymbol(parameters.icon, parameters.width, parameters.height);

        // add <use>
        var image = g.append('use')
            .classed({'marker': true})
            .attr("xlink:xlink:href", '#' + defId)
            .attr("x", -parameters.width/2)
            .attr("y", -parameters.height/2)
            .attr("width", parameters.width)
            .attr("height", parameters.height)
            .text(".");

        // add <use> to parameters
        parameters.image = image.node();

        // add splotch
        var rect = g.append("rect")
            .classed({"splotch": true})
            .attr("id", 'splotch_' + parameters.id)
            .attr("width", Number(parameters.width) + 2*this.labelOffset)
            .attr("height", Number(parameters.height) + 2*this.labelOffset)
            .attr("x", -Number(parameters.width)/2 - 5)
            .attr("y", -Number(parameters.height)/2 -5);

        // if id is known, add id to <use> and add label
        if (parameters.id) {
            image.attr("id", parameters.id);

            // label
            if(parameters.label){
                self.setLabel(parameters);
            }
        }
        
        // attach events to marker
        this.addMarkerEvents(parameters, g, image)

        return image.node();
	},
	
	/**
	 * Add events to marker.
	 * @param parameters
	 */
	addMarkerEvents: function(parameters, g, image) {
        // move
        if (parameters.moveEndHandler) {
        	g.call(this.move(parameters));
        }

        // move handler
        var obj = {};
        if (parameters.moveEndHandler) {
            var moveEndHandler = function() {
                parameters.image = image.node();
                var t = d3.transform(d3.select(image.node().parentNode).attr("transform"));
                rotate = (t.rotate) ? t.rotate : 0;
                parameters.rotate = rotate;
                return parameters.moveEndHandler(parameters);
            };
            obj.moveEndHandler = moveEndHandler;
        }

        // if editable, add relevant event handlers
        if (parameters.clickHandler) {

            // edit handler
            var clickHandler = function() {
                parameters.clickHandler(image.node(), parameters);
            };
            obj.editHandler = clickHandler;

            // delete handler
            if (parameters.deleteHandler) {
                var deleteHandler = function() {
                    return parameters.deleteHandler(image.node().id, parameters);
                };
                obj.deleteHandler = deleteHandler;
            }

            // before delete handler
            if (parameters.beforeDeleteHandler) {
                var beforeDeleteHandler = function() {
                    return parameters.beforeDeleteHandler(image.node().id, parameters);
                };
                obj.beforeDeleteHandler = beforeDeleteHandler;
            }

            g.call(markerPlacement.edit(obj));
        }
	},
	
	/**
	 * Private.  Consolidates marker symbol definitions and returns the ID for the <def><symbol/></def>.
	 * @param icon		String.  Base64 URI string of the image.
	 * @param width		Number.  Width of marker.
	 * @param height	Number.	 Height of marker.
	 */
	consolidateSymbol: function(icon, width, height) {
        var self = this;
        var svg = self.getSvg();
        var defImages = svg.select("defs").selectAll(".markersymbol image");
        var defId = self.searchForExistingDef(defImages, icon, width, height);

        // no match found, append
        if (defId === null) {
            defId = svg.attr("id") + '-' + 'MARKER' + defImages.size();
            svg.select("defs")
                .append("symbol")
                .classed({'markersymbol': true})
                .attr("id", defId)
                .attr("overflow", "visible")
	                .append("image")
	                .attr("width", width)
	                .attr("height", height)
	                .attr("xlink:xlink:href", icon);
        }

        return defId;
	},
	
	/**
	 * Private. Searches for an existing symbol in the <def>.  If there is a match, return the ID of the matched symbol. If no match, return null.
	 * @param defImages	Array.	 Selection of marker symbol images in the floorplan definition.
	 * @param icon		String.  Base64 URI string of the image.
	 * @param width		Number.  Width of marker.
	 * @param height	Number.	 Height of marker.
	 */
	searchForExistingDef: function(defImages, icon, width, height) {
        var matchId = null;
        var svg = this.getSvg();

        //var defImages = svg.select("defs").selectAll("image");
        if (defImages.empty()) {
            return null;
        }

        // search for match
        defImages.each(function(){
            var element = d3.select(this);
            var xlink = element.attr("xlink:href");

            // match found
            if (xlink === icon && Number(element.attr("width")) === Number(width) && Number(element.attr("height")) === Number(height)) {
                matchId = d3.select(element.node().parentNode).attr("id");
                return matchId;
            }
        });

        return matchId;
	},

	/**
	 * Private. Enables a marker to move and change location.
	 * @param parameters	Object. Properties of the image
	 */
	move: function(parameters) {
        var self = this,
        	svg = self.getSvg();
        
        return d3.behavior.drag()
            .on("dragstart", function(){
                d3.event.sourceEvent.stopPropagation();

                parameters.originalX = parameters.x;
                parameters.originalY = parameters.y;
                parameters.originalRotate = parameters.rotate;
            })
            .on("drag", function() {
            	// move marker
                position = (d3.touch(svg.node())) ? d3.touch(svg.node()) : d3.mouse(svg.node());
                var t = d3.transform(d3.select(this).attr("transform")),
                    rotate = (t.rotate) ? t.rotate : 0,
                    scale = (t.scale) ? t.scale : 0;		// for clustering

                d3.select(this).attr("transform", "translate(" + Math.round(position[0]) + "," + Math.round(position[1]) + ")rotate(" + rotate + ")" + "scale(" + scale + ")");

                // move text
                var table = parameters.layer.replace('-assets', '');
                var labelLayer = svg.select('#' + table + '-labels');
                var textg = labelLayer.select('#' + "l-" + table + "-" + parameters.id);
                if (!textg.empty()) {
                    var y = Math.round(position[1]);
                    var lines = textg.selectAll("text").size();
                    if (lines > 1) {
                        y = Math.round(position[1]) - (lines * 11)/lines/2;
                    }
                    textg.attr("transform", "translate(" + (Math.round(position[0]) + Number(parameters.width)/2 + 2*self.labelOffset) + "," + y + ")rotate(0)");
                }
            })
            .on("dragend", function() {
                //d3.event.sourceEvent.stopPropagation();
                if ((typeof position != 'undefined') && parameters.moveEndHandler) {
                    var t = d3.transform(d3.select(this).attr("transform")),
                        x = t.translate[0],
                        y = t.translate[1],
                        rotate = (t.rotate) ? t.rotate : 0;

                    if (x != parameters.x || y != parameters.y || rotate != parameters.rotate) {
                        parameters.x = x;
                        parameters.y = y;
                        parameters.rotate = rotate;
                        parameters.image = d3.select(this).select("use").node();
                        parameters.moveEndHandler(parameters);
                    }
                }
            });
	},
	
	/**
	 * Given the id, removes the marker and its label from the DOM.
	 * @param id  String.  id of the marker symbol.
	 */
	removeMarker: function(id) {

        d3.select('#' + id).remove();
        var str = id.split('-assets_');
        var label = d3.select('#l-' + str[0] + '-' + str[1]);
        if (!label.empty()) {
            label.remove();
        }
	},
	
	/**
	 * Given the layer id, remove all markers and their labels within that layer.
	 * @param layerName String. id of the layer.
	 */
	removeMarkers: function(layerName) {
		var svg = this.getSvg();
    	svg.select('#' + layerName).selectAll('.marker').each(function(){
    		d3.select(this.parentNode.parentNode).remove();
    	});
    	svg.selectAll('.cluster .' + layerName).each(function(){
    		d3.select(this).remove();
    	});		
	},
	
	/**
	 * Set the label for the marker.
	 * @param parameters
	 * @return container node for the label
	 */
	setLabel: function (parameters) {
		var svg = this.getSvg();
        var g = d3.select(parameters.image.parentNode);
        var table = parameters.layer.replace('-assets', '');

        var label = parameters.label;
        var fontSize = 11;

        var labelText = label.text;

        var y = parameters.y;
        if (labelText.length > 1) {
            y = Number(parameters.y) - (labelText.length * fontSize)/labelText.length/2;
        }

        var textg = g;
        for (var i=0; i<labelText.length; i++) {
            var text = textg.append("text")
                .classed({'marker-label' : true})
                .on("mouseover", function() {
                    svg.style("cursor", "none");
                    d3.select(this).style("font-size", "2em");
                })
                .on("mouseout", function() {
                    svg.style("cursor", "move");
                    d3.select(this).style("font-size", null);
                })
                .attr("font-size", fontSize + "px")
                .attr("x", (Number(parameters.width/2) + 2*this.labelOffset))
                .attr("y", 0)
                .text(labelText[i]);
            if (i > 0) {
                text.attr("y", fontSize*i);
            }
        }

        return textg;
    },
    
    /**
     * Patch any published <use> elements in the floorplan.
     * @param layerName	 String. layer name (i.e. acts-assets)	
     */
    patchAssets: function (layerName) {
        var elements = this.getSvg().select('#' + layerName).selectAll("use");
        elements.each(function() {
            var element = d3.select(this);
            var x = element.attr("x");
            var y = element.attr("y")
            if (d3.select(this.parentNode).attr("id") === layerName) {
                var g = d3.select(this.parentNode).append("g")
                    .attr("id", layerName + '_' + element.attr('id'))
                    .attr("class", "editable")
                    .append("g")
                    .attr("transform", "translate(" + x + "," + y + ")rotate(0)");
                g.node().appendChild(this);
                element.attr("x", null)
                    .attr("y", null);
                var rect = g.node().getBBox();
                g.append("rect")                    // rectangle
                    .attr("id", element.attr('id') + '_splotch')
                    .classed({"splotch": true})
                    .attr("x", rect.x - 5)
                    .attr("y", rect.y - 5)
                    .attr("width", rect.width + 2*this.labelOffset)
                    .attr("height", rect.height + 2*this.labelOffset);
            }
        });
    },
    	
    /**
     * Fly marker back to original position. 
     * @param node		Node.  Node to move (usually the parent of the <use> node)
     * @param toX		Number. X coordinate
     * @param toY		Number.	Y coordinate
     * @param toRotation	Number. Angle of rotation
     */
	returnToOriginalPosition: function (node, toX, toY, toRotation) {		
        d3.select(node)
            .transition()
            .duration(200)
            .ease("linear")
            .each("end", function(){
                var t = d3.transform(d3.select(this).attr("transform")),
                    rotate = (t.rotate) ? t.rotate : 0;
                
                // update position
                var transform = "translate(" + toX + "," + toY + ")rotate(" + toRotation + ")";
                if (t.scale) {
                    transform  += " scale(" + t.scale + ")";
                }
                d3.select(this).transition().attr("transform", transform);

                // update grips
                var grips = d3.select('#' + d3.select(node).attr("id") + '_grips');
                if (!grips.empty()) {
                    grips.transition().attr("transform", "translate(" + Math.round(toX) + "," + Math.round(toY) + ")" + "rotate(" + toRotation +  ")" );
                }
            });
	},
	
	/**
	 * After selecting a marker from the marker legend, call this API.  API will perform the following sequence of events:
	 * 		-On desktop browsers, change the mouse cursor to a cross
	 * 		-Turn on the sensor for the floorplan to capture the next click or tap
	 * 		-When the user clicks or taps on a location in the floorplan, determine the position
	 * 		-Call addMarker() to insert the selected symbol onto the drawing
	 * 		-Turn off the sensor, change the mouse cursor back, and return to regular mode
	 * 		-Issue callback handler
	 * @param	parameters	Object.  Parameters for the Marker.
	 */
	placeMarker: function(parameters) {
		var self = this,
			svg = self.getSvg();
        d3.select(svg.node().parentNode)
            .on("touchstart.insertable", function(){
            	self.placeMarkerHandler(svg, parameters);
            }, true)
            .on("mousedown.insertable", function(){
            	self.placeMarkerHandler(svg, parameters);
            }, true);
        svg.style("cursor", "crosshair");
	},
	
	/**
	 * Private. Handler for placeMarker().
	 * @param	parameters	Object.  Parameters for the Marker.
	 */
	placeMarkerHandler: function(svg, parameters) {
		var self = this;
        var point = svg.node().createSVGPoint();
        var position = (d3.touch(svg.node())) ? d3.touch(svg.node()) : d3.mouse(svg.node());
        parameters.x = Math.round( position[0]);
        parameters.y = Math.round( position[1]);

        // add marker
        var image = self.addMarker(parameters);

        var w = d3.select(window)
        	.on("touchstart.insertable", null)
        	.on("mousedown.insertable", null);

        d3.select(svg.node().parentNode)
            .on("touchstart.insertable", null)
            .on("mousedown.insertable", null);

        svg.style("cursor", "default");

        if (parameters.handler) {
            parameters.image = image;
            parameters.event = d3.event;
            parameters.handler(parameters);
        }
	},
	
	getSvg: function() {
		return this.svg;
	},

	setSvg: function(svg) {
		this.svg = svg;
	},
		
	setTranslatableStrings: function(){
		markerPlacement.z_DELETE_MESSAGE = this.z_DELETE_MESSAGE;
		markerPlacement.z_EDIT_MESSAGE = this.z_EDIT_MESSAGE;
	}
});