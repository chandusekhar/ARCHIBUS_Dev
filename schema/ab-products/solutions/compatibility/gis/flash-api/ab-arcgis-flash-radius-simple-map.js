/**
 * The controller initializes the Flash Map control.
 */
View.createController('showMap', {
	// Ab.flash.Map.RadiusMap control instance
	map: null,
	
	afterViewLoad: function() {
	
		this.map = new Ab.flash.Map.RadiusMap(
			'mapPanel', // ID of the HTML panel that should contain the map control
			'map',		// ID of the DIV element that should contain the map control
			'bl_ds',     // ID of the data source for the map 
			true			// Whether or not to show label
		);	
		
	}
});

/**
 * This function is called from the Flash Map control after it is loaded. 
 * In this example, it:
 * 1. Sets up the map to use the Building data source and fields to display building locations as map markers.
 * 2. Applies a restriction to the map to display buildings located in the state of Pennsylvania, US.  
 * 
 * @param {panelId} The ID of the parent HTML panel defined in the AXVW file.
 * @param {mapId}   The ID of the EMBED element that hosts the map control SWF file. 
 */
function afterMapLoad_JS(panelId, mapId){
	// Prepare the Marker Property.
	// Ab.flash.ArcGISMarkerProperty defines common properties for a group of markers on the map. 
	// You can display markers from multiple data sources. For each data source, create a corresponding Ab.flash.ArcGISMarkerProperty.

	// Parameters: 
	// dataSourceName - The dataSource ID associated with markers.
	// geometryFields - The list of fields which define the geometry of markers (lat, lon).
	// infoWindowTitleFields - The list of fields which define the infoWindow title.
	// infoWindowAttributeFields - The list of fields which define attributes for the intoWindow. 
	// infoWindow will be shown as a tooltip when the user mouses over a marker.
    var blMarkerProperty = new Ab.flash.ArcGISRadiusMarkerProperty(
		'bl_ds', 
		['bl.lat', 'bl.lon'], 
		['bl.bl_id'],
		['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id', 'bl.radius_evac'],
		'bl.radius_evac'		// specify the radius field
		);
  
    // Add a data source -- Ab.flash.ArcGISMarkerProperty pair to the map in order to draw markers.
    mapControl.updateDataSourceMarkerPropertyPair('bl_ds', blMarkerProperty);
  
    // Refresh and re-draw the map.
    // The restriction passed through the refresh() will only be applied to the first data source.
    // (data sources can be added through mapControl.updateDataSourceMarkerPropertyPair() method)
    var restriction = new Ab.view.Restriction();
    restriction.addClause('bl.bl_id', 'HQ', "=", "OR");
    restriction.addClause('bl.bl_id', 'JFK A', "=", "OR");
    restriction.addClause('bl.bl_id', 'JFK B', "=", "OR");
    restriction.addClause('bl.bl_id', 'I204', "=", "OR");    
    mapControl.refresh(restriction);

    // NOTE: mapControl is a global JS variable that refers to the single Ab.flash.Map control instance
    // embedded in into this view. You cannot use more than one Flash Map control in any view or dashboard.
}
