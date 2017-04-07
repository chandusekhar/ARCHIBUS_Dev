var mapController = View.createController('mapController', {
	
	 //the Ab.leaflet.Map
  mapControl: null,
  
  afterViewLoad: function(){
      var configObject = new Ab.view.ConfigObject();
      this.mapControl = new Ab.leaflet.Map('mapPanel', 'mapDiv', configObject);
  },
	    	  
  afterInitialDataFetch: function() {
 
      // create building markers
      var blDataSource = 'bl_ds';
      var blKeyFields = ['bl.bl_id'];
      var blGeometryFields = ['bl.lon', 'bl.lat'];
      var blTitleField = 'bl.name';
      var blContentFields = ['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id'];
      
      var blMarkerProperties = {
          radius: 8,
          markerActionTitle: 'Show Details',
          markerActionCallback: mapController.showBuildingDetails 
      }; 

      this.mapControl.createMarkers(
          blDataSource, 
          blKeyFields,
          blGeometryFields,
          blTitleField,
          blContentFields,
          blMarkerProperties
      );
  },

  	
	mapPanel_onShowMarkers: function() {
		var restriction = new Ab.view.Restriction();
  	restriction.addClause('bl.state_id', 'PA', "=", "OR");
	
    //show the markers on the map
    this.mapControl.showMarkers('bl_ds', restriction);
	},
  

  mapPanel_onClearMarkers: function() {
    //clear all markers and all saved datasource-Ab.arcgis.ArcGISMarkerPropert pairs
    this.mapControl.clearMarkers();
  },

    /*
   *  The graphic mouse click event handler.  The parameters are the information from the tooltip.
   *  They are set up when create the Ab.arcgis.ArcGISMarkerProperty
   *  @param {title} The value of the tooltip's title.  e.g. the vaue of the 'bl.bl_id'
   *  @param {attributes} The key-value pairs of the tooltip's attributes
   *          ['bl.addres1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id']
   */
  showBuildingDetails: function(key,attributes) {
  
    var bl_id = key;
      
    //openDialog: function(url, restriction, newRecord, x, y, width, height) {
    var restriction = {
          'bl.bl_id': bl_id
      };
    
      var allowCreateRecord = false;
      var defaultDialogX = 20;
      var defaultDialogY = 40;
      var defaultDialogWidth = 800;
      var defaultDialogHeight = 600; 
      AFM.view.View.openDialog('ab-arcgis-bl-details-dialog.axvw', restriction, false, 20, 40, 800, 600);     
  }

});



