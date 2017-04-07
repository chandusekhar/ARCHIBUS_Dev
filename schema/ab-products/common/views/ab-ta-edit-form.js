var abTaEditFormCtrl = View.createController('abTaEditFormCtrl', {

	// crt restriction for detail tabs
	//restriction: null,

	// new record for details tab
	isNew: false,
	
	callbackMethod: null,
	
	customActionCommand: null,
	
	openerRestriction: null,
	
	afterViewLoad: function(){
		
		if(valueExists(this.view.parameters) && valueExists(this.view.parameters.callback)){
			this.callbackMethod = this.view.parameters.callback;
		}
		if(valueExists(View.parameters) && valueExists(View.parameters.eamReceiptParameters)){
			this.customActionCommand = View.parameters.eamReceiptParameters.onClickActionEventHandler;
		}
		
		if(valueExists(this.view.newRecord)){
			if(this.view.restriction){
				if(this.view.restriction.findClause("isNewRecord")){
					this.isNew = true;
					this.abFurnitureForm_tabs.parameters.newRecord = this.isNew;
				}else{
					this.abFurnitureForm_tabs.parameters.newRecord = this.view.newRecord;
				}
			}else{
				this.abFurnitureForm_tabs.parameters.newRecord = this.view.newRecord;
			}
		}
		
		if(valueExists(this.view.restriction)){
			this.abFurnitureForm_tabs.parameters.restriction = this.view.restriction;
			this.openerRestriction = this.view.restriction;
		}
		
		if(this.view.parameters){
			this.abFurnitureForm_tabs.parameters.visibleFields = this.view.parameters.visibleFields;
		}

		this.abFurnitureForm_tabs.addEventListener('beforeTabChange', onBeforeTabChange);
		this.abFurnitureForm_tabs.addEventListener('afterTabChange', onAfterTabChange);
		
	},
	
	afterInitialDataFetch: function(){
		var selectedTab = this.getSelectedTab();
		var eqId = null;
		selectedTab.newRecord = this.isNew;
		selectedTab.restriction = this.openerRestriction;
		
		if(selectedTab.restriction){
			selectedTab.refresh(selectedTab.restriction);
			taId = this.openerRestriction.clauses[0].value; 
			
			if(!this.isNew){
				this.view.setTitle(String.format(getMessage('edit_title'),taId));
			}
		}
		
	},
	
	refreshTabs: function(){
		var restriction = this.abFurnitureForm_tabs.parameters.restriction;
		var newRecord = this.abFurnitureForm_tabs.parameters.newRecord;
		
		if(!valueExists(newRecord)){
			newRecord = this.isNew;
		}
		
		if(!valueExists(restriction)){
			restriction = this.openerRestriction;
		}
		
		this.abFurnitureForm_tabs.selectTab("abFurnitureForm_tabs", restriction, newRecord, false, false);
		this.abFurnitureForm_tabGeneral.refresh(restriction, newRecord);
		this.abFurnitureForm_tabLocation.refresh(restriction, newRecord);
		this.abFurnitureForm_tabCosts.refresh(restriction, newRecord);
	},
	
	getSelectedTab: function(){
		var selectedTabName = this.abFurnitureForm_tabs.getSelectedTabName();
		var selectedTab = this.abFurnitureForm_tabs.findTab(selectedTabName);
		return selectedTab;
	},
	
	/**
	 * get tabs controller
	 */
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
	},
	
	customCommand: function (form) {
		if(valueExists(this.customActionCommand)){
			this.customActionCommand(form);
		}
	}
});

function onBeforeTabChange(tabPanel, currentTabName, newTabName){
	var isRecordChanged = false;
	var controller = View.controllers.get('abTaEditFormCtrl');
	var tab = tabPanel.findTab(currentTabName);
	var tabController = controller.getTabController(tab);
	if (tabController) {
		var formPanel;

		switch(currentTabName){
		case 'abFurnitureForm_tabGeneral':
			formPanel = tabController.abTaEditForm_General;
			break;
		case 'abFurnitureForm_tabLocation':
			formPanel = tabController.abTaEditForm_Location;
			break;
		case 'abFurnitureForm_tabCosts':
			formPanel = tabController.abTaEditForm_Costs;
			break;
		}
		
		if(valueExistsNotEmpty(formPanel)){
			isRecordChanged = hasChanged(formPanel);
		}
		
	}
	
	if(isRecordChanged && valueExistsNotEmpty(formPanel.getRecord().getValue('ta.ta_id'))) {
		var confirmDialog = confirm(getMessage('confirmSaveOnChangeTab'));
		if(confirmDialog){
			var addedRecord = formPanel.getDataSource().saveRecord(formPanel.getRecord());
			
			if (valueExists(addedRecord)) {
					formPanel.newRecord = false;
					afterSaveFurniture(tabController, formPanel);
					formPanel.refresh();
			} else {
				var record = formPanel.getRecord();
				if (record.values['ta.ta_id'] != record.oldValues['ta.ta_id']) {
					afterSaveFurniture(tabController, formPanel);
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
    
    for (var taVal in record.values){
    	// avoid fields like field_gen
        if (taVal.startsWith('ta.')) {
        	 if (taVal.startsWith("ta.cost") || taVal.startsWith("ta.value")) {
        		 if(valueExistsNotEmpty(recordFieldValues[taVal])){
         			var formattedValue = parseFloat(recordFieldValues[taVal]).toFixed(2);
         			recordValues[taVal] = formattedValue;
         		}else{
         			recordValues[taVal] = recordFieldValues[taVal];
         		}
         		if (valueExistsNotEmpty(oldFieldValues[taVal])) {
         			var formattedValue = parseFloat(oldFieldValues[taVal]).toFixed(2);
         			oldValues[taVal] = formattedValue;
         		} else {
         			oldValues[taVal] = oldFieldValues[taVal];
         		}
        	}else if (taVal == "ta.po_id") {
        		if(valueExistsNotEmpty(recordFieldValues[taVal])){
        			var formattedValue = parseInt(recordFieldValues[taVal]);
        			recordValues[taVal] = formattedValue;
        		}else{
        			recordValues[taVal] = recordFieldValues[taVal];
        		}
        		
        		if (valueExistsNotEmpty(oldFieldValues[taVal])) {
        			var formattedValue = parseInt(oldFieldValues[taVal]);
        			oldValues[taVal] = formattedValue;
        		} else {
        			oldValues[taVal] = oldFieldValues[taVal];
        		}
        	}
        	else if (taVal.startsWith("ta.date")) {
        		if(valueExistsNotEmpty(recordFieldValues[taVal])){
        			recordValues[taVal] = recordFieldValues[taVal].getTime();
        		}
        		if(valueExistsNotEmpty(oldFieldValues[taVal])){
        			oldValues[taVal] = oldFieldValues[taVal].getTime();
        		}
        	}else if(taVal == "ta.pr_id"){
        		recordValues[taVal] = oldFieldValues[taVal];
        		oldValues[taVal] = oldFieldValues[taVal];
        	} 
        	
        	else {
        		recordValues[taVal] = recordFieldValues[taVal];
        		oldValues[taVal] = oldFieldValues[taVal];
        	} 
        }else if(taVal.startsWith('fnstd.')){
        	if(taVal == "fnstd.doc_graphic"){
        		if(recordFieldValues[taVal]){
        			recordValues[taVal] = recordFieldValues[taVal].toLowerCase();
        		}
        		if(oldFieldValues[taVal]){
        			oldValues[taVal] = oldFieldValues[taVal].toLowerCase();
        		}
        	}
        }
    }
    
    var isEqual = objectsEqual(recordValues, oldValues);
    return !isEqual;
}

function onAfterTabChange(tabPanel, newTabName){
	var controller = View.controllers.get('abTaEditFormCtrl');
	var newTab = tabPanel.findTab(newTabName);
	var tabController = controller.getTabController(newTab);
	newTab.refresh();
}
