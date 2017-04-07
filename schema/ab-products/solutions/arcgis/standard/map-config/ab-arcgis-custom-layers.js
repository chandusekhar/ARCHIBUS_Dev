var mapController = View.createController('showMap', {
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

      	// setup basemap layer menu
 	    var basemapLayerMenu = mapController.mapPanel.actions.get('basemapLayerMenu');
		basemapLayerMenu.clear();
		var basemapLayers = mapController.mapControl.getBasemapLayerList();
		for (var i=0; i<basemapLayers.length; i++){
			basemapLayerMenu.addAction(i, basemapLayers[i], this.switchBasemapLayer);
		}		

    	// setup reference layer menu
	    var referenceLayerMenu = mapController.mapPanel.actions.get('referenceLayerMenu');
		referenceLayerMenu.clear();
		var referenceLayers = mapController.mapControl.getReferenceLayerList();
		for (var i=0; i<referenceLayers.length; i++){
			referenceLayerMenu.addAction(i, referenceLayers[i], this.switchReferenceLayer);
		}

	},

	switchBasemapLayer: function(item) {
    	//switch the map layer based on the passed in layer name.
    	mapController.mapControl.switchBasemapLayer(item.text);
    },

    switchReferenceLayer: function(item) {
    	//switch the map layer based on the passed in layer name.
    	mapController.mapControl.switchReferenceLayer(item.text);
    },

    showLegend: function(){
		mapController.mapControl.showEsriLegend();
	},

});

function mapLoadedCallback() {
    //console.log('mapLoadedCallback...');
    mapController.onMapLoaded();
}

function showLegend() {
	mapController.showLegend();
}