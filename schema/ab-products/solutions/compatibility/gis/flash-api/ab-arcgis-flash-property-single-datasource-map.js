
View.createController('showMap', {
	// Ab.flash.Map control instance
	map: null,
	
	afterViewLoad: function(){
        // initialize the Flash Map control
		this.map = new Ab.flash.Map('mapPanel', 'map', 'pr_ds', true);
	},
	
	pr_list_onShowProperties: function() {   
		// clear the map
		this.map.clear();
		
		// create the marker property to specify property markers for the map
		var markerProperty = new Ab.flash.ArcGISMarkerProperty(
			'pr_ds', 
			['property.lat', 'property.lon'], 
			['property.pr_id'], 
			['property.area_manual', 'property.value_market', 'property.value_book']);
		// the available symbol types are: 'circle' (default), 'cross', 'diamond', 'square', 'x'
		markerProperty.setSymbolType('diamond');
		this.map.updateDataSourceMarkerPropertyPair('pr_ds', markerProperty);
		
		var selectedRows = this.pr_list.getSelectedRows();  
		if (selectedRows.length !== 0 ) {
			// create a restriction based on selected rows
			var restriction = new Ab.view.Restriction();
			for (var i = 0; i < selectedRows.length; i++) {
				restriction.addClause('property.pr_id', selectedRows[i]['property.pr_id'], "=", "OR");
			}
			
 			// set the map restriction and refresh the map
			this.map.refresh(restriction);
		}
	} 
})

