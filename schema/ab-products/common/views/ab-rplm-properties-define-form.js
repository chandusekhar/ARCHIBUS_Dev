var abPropertiesDefineFormController = View.createController('abPropertiesDefineFormController', {
	callbackMethod: null,
	
	customActionCommand: null,
	
	afterViewLoad: function(){
		if(valueExists(this.view.parameters) && valueExists(this.view.parameters.callback)){
			this.callbackMethod = this.view.parameters.callback;
		}
		if(valueExists(View.parameters) && valueExists(View.parameters.eamReceiptParameters)){
			this.customActionCommand = View.parameters.eamReceiptParameters.onClickActionEventHandler;
		}
		
		// opened from EAM console
		if(valueExists(this.view.newRecord)){
			this.abPropertiesDefineForm_tabs.parameters.newRecord = this.view.newRecord;
		}
		if(valueExists(this.view.restriction)){
			this.abPropertiesDefineForm_tabs.parameters.restriction = this.view.restriction;
		}
		if(this.view.parameters){
			this.abPropertiesDefineForm_tabs.parameters.visibleFields = this.view.parameters.visibleFields;
		}

		this.abPropertiesDefineForm_tabs.addEventListener('beforeTabChange', onBeforeTabChange);
		this.abPropertiesDefineForm_tabs.addEventListener('afterTabChange', onAfterTabChange);
	},
	
	afterInitialDataFetch: function(){
		var restriction = this.view.restriction;
		if(restriction && restriction.clauses.length > 0){
			var pr_id = restriction.clauses[0].value;
			this.view.setTitle(String.format(getMessage('edit_title'),pr_id));
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
	//verify changes were made
	var isRecordChanged = false;
	var controller = View.controllers.get('abPropertiesDefineFormController');
	var tab = tabPanel.findTab(currentTabName);
	var tabController = controller.getTabController(tab);
	if (tabController) {
		var formPanel;

		switch(currentTabName){
		case 'abPropertiesDefineForm_tabGeneral':
			formPanel = tabController.abPropertiesDefineForm_general;
			break;
		case 'abPropertiesDefineForm_tabLocation':
			formPanel = tabController.abPropertiesDefineForm_location;
			break;
		case 'abPropertiesDefineForm_tabOwner':
			return true;
		case 'abPropertiesDefineForm_tabCosts':
			formPanel = tabController.abPropertiesDefineForm_costs;
			break;
		case 'abPropertiesDefineForm_tabDocuments':
			formPanel = tabController.abPropertiesDefineForm_documents;
			break;	
		case 'abPropertiesDefineForm_tabContacts':
			formPanel = tabController.abPropertiesDefineForm_contacts;
			break;	
		}
		
		if(valueExistsNotEmpty(formPanel)){
			isRecordChanged = hasChanged(formPanel);
		}
		
	}
	
	if(isRecordChanged && valueExistsNotEmpty(formPanel.getRecord().getValue('property.pr_id'))) {
		var confirmDialog = confirm(getMessage('confirmSaveOnChangeTab'));
		if(confirmDialog){
			var addedRecord = formPanel.getDataSource().saveRecord(formPanel.getRecord());
			
			if (valueExists(addedRecord)) {
				// a new building was added
					formPanel.newRecord = false;
					afterSaveProperty(tabController, formPanel);
					formPanel.refresh();
			} else {
				// existing record but primary key value changed
				var record = formPanel.getRecord();
				if (record.values['property.pr_id'] != record.oldValues['property.pr_id']) {
					afterSaveProperty(tabController, formPanel);
					formPanel.refresh();
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

/**
 * check the formPanel.getRecord
 * values and oldValues
 * @param {Object} formPanel
 * return true means the user has changed the data
 */
function hasChanged (formPanel){
    var record = formPanel.getRecord();
    var recordValues= {};
    var oldValues = {};
    
    var recordFieldValues = record.values;
    var oldFieldValues  = record.oldValues;
    
    if (!String.prototype.startsWith) {
  	  String.prototype.startsWith = function (str){
  	    return this.lastIndexOf(str, 0) === 0;
  	  };
    }
    
    for (var p in record.values){
    	// avoid fields like field_gen
        if (p.startsWith('property.')) {
        	
        	if(p == "property.image_map" || p == "property.image_file" || p == "property.prop_photo"){
        		if(recordFieldValues[p]){
        			recordValues[p] = recordFieldValues[p].toLowerCase();
        		}
        		if(oldFieldValues[p]){
        			oldValues[p] = oldFieldValues[p].toLowerCase();
        		}
        	} else if (p.startsWith("property.date")) {
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

function onAfterTabChange(tabPanel, newTabName){
	var controller = View.controllers.get('abPropertiesDefineFormController');
	var newTab = tabPanel.findTab(newTabName);
	var tabController = controller.getTabController(newTab);
	
	if(newTabName == 'abPropertiesDefineForm_tabOwner'){
		// hide the edit owner form
		if(tabController){
			tabController.abPropertiesDefineForm_ownerDetail.show(false);
		}
	}	    	
}
