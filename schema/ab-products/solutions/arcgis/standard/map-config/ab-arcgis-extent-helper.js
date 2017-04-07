View.createController('mapController', {
	// Ab.arcgis.ArcGISMap control instance
	// the mapControl is equiv to the mapPanel
	mapControl: null, 
	
	afterViewLoad: function(){
    	var configObject = new Ab.view.ConfigObject();

		// create ab map control
		this.mapControl = new Ab.arcgis.ArcGISMap('mapPanel', 'mapDiv', configObject);
	},
			
	afterInitialDataFetch: function() {
      	// apply esri css to map panel
      	var reportTargetPanel = document.getElementById('mapPanel');
      	reportTargetPanel.className = 'claro';

      	dojo.require("esri.dijit.Geocoder");
	},
	
	onMapLoaded: function(){
        var mapController = View.controllers.get('mapController');

      	// setup basemap layer menu
 	    var basemapLayerMenu = mapController.mapPanel.actions.get('basemapLayerMenu');
		basemapLayerMenu.clear();
		var basemapLayers = mapController.mapControl.getBasemapLayerList();
		for (var i=0; i<basemapLayers.length; i++){
			basemapLayerMenu.addAction(i, basemapLayers[i], this.switchBasemapLayer);
		}		

		// initialize geocoder dijit
		geocoder = new esri.dijit.Geocoder({ 
          map: this.mapControl.map 
        }, 'geocoderDiv');

		// test
		//mapController.mapControl.setMapExtent(-7913180,5213420,-7907691,5216717);
		//mapController.mapControl.setMapCenterAndZoom( -71.06249283, 42.35964857, 15 ); // downtown boston
	},

	switchBasemapLayer: function(item) {
        var mapController = View.controllers.get('mapController');

    	//switch the map layer based on the passed in layer name.
    	mapController.mapControl.switchBasemapLayer(item.text);
    },

    showMapExtent: function(){
        var mapController = View.controllers.get('mapController');

		var mapExtent = mapController.mapControl.map.extent;
		var xmin = mapExtent.xmin.toFixed(2),
			ymin = mapExtent.ymin.toFixed(2),
			xmax = mapExtent.xmax.toFixed(2),
			ymax = mapExtent.ymax.toFixed(2);
		var extentString = '<b>Map Extent</b></br>';
		extentString += '<u>For map configuration:</u><br/>';	
		extentString += '"mapInitExtent" : [' + xmin + ',' + ymin + ',' + xmax + ',' + ymax + '],<br/>';
        extentString += '"mapInitExtentWKID" : 102100<br/>';
		extentString += '<u>For map control API:</u><br/>';
		extentString +=	'setMapExtent( ' + xmin + ', '+ ymin + ', '+ xmax + ', '+ ymax + ' )';
		
		View.alert(extentString);
	},

    showMapCenter: function(){
        var mapController = View.controllers.get('mapController');

		var mapExtent = mapController.mapControl.map.extent;
		var mapCenter =  esri.geometry.webMercatorUtils.webMercatorToGeographic(mapExtent.getCenter());
		var mapLevel = mapController.mapControl.map.getLevel();
		var lon = (mapCenter.x).toFixed(8);
		var lat = (mapCenter.y).toFixed(8);

		var centerString = '<b>Map Center and Zoom</b></br>';
		centerString += '<u>For map control API:</u><br/>';
		centerString += 'setMapCenterAndZoom( ' + lon + ', ' + lat + ', ' + mapLevel + ' )';
		View.alert(centerString);

	}

});

function mapLoadedCallback() {
    var mapController = View.controllers.get('mapController');

    mapController.onMapLoaded();
}

function showMapExtent() {
    var mapController = View.controllers.get('mapController');

	mapController.showMapExtent();
}

function showMapCenter() {
    var mapController = View.controllers.get('mapController');

	mapController.showMapCenter();
}