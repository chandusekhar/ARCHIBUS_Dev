
var mapController = View.createController('mapController', {
	
	mapControl: null,
	
	
	afterViewLoad: function(){
    	var configObject = new Ab.view.ConfigObject();
    	configObject.mapImplementation = 'Esri';

    	//create map
    	this.mapControl = new Ab.leaflet.Map('mapPanel', 'mapDiv', configObject);
    		  	    	
      // basemap layer menu
      var basemapLayerMenu = mapController.mapPanel.actions.get('basemapLayerMenu');
        basemapLayerMenu.clear();
        var basemapLayers = mapController.mapControl.getBasemapLayerList();
        for (var i=0; i<basemapLayers.length; i++){
        basemapLayerMenu.addAction(i, basemapLayers[i], this.switchBasemapLayer);
      } 
    },
    
    afterInitialDataFetch: function() {
    
  	},
	
    switchBasemapLayer: function(item) {
    	//switch the map layer based on the passed in layer name.
    	mapController.mapControl.switchBasemapLayer(item.text);
    }   
    
});

