
View.createController('mapController', {

	// the Ab.leaflet.Map control
	mapControl: null,
	
	// Ab.arcgis.Geocoder control
	geocodeControl: null,

	// the asset id 
 	assetId: null,

	afterViewLoad: function(){
    	// create Ab.leaflet.Map
    	var configObject = new Ab.view.ConfigObject();
    	configObject.mapImplementation = 'Esri';
		this.mapControl = new Ab.leaflet.Map('mapPanel', 'mapDiv', configObject);

		//create Ab.leaflet.EsriGeocoder
  		this.geocodeControl = new Ab.leaflet.EsriGeocoder(this.mapControl);
						
	},
			
	afterInitialDataFetch: function() {		

	    // create marker definition
	    var dataSource = 'assetDS';
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

		//disable controls until selection
		this.toggleMapPanelControls(false);

	},	
		
	
	assetPanel_onShowAssets: function(rows) {   
		// get the restriction
    	var restriction = this.getRestriction(rows);
    	// show the assets on the map
    	this.mapControl.showMarkers('assetDS', restriction);
	}, 

	/**
	 * Creates a restriction based on selected rows.
	 */
	getRestriction: function(rows) {
    	var selectedRows = this.assetPanel.getSelectedRows(rows);  
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
	
	assetPanel_onGeocodeAsset: function(row) {

	    // create the restriction
	    var restriction = new Ab.view.Restriction();
	    restriction.addClause('bl.bl_id', row['bl.bl_id'], "=", "OR");
  
	    // dataSourceName, 
	    // restriction, 
	    // tableName, 
	    // pkField, 
	    // geometryFields, 
	    // addressFields, 
	    // replace

  		this.geocodeControl.geocode(
  			'assetDS',
            restriction,
			'bl', 
			'bl.bl_id', 
			['bl.lon','bl.lat'], 
			['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.zip', 'bl.ctry_id'], 
			true
		);
	},
	
	assetPanel_onLocateAsset: function(row) {
	
    	this.toggleMapPanelControls(true);
	
		// save the asset id
		this.assetId = row.record['bl.bl_id'];

		// start locate asset with the current asset location
		this.mapControl.startLocateAsset(row.record['bl.lat'],row.record['bl.lon']);

	},

	mapPanel_onCancelLocateAsset: function() {

		this.toggleMapPanelControls(false);

		this.mapControl.cancelLocateAsset();

	},
	
	mapPanel_onFinishLocateAsset: function() {
		
		this.toggleMapPanelControls(false);

		var location = this.mapControl.finishLocateAsset();

		this.saveAssetRecord(location);
		
	},

	saveAssetRecord: function(location){

		// create the record
		var record = {};
		record['bl.bl_id'] = this.assetId;
		record['bl.lat'] = location[0];
		record['bl.lon'] = location[1];

	    // save record
	    var parameters = {
	      tableName: 'bl',
	      fields: toJSON(record)
	    }

	    var msg;
	    var result = Ab.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-saveRecord', parameters);
	    if (result.code != 'executed') {
	      Ab.workflow.Workflow.handleError(result);
	      msg = 'There was an error with the locate operation.';	      
	    } else {
	      msg = 'The locate operation is finished.';
	    }
	    View.showMessage(msg);
		
		this.assetPanel.refresh();
		
		// // refresh map graphics in case assets are showing
		// var restriction = mapController.getRestriction();
		// this.mapControl.refresh(restriction);	
	},
	
	toggleMapPanelControls: function(value) {
		this.mapPanel.actions.get('cancelLocateAsset').forcedDisabled = false;
		this.mapPanel.actions.get('finishLocateAsset').forcedDisabled = false;
		this.mapPanel.actions.get('cancelLocateAsset').enable(value);
		this.mapPanel.actions.get('finishLocateAsset').enable(value);
	}
});

