var mapController = View.createController('showMap', {

	//the L.map
	//map: null,
	mapControl: null,

	// L.LayerGroup for geocode results
	resultsLayer: null,

	// the L.esri.Geocoding control
	geocoder: null,

	afterViewLoad: function(){

		//this.map = new L.map('mapDiv').setView([40.91, -96.63], 4);
		var configObject = new Ab.view.ConfigObject();
    	configObject.mapImplementation = 'Esri';
    	configObject.basemap = View.getLocalizedString('World Street Map');

    	//create map
    	this.mapControl = new Ab.leaflet.Map('mapPanel', 'mapDiv', configObject);

    	this.createMenuActions();
    },
			
	afterInitialDataFetch: function() {

		this.resultsLayer = new L.LayerGroup().addTo(this.mapControl.mapClass.map);

		this.geocoder = new L.esri.Geocoding.Controls.Geosearch().addTo(this.mapControl.mapClass.map);

		var _mapControl = this;
		this.geocoder.on('results', function(data){
			_mapControl.showGeocodeResults(data);
  		});
	},
	
  	createMenuActions: function(){
		// basemap layer menu
		var basemapLayerMenu = mapController.mapPanel.actions.get('basemapLayerMenu');
		basemapLayerMenu.clear();
		var basemapLayers = mapController.mapControl.getBasemapLayerList();
		for (var i=0; i<basemapLayers.length; i++){
		basemapLayerMenu.addAction(i, basemapLayers[i], this.switchBasemapLayer);
		}

		// map extent command 
		var showMapExtent = Ext.get('showMapExtent'); 
		showMapExtent.on('click', this.showMapExtent, this, null);        
  	},

  	switchBasemapLayer: function(item) {
    	//switch the map layer based on the passed in layer name.
    	mapController.mapControl.switchBasemapLayer(item.text);
    },  

    showGeocodeResults: function(data) {
	    this.resultsLayer.clearLayers();

	    for (var i = data.results.length - 1; i >= 0; i--) {
	      this.resultsLayer.addLayer(L.marker(data.results[i].latlng));
	    }		
    },

    showMapExtent: function(){

    	var mapCenter = this.mapControl.mapClass.map.getCenter();
    	var mapZoom = this.mapControl.mapClass.map.getZoom();

    	// format for configObject.mapCenter and configObject.mapZoom
		// configObject.mapCenter = [42.35803652353272, -71.06163024902344];
		// configObject.mapZoom = 14;

		var extentString = '<b>Map Extent</b></br>';
		extentString += '<u>For map configuration:</u><br/>';	
		extentString += 'configObject.mapCenter = [' + mapCenter.lat + ', ' + mapCenter.lng + '],<br/>';
    	extentString += 'configObject.mapZoom = '+ mapZoom + '<br/>';
		extentString += '<u>For map control API:</u><br/>';
		extentString +=	'setView( [' + mapCenter.lat + ', '+ mapCenter.lng + '], ' +  mapZoom + ' )';

		View.alert(extentString);
	
 	}
 });