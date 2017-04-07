var abPropertiesDefineForm_tabLocationController = View.createController('abPropertiesDefineForm_tabLocationController', {
	
	geocodeControl: null,
	
	afterInitialDataFetch: function () {
		var restriction = new Ab.view.Restriction();
		var tabs = this.view.parentTab.parentPanel;
		var newRecord = tabs.parameters.newRecord;
		var tabsRestriction = tabs.parameters.restriction;

		if(newRecord){
			this.abPropertiesDefineForm_location.newRecord = newRecord;
			this.abPropertiesDefineForm_location.show();
		}else{
			if(tabsRestriction){
				if(tabsRestriction["property.pr_id"]) {
					restriction.addClause('property.pr_id', tabsRestriction["property.pr_id"]);
				} else if(tabsRestriction.clauses && tabsRestriction.clauses[0]){
					restriction.addClause('property.pr_id', tabsRestriction.clauses[0].value);
				}
			}
			this.abPropertiesDefineForm_location.refresh(restriction);
		}
	},
	
	abPropertiesDefineForm_location_onSave: function() {
		var propertyForm = this.abPropertiesDefineForm_location;
		beforeSaveProperty(this);
		var isSaved = propertyForm.save();
		setTimeout(function(){
			if (isSaved){
				afterSaveProperty(abPropertiesDefineForm_tabLocationController, propertyForm);
				propertyForm.refresh();
			}
		}, 1000);
		var tabs = View.getOpenerView().panels.get("abPropertiesDefineForm_tabs");
		if(tabs && valueExists(tabs.parameters) && valueExists(tabs.parameters.callback)){
			this.callbackMethod = tabs.parameters.callback;
		}
		callCallbackMethod();
	},
	
	abPropertiesDefineForm_location_beforeRefresh: function() {
		var restriction = new Ab.view.Restriction();
		var tabs = this.view.parentTab.parentPanel;
		
		if(tabs) {
			var newRecord = tabs.parameters.newRecord;
			var tabsRestriction = tabs.parameters.restriction;
			
			if(valueExists(newRecord) && newRecord == true) {
				this.abPropertiesDefineForm_location.newRecord = newRecord;
			}else if(newRecord == false) {
				if(tabsRestriction){
					if(tabsRestriction["property.pr_id"]) {
						restriction.addClause('property.pr_id', tabsRestriction["property.pr_id"]);
					} else if(tabsRestriction.clauses && tabsRestriction.clauses[0]){
						restriction.addClause('property.pr_id', tabsRestriction.clauses[0].value);
					}
				}
				this.abPropertiesDefineForm_location.restriction = restriction;
			}
		}
	},
	
	abPropertiesDefineForm_location_onLocate: function(context){
		var me = this;
		var restriction = this.getCurrentPropertyRestriction();
		var record = this.abPropertiesDefineForm_location.getRecord();
		
		View.openDialog('ab-locate-asset.axvw', restriction, false, {
		    width: 800,
		    height: 600,
		    record: record,
		    assetType: 'property',
		    callback: function(){
		    	refreshPropertyLocationPanel();
		    }
		});
	},
	
	abPropertiesDefineForm_location_onGeocode: function(){
		if (this.geocodeControl === null) {
            this.initGeocodeControl();
        }

        var restriction = this.getCurrentPropertyRestriction();
    	
		this.geocodeControl.geocode('ds_abPropertiesDefineForm', 
			restriction, 'property', 
			'property.pr_id', 
			['property.lat', 'property.lon'], 
			['property.address1', 'property.city_id', 'property.state_id', 'property.zip', 'property.ctry_id'], 
			true);
	},
	
	initGeocodeControl: function() {
        this.geocodeControl = new Ab.arcgis.Geocoder();
        this.geocodeControl.callbackMethod = refreshPropertyLocationPanel;        
    },
    
    getCurrentPropertyRestriction:function(){
		var record = this.abPropertiesDefineForm_location.record;
    	var restriction = new Ab.view.Restriction();
    	
    	if(record) {
 			restriction.addClause('property.pr_id', record.getValue('property.pr_id'), '=', 'OR');  
 		} else {
    		restriction.addClause('property.pr_id', 'null', "=", "OR");
    	}
    	return restriction;
	}
});

function refreshPropertyLocationPanel() {
	var propertyLocationPanel = abPropertiesDefineForm_tabLocationController.abPropertiesDefineForm_location;
	propertyLocationPanel.refresh(propertyLocationPanel.restriction);
}

function callCallbackMethod(){
	var controller = View.controllers.get('abPropertiesDefineForm_tabLocationController');
	if(valueExists(controller.callbackMethod)){
		controller.callbackMethod();
	}
	return true;
}