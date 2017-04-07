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
		mapConfigObject.mapInitExtent = [-14676000, 1718000, -6849000, 7589000];
		mapConfigObject.mapInitExtentWKID = 102100;

    	//mapController.mapControl = new Ab.arcgis.ArcGISMap('mapPanel', 'map', configObject, mapConfigObject);
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
		// dont override default symbol colors
		/*markerProperty.symbolColors = [ 
	    	[254,229,217],
	    	[252,174,145],
	    	[251,106,74],
	    	[203,24,79]
	    ];*/

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

