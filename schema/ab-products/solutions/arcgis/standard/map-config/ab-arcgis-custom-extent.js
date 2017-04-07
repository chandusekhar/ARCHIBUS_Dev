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
	},
	
	onMapLoaded: function(){

	},

	switchBasemapLayer: function(item) {
        var mapController = View.controllers.get('mapController');

    	//switch the map layer based on the passed in layer name.
    	mapController.mapControl.switchBasemapLayer(item.text);
    }

});

function mapLoadedCallback() {
    var mapController = View.controllers.get('mapController');

    mapController.onMapLoaded();
}
