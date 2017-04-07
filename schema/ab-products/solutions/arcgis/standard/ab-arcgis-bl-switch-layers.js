View.createController('mapController', {

	// the Ab.arcgis.ArcGISMap control
	mapControl: null,
	
	layerMenu: null,
	
	afterViewLoad: function(){
        var mapController = View.controllers.get('mapController');
        var configObject = new Ab.view.ConfigObject();
    	
    	//create map
    	this.mapControl = new Ab.arcgis.ArcGISMap('mapPanel', 'mapDiv', configObject);
    		  	
    	var blMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty('bl_ds', ['bl.lat', 'bl.lon'],'bl.bl_id',['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id']);
    	blMarkerProperty.showLabels = false;
		this.mapControl.updateDataSourceMarkerPropertyPair('bl_ds', blMarkerProperty);
    	
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause('bl.state_id', 'PA', "=", "OR");
    	
    	//refresh and draw the map
    	//the restriction passed through the refresh() will only be applied to the first pair added through map.updateDataSourceMarkerPropertyPair
    	this.mapControl.refresh(restriction);
    	
    	// basemap layer menu
 	    var basemapLayerMenu = mapController.mapPanel.actions.get('basemapLayerMenu');
		basemapLayerMenu.clear();
		var basemapLayers = mapController.mapControl.getBasemapLayerList();
		for (var i=0; i<basemapLayers.length; i++){
			basemapLayerMenu.addAction(i, basemapLayers[i], this.switchBasemapLayer);
		}

    	// reference layer menu
	    var referenceLayerMenu = mapController.mapPanel.actions.get('referenceLayerMenu');
		referenceLayerMenu.clear();
		var referenceLayers = mapController.mapControl.getReferenceLayerList();
		for (var i=0; i<referenceLayers.length; i++){
			referenceLayerMenu.addAction(i, referenceLayers[i], this.switchReferenceLayer);
		}

    	// legend menu
    	var legendObj = Ext.get('showLegend'); 
	    legendObj.on('click', this.showLegend, this, null);    
    },
    
    afterInitialDataFetch: function() {
    
    	//apply <css url="http://serverapi.arcgisonline.com/jsapi/arcgis/1.4/js/dojo/dijit/themes/tundra/tundra.css" />
    	//to panel
      	var reportTargetPanel = document.getElementById("mapPanel");            
      	reportTargetPanel.className = 'claro';
  	},
	
    switchBasemapLayer: function(item) {
        var mapController = View.controllers.get('mapController');
    	
        //switch the map layer based on the passed in layer name.
    	mapController.mapControl.switchBasemapLayer(item.text);
    },    
    
	showLegend: function(){
        var mapController = View.controllers.get('mapController');

		mapController.mapControl.showEsriLegend();
	},
	
    switchReferenceLayer: function(item) {
        var mapController = View.controllers.get('mapController');

    	//switch the map layer based on the passed in layer name.
    	mapController.mapControl.switchReferenceLayer(item.text);
    }
});

