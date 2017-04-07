var mapController = View.createController('mapController', {
	
	//the Ab.leaflet.Map
	mapControl: null,

  //the L.esri.Geocoding control
  geocodeControl: null,
	
	afterViewLoad: function(){
    	var configObject = new Ab.view.ConfigObject();
    	configObject.mapImplementation = 'Esri';
    	configObject.basemap = View.getLocalizedString('World Street Map');
      // World : [ 19.973348786110602, -15.468749999999998 ], 1 || [[-76.6797, -182.8125], [76.6797, 182.8125]]
      // North America : [37.30028, -98.26172], 3 || [[9.4490, -143.9648], [57.7041, -52.5585]]
      // Downtown Boston : [42.35803652353272, -71.06163024902344], 13 ||   
      //configObject.mapCenter = [42.35803652353272, -71.06163024902344];
      //configObject.mapZoom = 14;

      //create map
    	//
    	//parameters:
    	//@panelId. The panel which holds the div.
     	//@divId. The div which holds the map.
    	//@configObject. The configObject for the panel.
    	//
    	this.mapControl = new Ab.leaflet.Map('mapPanel', 'mapDiv', configObject);

      //create geocoder
      //this.geocodeControl = new L.esri.Geocoding.Services.Geocoding();
      this.geocodeControl = new Ab.leaflet.EsriGeocoder(this.mapControl);
  },
    
  afterInitialDataFetch: function() {

    // create marker definition
    var dataSource = 'blDS';
    var keyFields = ['bl.bl_id'];
    var geometryFields = ['bl.lon', 'bl.lat'];
    var titleField = 'bl.name';
    var contentFields = ['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id'];
    var markerProperties = {
        radius: 8
    }; 

    this.mapControl.createMarkers(
        dataSource,
        keyFields, 
        geometryFields,
        titleField,
        contentFields,
        markerProperties);
  },
  
  blPanel_onShowBuildings: function(rows) {   
    // get the restriction    
    var restriction = this.getRestriction(rows);

    // show the markers on the map
    this.mapControl.showMarkers('blDS', restriction);
  }, 

  getRestriction: function(rows) {
    var selectedRows = this.blPanel.getSelectedRows(rows);  
    var restriction = new Ab.view.Restriction();
    if(selectedRows.length !== 0 ) {
    for (var i = 0; i < selectedRows.length; i++) {
      restriction.addClause('bl.bl_id', selectedRows[i]['bl.bl_id'], "=", "OR");
    }
    }
    else{
      restriction.addClause('bl.bl_id', 'null', "=", "OR");
    }
    
    return restriction;
  },

  geocodeBuilding: function(row) {

    // create the restriction
    var restriction = new Ab.view.Restriction();
    restriction.addClause('bl.bl_id', row['bl.bl_id'], "=", "OR");

    // dataSource, 
    // restriction, 
    // tableName, 
    // pkField, 
    // geometryFields, 
    // addressFields, 
    // replace

    mapController.geocodeControl.geocode(
      'blDS',
      restriction,
      'bl',
      'bl.bl_id',
      ['bl.lon','bl.lat'],
      ['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.zip', 'bl.ctry_id'], 
      true
    );
        
  }

});


