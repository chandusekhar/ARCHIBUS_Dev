
View.createController('showMap', {
	// Ab.flash.Map control instance
	map: null,
	
	afterViewLoad: function() {
	    // initialize the Flash Map control
		this.map = new Ab.flash.Map('mapPanel', 'map', 'bl_ds', true);
	},
	
	/**
	 * Display selected properties on the map.
	 */	
	pr_list_onShowProperties: function() {   
		// clear the map
		this.map.clear();
		
		// set the map data source
		this.map.dataSourceId = 'pr_ds';

		// create the marker property to specify property markers for the map
		var markerProperty = new Ab.flash.ArcGISMarkerProperty(
            'pr_ds', 
            ['property.lat', 'property.lon'], 
            ['property.pr_id'], 
            ['property.area_manual', 'property.value_market', 'property.value_book']);
		markerProperty.setSymbolType('diamond');
		this.map.updateDataSourceMarkerPropertyPair('pr_ds', markerProperty);
		
		// apply the selected properties restriction and refresh the map 
		var selectedRows = this.pr_list.getSelectedRows();
		if (selectedRows.length !== 0) {
 			// create restriction for selected rows
 			var restriction = new Ab.view.Restriction();	
			for (var i = 0; i < selectedRows.length; i++) {
				restriction.addClause('property.pr_id', selectedRows[i]['property.pr_id'], "=", "OR");
			}
 			
 			// set the map restriction and refresh the map
 	 		this.map.refresh(restriction);
		}
	}, 
	
	/**
	 * Display selected buildings on the map.
	 */	
	bl_list_onShowBuildings: function() {   
		// clear the map
		this.map.clear();
		
		// set the map data source
		this.map.dataSourceId = 'bl_ds';

		// create the marker property to specify building markers for the map
		var markerProperty = new Ab.flash.ArcGISMarkerProperty(
            'bl_ds', 
            ['bl.lat', 'bl.lon'], 
            ['bl.bl_id'], 
            ['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id']);   		
		markerProperty.setSymbolType('circle');
		this.map.updateDataSourceMarkerPropertyPair('bl_ds', markerProperty);

		// apply the selected buildings restriction and refresh the map 
		var selectedRows = this.bl_list.getSelectedRows();
 		if (selectedRows.length !== 0) {
 			// create restriction for selected rows
 			var restriction = new Ab.view.Restriction();	
 			for (var i = 0; i < selectedRows.length; i++) {
 				restriction.addClause('bl.bl_id', selectedRows[i]['bl.bl_id'], "=", "OR");
 			}
 			
 			// set the map restriction and refresh the map
 	 		this.map.refresh(restriction);
 		}
 	} 
});

