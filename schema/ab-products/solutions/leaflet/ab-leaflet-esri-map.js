var mapController = View.createController('mapController', {
	
	//the Ab.leaflet.Map
	mapControl: null,
	
	afterViewLoad: function(){
    	var configObject = new Ab.view.ConfigObject();
    	configObject.mapImplementation = 'Esri';
    	configObject.basemap =  View.getLocalizedString('World Topographic Map');
      // World : [ 19.973348786110602, -15.468749999999998 ], 1 || [[-76.6797, -182.8125], [76.6797, 182.8125]]
      // North America : [37.30028, -98.26172], 3 || [[9.4490, -143.9648], [57.7041, -52.5585]]
      // Downtown Boston : [42.35803652353272, -71.06163024902344], 13 ||   
      configObject.mapCenter = [42.35803652353272, -71.06163024902344];
      configObject.mapZoom = 14;

      //create map
    	//
    	//parameters:
    	//@panelId. The panel which holds the div.
     	//@divId. The div which holds the map.
    	//@configObject. The configObject for the panel.
    	//
    	this.mapControl = new Ab.leaflet.Map('mapPanel', 'mapDiv', configObject);
  },
    
  afterInitialDataFetch: function() {
    //console.log('mapController -> afterInitialDataFetch...');
    
  }

});


