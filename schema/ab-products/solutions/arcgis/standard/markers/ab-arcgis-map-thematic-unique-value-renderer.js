View.createController('mapController', {

	// the Ab.arcgis.ArcGISMap control
	mapControl: null,

	afterViewLoad: function(){
        var mapController = View.controllers.get('mapController');

    	var configObject = new Ab.view.ConfigObject();
		var mapConfigObject = new Object();
		
		// build basemap layer list
		var basemapLayerList = new Ext.util.MixedCollection();
		// "http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer"
		// "http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer"
		basemapLayerList.add('Basemap', 'http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer');
		
		// set mapConfig params
		mapConfigObject.basemapLayerList = basemapLayerList;		

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
		//override default symbol colors
		// would prefer to take care of this in the core control -- but this may have to suffice for now.
		//var hexColors = colorbrewer.Paired2[12];
		//var rgbColors = mapController.mapControl.colorbrewer2rgb(colorbrewer.Paired2[12]);
		markerProperty.symbolColors = mapController.mapControl.colorbrewer2rgb(colorbrewer.Paired2[12]);

		// enable thematic markers
     	var thematicBuckets = [];
     	markerProperty.setThematic('bl.use1', thematicBuckets);	
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
			restriction.addClause('bl.use1', 'null', '=', "OR");
		}

		markerProperty.setRestriction(restriction);
		mapController.mapControl.updateDataSourceMarkerPropertyPair('bl_ds', markerProperty);
		mapController.mapControl.refresh();

  } 
})

