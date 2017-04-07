View.createController('mapController', {

    // the Ab.arcgis.ArcGISMap control
	mapControl: null,

	afterViewLoad: function(){
        var mapController = View.controllers.get('mapController');
    	var configObject = new Ab.view.ConfigObject();

    	mapController.mapControl = new Ab.arcgis.ArcGISMap('mapPanel', 'map', configObject);
	},

  	afterInitialDataFetch: function() {

      	var reportTargetPanel = document.getElementById("mapPanel");            
      	reportTargetPanel.className = 'claro';

  	},	

	bl_list_onShowBuildings: function() {  
		
        var mapController = View.controllers.get('mapController');

		// create the marker property to specify building markers for the map
		var markerProperty = new Ab.arcgis.ArcGISMarkerProperty(
			'bl_ds', 									// datasource
			['bl.lat', 'bl.lon'], 						// geometry fields
			['bl.bl_id'],								// datasource key
			['bl.bl_id', 'bl.use1', 'bl.count_occup'] 	// infowindow fields
		);

		// set marker properties
		markerProperty.showLabels = false;
		markerProperty.symbolSize = 15;
		markerProperty.symbolColors = mapController.mapControl.colorbrewer2rgb(colorbrewer.Paired2[12]);

		// set up thematic graduated markers 
     	var thematicBuckets = [];     // color -- empty buckets -- use unique value renderer
     	var graduatedBuckets =        // size
     		[	{limit: 100, size: 10},
     			{limit: 500, size: 20},
     			{limit: 1000, size: 30},
     			{limit: +Infinity, size: 40}
     	];
     	markerProperty.setThematicGraduated('bl.use1', thematicBuckets, 'bl.count_occup', graduatedBuckets);

     	mapController.mapControl.buildThematicLegend(markerProperty);
     	
		var restriction = new Ab.view.Restriction();
		var selectedRows = mapController.bl_list.getSelectedRows();  
		if (selectedRows.length !== 0) {	
			// create a restriction based on selected rows
			for (var i = 0; i < selectedRows.length; i++) {
				restriction.addClause('bl.bl_id', selectedRows[i]['bl.bl_id'], "=", "OR");
			}
		}
		else{
			restriction.addClause('bl.count_occup', 'null', '=', "OR");
		}

		markerProperty.setRestriction(restriction);
		mapController.mapControl.updateDataSourceMarkerPropertyPair('bl_ds', markerProperty);
		mapController.mapControl.refresh();
  } 
})

