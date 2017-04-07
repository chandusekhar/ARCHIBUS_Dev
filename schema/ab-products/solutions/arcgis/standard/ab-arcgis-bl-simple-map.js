View.createController('mapController', {
	
	//the Ab.arcgis.ArcGISMap
	mapControl: null,
	
	afterViewLoad: function(){
    	var configObject = new Ab.view.ConfigObject();
    	
    	//create map
    	//
    	//parameters:
    	//panelId. The panel which holds the div.
     	//divId. The div which holds the map.
    	//configObject. The configObject for the panel.
    	//
    	this.mapControl = new Ab.arcgis.ArcGISMap('mapPanel', 'mapDiv', configObject);
  },
    
  afterInitialDataFetch: function() {
      //apply css to map panel
      var reportTargetPanel = document.getElementById("mapPanel");
		  reportTargetPanel.className = 'claro';
      // show the markers
      this.showBlMarkers.defer(500, this);
  	},

    showBlMarkers: function(){

      //prepare blMarkerProperty
      //Ab.arcgis.ArcGISMarkerProperty defines common properties for a group of markers 
      //for each datasource, need to create a corresponding Ab.arcgis.ArcGISMarkerProperty
      //
      //parameters: 
      //dataSourceNameParam. The dataSource associated with these markers
      //geometryFieldsParam. The geometryFields which define the geometry of markers. lat, lon.
      //infoWindowTitleFieldParam. The data field which defines infoWindow Title.
      //infoWindowAttributeParam.  The data Fields which define attributes for infoWindow 
      //
      //infoWindow will be shown as tooltip for mouseOver event
      var blMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty('bl_ds', 
        ['bl.lat', 'bl.lon'],
        'bl.bl_id',
        ['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id']
      );
      blMarkerProperty.showLabels = false;

      //add datasource-Ab.arcgis.ArcGISMarkerPropert pair to map
      //in order to draw markers for certain datasource
      //the corresponding datasource-Ab.arcgis.ArcGISMarkerPropert pair has to be added to the map.
      this.mapControl.updateDataSourceMarkerPropertyPair('bl_ds', blMarkerProperty);
      
      var restriction = new Ab.view.Restriction();
      restriction.addClause('bl.state_id', 'PA', "=", "OR");
      
      //refresh and draw the map
      //the restriction passed through the refresh() will only be applied to the first pair added through
      //map.updateDataSourceMarkerPropertyPair
      this.mapControl.refresh(restriction);
    }

});


