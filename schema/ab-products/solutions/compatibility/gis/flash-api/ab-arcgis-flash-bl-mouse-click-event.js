
/**
 * This function is called from the Flash Map control after it is loaded. 
 * In this example, it sets the map extent. By default, the map displays USA.
 * 
 * @param {panelId} The ID of the parent HTML panel defined in the AXVW file.
 * @param {mapId}   The ID of the EMBED element that hosts the map control SWF file. 
 */
function afterMapLoad_JS(panelId, mapId) {
	// mapControl is a global JS variable that refers to the Ab.flash.Map control instance
	// mapControl.map is the nested ActionScript control
	mapControl.map.changeExtent(
			-9177000,	// xmin: bottom-left X-coordinate of an extent envelope
			4317000,  // ymin: bottom-left Y-coordinate of an extent envelope
			-7639000, // xmax: top-right X-coordinate of an extent envelope
			5417000);	// ymax: top-right Y-coordinate of an extent envelope
}

View.createController('showMap', {
	// Ab.flash.ArcGISMap instance
	map: null,
	
	afterViewLoad: function(){
		//create map
		this.map = new Ab.flash.Map(
			'mapPanel', 
			'map',
			'bl_ds',
			true				
		);
				
		// add the mouse click event handler 
		this.map.addMouseClickEventHandler(this.showBuildingDetails); 	
	},
	
	/**
	 * The mouse click event handler. 
	 * The function parameters are from the tooltip. They are set when you create the Ab.flash.ArcGISMarkerProperty.
	 * @param {title} The value of the tooltip's title.  e.g. the value of the 'bl.bl_id'.
	 * @param {attributes} The key-value pairs of the tooltip's attributes.
	 */
	showBuildingDetails: function(title, attributes) {  	
		var bl_id = title;
		var restriction = new Ab.view.Restriction();
		restriction.addClause('bl.bl_id', bl_id, "=", "OR");
		View.openDialog('ab-arcgis-flash-bl-details-dialog.axvw', restriction); 	
	},

	/**
	 * Display all buildings in PA as markers on the map.
	 */
	mapPanel_onShowBuildings: function() {
		// create the marker property to specify building markers for the map
		var markerProperty = new Ab.flash.ArcGISMarkerProperty(
			'bl_ds', 
			['bl.lat', 'bl.lon'], 
			['bl.bl_id'], 
			['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id']);
		this.map.updateDataSourceMarkerPropertyPair('bl_ds', markerProperty);
				
		// refresh the map
		var restriction = new Ab.view.Restriction();
		restriction.addClause('bl.state_id', 'PA', "=", "OR");
		this.map.refresh(restriction);
	},
	
	/**
	 * Clears all markers.
	 */
	mapPanel_onClearBuildings: function() {
		this.map.clear();
	}
});



