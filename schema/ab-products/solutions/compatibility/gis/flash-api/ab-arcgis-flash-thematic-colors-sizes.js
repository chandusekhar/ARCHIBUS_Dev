View.createController('showMapDefaultSizes', {
	// Ab.flash.ThematicColorSizeMap control instance
	map: null,
	
	afterViewLoad: function(){
		// initialize the Flash Map control
		this.map = new Ab.flash.ThematicColorSizeMap(
			'mapPanel', 
			'map',
			'bl_ds',
			true				
		);
	},
		
	bl_list_onShowBuildings: function() {  
		// clear the map
		this.map.clear();

		var colorBuckets = [400, 1000, 2000];					
						
		// create the marker property to specify building markers for the map
		var markerProperty = new Ab.flash.ArcGISThematicColorSizeMarkerProperty(
			'bl_ds', 
			['bl.lat', 'bl.lon'], 
			['bl.bl_id'],
			['bl.bl_id', 'bl.count_occup', 'bl.cost_sqft'],
			'bl.count_occup', // color field
			colorBuckets,	// color buckets				
			'bl.cost_sqft', // size field
			1,
			true,
			1,
			100		
		);

		markerProperty.colors = [[255,0,0,0.75], [255, 122, 17, 0],  [255, 247, 0, 1], [113, 210, 67, 1]  ];
		markerProperty.setThematic('bl.count_occup', colorBuckets);     	
		//markerProperty.setSymbolType('diamond');
		this.map.updateDataSourceMarkerPropertyPair('bl_ds', markerProperty);
		// create the thematic legend, which is displayed in an Ext.Window 
		this.map.buildThematicLegend(markerProperty);
		
		var selectedRows = this.bl_list.getSelectedRows();  
		if (selectedRows.length !== 0) {
			// create a restriction based on selected rows
			var restriction = new Ab.view.Restriction();
			for (var i = 0; i < selectedRows.length; i++) {
				restriction.addClause('bl.bl_id', selectedRows[i]['bl.bl_id'], "=", "OR");
			}
			
 			// set the map restriction and refresh the map
		    this.map.refresh(restriction);
		}
  } 
})

