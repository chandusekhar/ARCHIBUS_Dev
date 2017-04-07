/**
 * Copyright (c) 2015, ARCHIBUS Inc. All rights reserved.
 * Author: ED
 * 
 * Controller file for MarkerControl.
 */
Drawing.namespace('controllers');

Drawing.controllers.MarkerController = Ab.view.Component.extend({
	
	// @begin_translatable
	z_DELETE_MESSAGE: 'Are you sure you want to delete this item?',	
	z_EDIT_MESSAGE: 'Edit',	
	// @end_translatable
	
	constructor: function(config) {
		Ext.apply(this, config);		
    	this.control = new MarkerControl(config);
    	this.setSvg(d3.select('#' + this.divId + '-svg'));
    	
    	this.setTranslatableStrings();
    },
		
	/**
	 * Adds a marker to the floor plan. Sets up any eventlisteners and properties based on the specified parameters.
	 * @param parameters  Object.  Properties of the marker.
	 * @return image.node()
	 */
	addMarker: function(parameters) {
        return this.getSvgControl().addMarker(parameters);
	},
	
	/**
	 * Private.  Consolidates marker symbol definitions and returns the ID for the <def><symbol/></def>.
	 * @param icon		String.  Base64 URI string of the image.
	 * @param width		Number.  Width of marker.
	 * @param height	Number.	 Height of marker.
	 * @return 			String. id of the <def>
	 */
	consolidateSymbol: function(icon, width, height) {
		return this.getSvgControl().consolidateSymbol(icon, width, height);
	},
	
	/**
	 * Private. Searches for an existing symbol in the <def>.  If there is a match, return the ID of the matched symbol. If no match, return null.
	 * @param defImages	Array.	 Selection of marker symbol images in the floorplan definition.
	 * @param icon		String.  Base64 URI string of the image.
	 * @param width		Number.  Width of marker.
	 * @param height	Number.	 Height of marker.
	 * @return 			String.  Id of the matched <def>
	 */
	searchForExistingDef: function(defImages, icon, width, height) {
		return this.getSvgControl().searchForExistingDef(defImages, icon, width, height);
	},
	
	/**
	 * Private. Enables a marker to move and change location.
	 * @param parameters	Object. Properties of the image
	 */
	move: function(parameters) {
		this.getSvgControl().move(parameters);
	},
	
	/**
	 * Given the id, removes the marker and its label.
	 * @param id  String.  id of the marker symbol.
	 */
	removeMarker: function(id) {
		this.getSvgControl().removeMarker(id);
	},
	
	/**
	 * Give the layerName ('acts-assets'), remove all markers from this layer.
	 * @param layerName String  Id of the marker symbol label.
	 */
	removeMarkers: function(layerName) {
		this.getSvgControl().removeMarkers(layerName);	
	},
	
	/**
	 * Set the label for the marker.
	 * @param parameters Obj. Marker properties.
	 */
	setLabel: function (parameters) {
		return this.getSvgControl().setLabel(parameters);
    },
    
    /**
     * Patch any published <use> elements in the floorplan
     * @param layerName	 String. layer name (i.e. acts-assets)	
     */
    patchAssets: function (layerName) {
    	this.getSvgControl().patchAssets(layerName);
    },
    	
    /**
     * Fly marker back to original position.
     * @param node		Node.  Node to move (usually the parent of the <use> node)
     * @param toX		Number. X coordinate
     * @param toY		Number.	Y coordinate
     * @param toRotation	Number. Angle of rotation
     */
	returnToOriginalPosition: function (node, toX, toY, toRotation) {		
		this.getSvgControl().returnToOriginalPosition(node, toX, toY, toRotation);
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
		this.getSvgControl().placeMarker(parameters);
	},
	
	/**
	 * Private. Handler for placeMarker().
	 * @param	parameters	Object.  Parameters for the Marker.
	 */
	placeMarkerHandler: function(parameters) {
		this.getSvgControl().placeMarkerHandler(parameters);
	},
	
    /**
     * Return MarkerSvg from ab-html-marker-control.js
     * @return this.control MarkerSvg
     */
    getSvgControl: function() {
        return this.control;
    },
	
	getSvg: function() {
		return this.getSvgControl().getSvg();
	},

	setSvg: function(svg) {
		this.getSvgControl().setSvg(svg);
	},
	    
    setTranslatableStrings: function(){
    	this.getSvgControl().z_DELETE_MESSAGE = View.getLocalizedString(this.z_DELETE_MESSAGE);
    	this.getSvgControl().z_EDIT_MESSAGE = View.getLocalizedString(this.z_EDIT_MESSAGE);
    	this.getSvgControl().setTranslatableStrings();
    }
})


