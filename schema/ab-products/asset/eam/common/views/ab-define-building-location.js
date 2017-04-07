var abDefineBuilding_tabLocationController = View.createController('abDefineBuilding_tabLocationController', {
	
	geocodeControl: null,
	
	callbackMethod: null,
	
	restriction: null,
	
	newRecord: null,
	
	afterInitialDataFetch: function () {
		var tabs = View.getOpenerView().panels.get("abDefineBuilding_tabs");
		if (tabs && valueExists(tabs.parameters)) {
			if (valueExists(tabs.parameters.callback)) {
				this.callbackMethod = tabs.parameters.callback;
			}
		}
		
		this.refreshRestriction();
	},
	
	refreshRestriction: function() {
		var tabs = View.getOpenerView().panels.get("abDefineBuilding_tabs");
		
		if (tabs && valueExists(tabs.restriction)) {
			this.restriction = tabs.restriction;
		}
		if (tabs && valueExists(tabs.newRecord)) {
			this.newRecord = tabs.newRecord;
		}
		
		if (this.newRecord) {
			this.abDefineBuilding_location.refresh(null, this.newRecord);
		} else {
			this.abDefineBuilding_location.refresh(this.restriction);
		}
	},
	
	abDefineBuilding_location_onLocate: function(context){
		var me = this;
		var restriction = this.restriction;
		var record = this.abDefineBuilding_location.getRecord();
		
		View.openDialog('ab-locate-asset.axvw', restriction, false, {
		    width: 800,
		    height: 600,
		    record: record,
		    assetType: 'bl',
		    callback: function(){
		    	refreshBuildingLocationPanel();
		    }
		});
	},
	
	abDefineBuilding_location_onGeocode: function(){
		if (this.geocodeControl === null) {
            this.initGeocodeControl();
        }

        var restriction = this.restriction;
    	
		this.geocodeControl.geocode('ds_abDefineBuildingLocation', 
			restriction, 'bl', 
			'bl.bl_id', 
			['bl.lat', 'bl.lon'], 
			['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.zip', 'bl.ctry_id'], 
			true);
	},
	
	initGeocodeControl: function() {
        this.geocodeControl = new Ab.arcgis.Geocoder();
        this.geocodeControl.callbackMethod = refreshBuildingLocationPanel;        
    },
    
    afterSaveBuilding: function() {
		setNewRestrictionForTabs();
		abDefineBuilding_tabLocationController.refreshRestriction();
		refreshTitle();
		callCallbackMethod();
	}
});

function refreshBuildingLocationPanel() {
	var buildingLocationPanel = abDefineBuilding_tabLocationController.abDefineBuilding_location;
	buildingLocationPanel.refresh(buildingLocationPanel.restriction);
}

function callCallbackMethod(){
	var controller = View.controllers.get('abDefineBuilding_tabLocationController');
	if(valueExists(controller.callbackMethod)){
		controller.callbackMethod();
	}
	return true;
}

function setNewRestrictionForTabs() {
	var form = abDefineBuilding_tabLocationController.abDefineBuilding_location;
	setRestrictionForTabs(abDefineBuilding_tabLocationController, form);
}