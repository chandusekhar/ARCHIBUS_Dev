var abDefineBuildingController = View.createController('abDefineBuildingController', {
	callbackMethod: null,
	
	customActionCommand: null,
	
	afterViewLoad: function() {
		if (valueExists(View.getOpenerView()) && valueExists(View.getOpenerView().parameters)) {
			this.abDefineBuilding_tabs.parameters = View.getOpenerView().parameters;
		}
		
		if (valueExists(View.getOpenerView()) && valueExists(View.getOpenerView().newRecord)) {
			this.abDefineBuilding_tabs.newRecord = View.getOpenerView().newRecord;
		}
		
		if (valueExists(View.getOpenerView()) && valueExists(View.getOpenerView().restriction)) {
			this.abDefineBuilding_tabs.restriction = View.getOpenerView().restriction;
		}

		this.abDefineBuilding_tabs.addEventListener('beforeTabChange', onBeforeTabChange);
	},
	
	afterInitialDataFetch: function() {
		if (this.abDefineBuilding_tabs.newRecord) {
			this.view.setTitle(getMessage('add_title'));
		} else {
			var restriction = View.getOpenerView().restriction;
			if (restriction && restriction.clauses.length > 0) {
				var blId = restriction.clauses[0].value;
				this.view.setTitle(String.format(getMessage('edit_title'), blId));
			} 
		}
	},
	
	getTabController: function(tab){
		var controllerName = tab.name + "Controller";
		var controller = null;
		if (tab.useFrame) {
			if(tab.getContentFrame().View){
				controller = tab.getContentFrame().View.controllers.get(controllerName);
			}
		}else{
			controller = View.controllers.get(controllerName);
		}
		return controller;
	}
});
		
function onBeforeTabChange(tabPanel, currentTabName, newTabName){
	var controller = View.controllers.get('abDefineBuildingController');
	var newTab = tabPanel.findTab(newTabName);
	var newTabController = controller.getTabController(newTab);
	
	if (newTabController) {
		if (typeof(newTabController.refreshRestriction) == 'function') {
			newTabController.refreshRestriction();
		}
	}
	
	var isRecordChanged = false;
	var formPanel;

	var tab = tabPanel.findTab(currentTabName);
	var tabController = controller.getTabController(tab);

	switch(currentTabName) {
		case 'abDefineBuilding_tabGeneral':
			formPanel = tabController.abDefineBuilding_general;
			break;
		case 'abDefineBuilding_tabLocation':
			formPanel = tabController.abDefineBuilding_location;
			break;
		case 'abDefineBuilding_tabOwner':
			return true;
		case 'abDefineBuilding_tabCosts':
			formPanel = tabController.abDefineBuilding_costs;
			break;
		case 'abDefineBuilding_tabDocuments':
			formPanel = tabController.abDefineBuilding_documents;
			break;	
		case 'abDefineBuilding_tabContacts':
			formPanel = tabController.abDefineBuilding_contacts;
			break;	
		}
		
		if(valueExistsNotEmpty(formPanel)){
			isRecordChanged = hasChanged(formPanel);
		}
		
	if(isRecordChanged && valueExistsNotEmpty(formPanel.getRecord().getValue('bl.bl_id'))) {
		var confirmDialog = confirm(getMessage('confirmSaveOnChangeTab'));
		if(confirmDialog){
			var addedRecord = formPanel.getDataSource().saveRecord(formPanel.getRecord());
			
			if (valueExists(addedRecord)){
				// a new building was added
				if(typeof(tabController.afterSaveBuilding) == 'function'){
					formPanel.newRecord = false;
					tabController.afterSaveBuilding();
				}
			} else {
				// existing record but primary key value changed
				var record = formPanel.getRecord();
				if(record.values['bl.bl_id'] != record.oldValues['bl.bl_id'] && typeof(tabController.afterSaveBuilding) == 'function'){
					tabController.afterSaveBuilding();
				}
			}
			
			return true;
		}else {
			return true;
		}
	} else {
		return true;
	}
}

function hasChanged (formPanel){
    var record = formPanel.getRecord();
    var recordValues= {};
    var oldValues = {};
    
    var recordFieldValues = record.values;
    var oldFieldValues  = record.oldValues;
    
    // KB# 3052817 Valentina Sandu - IE 9 doesn't support startsWith function
    // added function body in case is not found
    if (!String.prototype.startsWith) {
  	  String.prototype.startsWith = function (str){
  	    return this.lastIndexOf(str, 0) === 0;
  	  };
    }
    
    for (var p in record.values){
    	// avoid fields like field_gen
        if (p.startsWith('bl.')) {
        	
        	if (p == "bl.image_file" || p == "bl.bldg_photo") {
        		if(recordFieldValues[p]){
        			recordValues[p] = recordFieldValues[p].toLowerCase();
        		}
        		if(oldFieldValues[p]){
        			oldValues[p] = oldFieldValues[p].toLowerCase();
        		}
        	} else if (p.startsWith("bl.date")) {
        		if(valueExistsNotEmpty(recordFieldValues[p])){
        			recordValues[p] = recordFieldValues[p].getTime();
        		}
        		if(valueExistsNotEmpty(oldFieldValues[p])){
        			oldValues[p] = oldFieldValues[p].getTime();
        		}
        	} else {
        		recordValues[p] = recordFieldValues[p];
        		oldValues[p] = oldFieldValues[p];
        	}
        }
    }
    
    var isEqual = objectsEqual(recordValues, oldValues);
    return !isEqual;
}