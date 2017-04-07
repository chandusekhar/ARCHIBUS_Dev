var abEqEditFormCtrl = View.createController('abEqEditFormCtrl', {

	// crt restriction for detail tabs
	//restriction: null,

	// new record for details tab
	isNew: false,
	
	callbackMethod: null,
	
	customActionCommand: null,
	
	openerRestriction:null,
	
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
					this.abEquipmentForm_tabs.parameters.newRecord = this.isNew;
				}else{
					this.abEquipmentForm_tabs.parameters.newRecord = this.view.newRecord;
				}
			}else{
				this.abEquipmentForm_tabs.parameters.newRecord = this.view.newRecord;
			}
		}
		
		if(valueExists(this.view.restriction)){
			this.abEquipmentForm_tabs.parameters.restriction = this.view.restriction;
			this.openerRestriction = this.view.restriction;
		}
		
		if(this.view.parameters){
			this.abEquipmentForm_tabs.parameters.visibleFields = this.view.parameters.visibleFields;
		}
		
		this.abEquipmentForm_tabs.addEventListener('beforeTabChange', onBeforeTabChange);
		this.abEquipmentForm_tabs.addEventListener('afterTabChange', onAfterTabChange);

	},
	
	initForm: function(restriction, isNew){
		this.openerRestriction = restriction;
		this.abEquipmentForm_tabs.parameters.restriction = this.openerRestriction;
		this.isNew = isNew;
		this.abEquipmentForm_tabs.parameters.newRecord = this.isNew;
	},
	
	afterInitialDataFetch: function(){
		var selectedTab = this.getSelectedTab();
		var eqId = null;
		selectedTab.newRecord = this.isNew;
		selectedTab.restriction = this.openerRestriction;
		
		if(selectedTab.restriction){
			selectedTab.refresh(selectedTab.restriction);
			eqId = this.openerRestriction.clauses[0].value; 
			
			if(!this.isNew){
				this.view.setTitle(String.format(getMessage('edit_title'),eqId));
				
			}
		}
	},
	
	getSelectedTab: function(){
		var selectedTabName = this.abEquipmentForm_tabs.getSelectedTabName();
		var selectedTab = this.abEquipmentForm_tabs.findTab(selectedTabName);
		return selectedTab;
	},
	
	refreshTabs: function(){
		var restriction = this.abEquipmentForm_tabs.parameters.restriction;
		var newRecord = this.abEquipmentForm_tabs.parameters.newRecord;
		
		if(!valueExists(newRecord)){
			newRecord = this.isNew;
		}
		
		if(!valueExists(restriction)){
			restriction = this.openerRestriction;
		}
		
		this.abEquipmentForm_tabs.selectTab("abEquipmentForm_tabGeneral", restriction, newRecord, false, false);
		this.abEquipmentForm_tabGeneral.refresh(restriction, newRecord);
		this.abEquipmentForm_tabLocation.refresh(restriction, newRecord);
		this.abEquipmentForm_tabUsage.refresh(restriction, newRecord);
		this.abEquipmentForm_tabCosts.refresh(restriction, newRecord);
		this.abEquipmentForm_tabDates.refresh(restriction, newRecord);
		this.abEquipmentForm_tabDocuments.refresh(restriction, newRecord);
		this.abEquipmentForm_tabTelecom.refresh(restriction, newRecord);
		this.abEquipmentForm_tabSurvey.refresh(restriction, newRecord);
		this.abEquipmentForm_tabERP.refresh(restriction, newRecord);
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
	var controller = View.controllers.get('abEqEditFormCtrl');
	var tab = tabPanel.findTab(currentTabName);
	var tabController = controller.getTabController(tab);
	if (tabController) {
		var formPanel;

		switch(currentTabName){
		case 'abEquipmentForm_tabGeneral':
			formPanel = tabController.abEqEditForm_General;
			break;
		case 'abEquipmentForm_tabLocation':
			formPanel = tabController.abEqEditForm_Location;
			break;
		case 'abEquipmentForm_tabUsage':
			formPanel = tabController.abEqEditForm_Usage;
			break;
		case 'abEquipmentForm_tabCosts':
			formPanel = tabController.abEqEditForm_Costs;
			break;
		case 'abEquipmentForm_tabDocuments':
			formPanel = tabController.abEqEditForm_Documents;
			break;	
		case 'abEquipmentForm_tabDates':
			formPanel = tabController.abEqEditForm_Dates;
			break;	
		case 'abEquipmentForm_tabTelecom':
			formPanel = tabController.abEqEditForm_Telecom;
			break;
		case 'abEquipmentForm_tabSurvey':
			formPanel = tabController.abEqEditForm_Survey;
			break;
		case 'abEquipmentForm_tabERP':
			formPanel = tabController.abEqEditForm_ERP;
			break;
		}
		
		if(valueExistsNotEmpty(formPanel)){
			isRecordChanged = hasChanged(formPanel);
		}
		
	}
	
	if(isRecordChanged && valueExistsNotEmpty(formPanel.getRecord().getValue('eq.eq_id'))) {
		var confirmDialog = confirm(getMessage('confirmSaveOnChangeTab'));
		if(confirmDialog){
			var addedRecord = formPanel.getDataSource().saveRecord(formPanel.getRecord());
			
			if (valueExists(addedRecord)) {
					formPanel.newRecord = false;
					afterSaveEquipment(tabController, formPanel);
					formPanel.refresh();
			} else {
				var record = formPanel.getRecord();
				if (record.values['eq.eq_id'] != record.oldValues['eq.eq_id']) {
					afterSaveEquipment(tabController, formPanel);
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
    
    // KB# 3052816 Valentina Sandu - IE 9 doesn't support startsWith function
    // added function body in case is not found
    if (!String.prototype.startsWith) {
    	  String.prototype.startsWith = function (str){
    	    return this.lastIndexOf(str, 0) === 0;
    	 };
    }
    
    for (var eqVal in record.values){
    	// avoid fields like field_gen
        if (eqVal.startsWith('eq.')) {
        	if (eqVal == "eq.survey_photo" || eqVal == "eq.image_eq_assy" || 
        			eqVal == "eq.image_eq_elec" || eqVal == "eq.image_spec" || eqVal == "eq.survey_photo_eq") {
        		if(recordFieldValues[eqVal]){
        			recordValues[eqVal] = recordFieldValues[eqVal].toLowerCase();
        		}
        		if(oldFieldValues[eqVal]){
        			oldValues[eqVal] = oldFieldValues[eqVal].toLowerCase();
        		}
        	}
        	else if (eqVal == "eq.qty_dep_period") {
        		if(valueExistsNotEmpty(recordFieldValues[eqVal])){
        			var formattedValue = parseFloat(recordFieldValues[eqVal]).toFixed(2);
        			recordValues[eqVal] = formattedValue;
        		}else{
        			recordValues[eqVal] = recordFieldValues[eqVal];
        		}
        		
        		if (valueExistsNotEmpty(oldFieldValues[eqVal])) {
        			var formattedValue = parseFloat(oldFieldValues[eqVal]).toFixed(2);
        			oldValues[eqVal] = formattedValue;
        		} else {
        			oldValues[eqVal] = oldFieldValues[eqVal];
        		}
        	}else if (eqVal == "eq.lat" || eqVal == "eq.lon") {
        		if(valueExistsNotEmpty(recordFieldValues[eqVal])){
        			var formattedValue = parseFloat(recordFieldValues[eqVal]).toFixed(16);
        			recordValues[eqVal] = formattedValue;
        		}else{
        			recordValues[eqVal] = recordFieldValues[eqVal];
        		}
        		
        		if (valueExistsNotEmpty(oldFieldValues[eqVal])) {
        			var formattedValue = parseFloat(oldFieldValues[eqVal]).toFixed(16);
        			oldValues[eqVal] = formattedValue;
        		} else {
        			oldValues[eqVal] = oldFieldValues[eqVal];
        		}
        	}else if (eqVal == "eq.num_po" || eqVal == "eq.po_line_id") {
        		if(valueExistsNotEmpty(recordFieldValues[eqVal])){
        			var formattedValue = parseInt(recordFieldValues[eqVal]);
        			recordValues[eqVal] = formattedValue;
        		}else{
        			recordValues[eqVal] = recordFieldValues[eqVal];
        		}
        		
        		if (valueExistsNotEmpty(oldFieldValues[eqVal])) {
        			var formattedValue = parseInt(oldFieldValues[eqVal]);
        			oldValues[eqVal] = formattedValue;
        		} else {
        			oldValues[eqVal] = oldFieldValues[eqVal];
        		}
        	} else if (eqVal.startsWith("eq.cost")) {
        		if(valueExistsNotEmpty(recordFieldValues[eqVal])){
        			var formattedValue = parseFloat(recordFieldValues[eqVal]).toFixed(2);
        			recordValues[eqVal] = formattedValue;
        		}else{
        			recordValues[eqVal] = recordFieldValues[eqVal];
        		}
        		
        		if (valueExistsNotEmpty(oldFieldValues[eqVal])) {
        			var formattedValue = parseFloat(oldFieldValues[eqVal]).toFixed(2);
        			oldValues[eqVal] = formattedValue;
        		} else {
        			oldValues[eqVal] = oldFieldValues[eqVal];
        		}
        	}
        	else if (eqVal.startsWith("eq.date") || eqVal.startsWith("eq.time") || eqVal == "eq.source_date_update" 
        		|| eqVal == "eq.source_time_update"||eqVal=="eq.meter_last_read") {
        		if(valueExistsNotEmpty(recordFieldValues[eqVal])){
        			recordValues[eqVal] = recordFieldValues[eqVal].getTime();
        		}
        		if(valueExistsNotEmpty(oldFieldValues[eqVal])){
        			oldValues[eqVal] = oldFieldValues[eqVal].getTime();
        		}
        	}else {
            		recordValues[eqVal] = recordFieldValues[eqVal];
            		oldValues[eqVal] = oldFieldValues[eqVal];
            	}
        	
        }else if(eqVal.startsWith('eqstd.')){
        	if(eqVal == "eqstd.doc_graphic"){
        		if(recordFieldValues[eqVal]){
        			recordValues[eqVal] = recordFieldValues[eqVal].toLowerCase();
        		}
        		if(oldFieldValues[eqVal]){
        			oldValues[eqVal] = oldFieldValues[eqVal].toLowerCase();
        		}
        	}
        }
    }
    
    var isEqual = objectsEqual(recordValues, oldValues);
    return !isEqual;
}

function onAfterTabChange(tabPanel, newTabName){
	var controller = View.controllers.get('abEqEditFormCtrl');
	var newTab = tabPanel.findTab(newTabName);
	var tabController = controller.getTabController(newTab);
}

