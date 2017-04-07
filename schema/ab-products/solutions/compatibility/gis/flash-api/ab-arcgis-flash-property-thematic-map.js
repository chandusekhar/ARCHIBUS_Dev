
View.createController('showMap', {
	// Ab.flash.Map control instance
	map: null,
	
	afterViewLoad: function(){
        // initialize the Flash Map control
		this.map = new Ab.flash.Map(
			'mapPanel', 
			'map',
			'pr_ds',
			true					
		);
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
		markerProperty.setSymbolType('diamond');
		this.map.updateDataSourceMarkerPropertyPair('pr_ds', markerProperty);
		
		// set thematic properties for MarkerProperty
		//
		// parameters: 
		// thematicField - the field value which decides which thematic bucket the marker belongs to.  
		// thematicBuckets - an array which holds the thematic buckets values.  
		// e.g. if thematicBuckets has 3 values: 10, 20, 30
		// then there are 4 actual buckets
		// 0: value < 10
		// 1: 10 <= value < 20
		// 2: 20 <= value < 30
		// 3: 30 <= value 
		//			
		// the colors for symbols in different buckets are predefined
		var thematicBuckets = [200000, 7000000, 10000000, 22000000, 50000000];	 
		markerProperty.setThematic('property.value_market', thematicBuckets); 
		
		// create the thematic legend, which is displayed in an Ext.Window 
		this.map.buildThematicLegend(markerProperty);
		
		var selectedRows = this.pr_list.getSelectedRows();  
		if (selectedRows.length !== 0) {
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

