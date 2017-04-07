var mapConfigObject = {
  "mapInitExtent" : [-8371868, 4858206, -8360699, 4864369],
  "mapInitExtentWKID" : 102100
};

var mapController = View.createController('mapController', {
	
	//the Ab.arcgis.ArcGISMap
	mapControl: null,
	
	afterViewLoad: function(){
    	var configObject = new Ab.view.ConfigObject();
    	
    	//create mapControl
    	this.mapControl = new Ab.arcgis.ArcGISMap('mapPanel', 'mapDiv', configObject);
    	
      // create building marker definition
    	var blMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty('bl_ds', ['bl.lat', 'bl.lon'],'bl.bl_id',['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id']);
    	blMarkerProperty.showLabels = false;
      this.mapControl.updateDataSourceMarkerPropertyPair('bl_ds', blMarkerProperty);
    	
    	//add the call back function to the graphic mouse click event 
    	//this.mapControl.addMouseClickEventHandler(this.showBuildingDetails);
      this.mapControl.addMarkerAction('Show Details', this.showBuildingDetails);
    },


    afterInitialDataFetch: function() {

    },
    
    mapPanel_onClearMap: function() {
    
    	//clear all markers and all saved datasource-Ab.arcgis.ArcGISMarkerPropert pairs
  		this.mapControl.clear();
  	},
  	
  	/*
     *  The graphic mouse click event handler.  The parameters are the information from the tooltip.
     *	They are set up when create the Ab.arcgis.ArcGISMarkerProperty
     *  @param {title} The value of the tooltip's title.  e.g. the vaue of the 'bl.bl_id'
     *  @param {attributes} The key-value pairs of the tooltip's attributes
     *    			['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id']
     */
  	showBuildingDetails: function(title,attributes) {
  	
    	var bl_id = title;
    		
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
  	},
  	
  	mapPanel_onShowMap: function() {

  		var blMarkerProperty = this.mapControl.getMarkerPropertyByDataSource('bl_ds');
  		
  		if( blMarkerProperty == null ){
  			blMarkerProperty = new Ab.arcgis.ArcGISMarkerProperty('bl_ds', ['bl.lat', 'bl.lon'],'bl.bl_id',['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.ctry_id']);
    		blMarkerProperty.showLabels = false;
        this.mapControl.updateDataSourceMarkerPropertyPair('bl_ds', blMarkerProperty);
    	}
  	   
  		var restriction = new Ab.view.Restriction();
    	restriction.addClause('bl.state_id', 'PA', "=", "OR");
  	
  		//refresh mapControl
  		this.mapControl.refresh(restriction);
  	},
    
    afterInitialDataFetch: function() {
    	//apply esri css to panel
      var reportTargetPanel = document.getElementById("mapPanel");            
      reportTargetPanel.className = 'claro';
  	}
});



