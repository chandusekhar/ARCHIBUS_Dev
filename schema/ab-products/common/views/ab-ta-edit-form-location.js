var abFurnitureForm_tabLocationController = View.createController('abFurnitureForm_tabLocationController', {
	
	afterInitialDataFetch: function () {
		if(valueExists(View.getOpenerView())){
			var openerConsole = View.getOpenerView();
			var tabs = View.getOpenerView().panels.get("abFurnitureForm_tabs");
			
			if(tabs){
				var newRecord = tabs.parameters.newRecord;
				if(!newRecord){
					newRecord = View.newRecord;
				}
				var tabsRestriction = tabs.parameters.restriction;
				
				if (valueExists(newRecord) && newRecord == true) {
					this.abTaEditForm_Location.newRecord = newRecord;
					this.abTaEditForm_Location.show();
				} else if(newRecord == false) {
					this.abTaEditForm_Location.refresh(tabsRestriction, newRecord);
				}
					
			}
		  }
		
	},
	
	abTaEditForm_Location_onCancel: function(){
		var locationForm = this.abTaEditForm_Location;
		var detailsPanel = View.getOpenerView().parentViewPanel;
		
		if(detailsPanel){
			detailsPanel.loadView('ab-blank.axvw', locationForm.restriction, null);
		}else{
			if(View.getOpenerView().getParentDialog() && View.getOpenerView().panels.get('abFurnitureForm_tabs')){
				View.getOpenerView().getParentDialog().close();
			}
		}
	},
	
	abTaEditForm_Location_beforeRefresh: function(){
		var restriction = new Ab.view.Restriction();
		var newRecord = null;
		var tabsRestriction = null;

		var tabs = View.getOpenerView().panels.get("abFurnitureForm_tabs");
		if(tabs){
			newRecord = tabs.parameters.newRecord;
			tabsRestriction = tabs.parameters.restriction;
			
			if(!valueExists(newRecord)){
				newRecord = View.parameters.newRecord;
				tabsRestriction = View.parameters.restriction;
			}
			
			if(valueExists(newRecord) && newRecord == true) {
				this.abTaEditForm_Location.newRecord = newRecord;
			}else {
				if(tabsRestriction){
					if(tabsRestriction["ta.ta_id"]) {
						restriction.addClause('ta.ta_id', tabsRestriction["ta.ta_id"]);
					} else if(tabsRestriction.clauses && tabsRestriction.clauses[0]){
						restriction.addClause('ta.ta_id', tabsRestriction.clauses[0].value);
					}
				this.abTaEditForm_Location.restriction = restriction;
				this.abTaEditForm_Location.newRecord = newRecord;
			}
				
			}
		}
		
	},
	
	abTaEditForm_Location_onSave: function() {
		var locationForm = this.abTaEditForm_Location;
		var locationDataSource = this.ds_abTaDefineFormLocation;
		var restriction = new Ab.view.Restriction();
		var tabs = View.getOpenerView().panels.get("abFurnitureForm_tabs");
		var primaryFieldValue = locationForm.getFieldValue("ta.ta_id");
		var recordLocation = locationForm.getRecord();
		
		var message = getMessage('formSaved');
		
		try{
			
			if(!this.validateBlAndSite(recordLocation)){
				return;
			}
			
			locationDataSource.saveRecord(recordLocation);
			restriction.addClause("ta.ta_id", primaryFieldValue, '=');
			locationForm.restriction = restriction;
			locationForm.newRecord = false;
			afterSaveFurniture(abFurnitureForm_tabLocationController, locationForm);
			locationForm.refresh();
			locationForm.displayTemporaryMessage(message);
		
			if(tabs && valueExists(tabs.parameters) && valueExists(tabs.parameters.callback)){
				this.callbackMethod = tabs.parameters.callback;
			}
			callCallbackMethod();
				
			if(typeof(afterSaveCallback) == 'function'){
				afterSaveCallback(isSaved);
			}	
			
		}
		catch(e){
			var errMessage = getMessage('errorSave').replace('{0}', primaryFieldValue)+ '<br>'+ e.message;
            View.showMessage('error', errMessage, e.message, e.data);
            return;
		}
	},
	
	abTaEditForm_Location_onLocate: function(context){
		var me = this;
		var restriction = this.getCurrentFurnitureRestriction();
		var record = this.abTaEditForm_Location.getRecord();
		
		View.openDialog('ab-locate-asset.axvw', restriction, false, {
		    width: 800,
		    height: 600,
		    record: record,
		    assetType: 'ta',
		    callback: function(){
		    	refreshFurnitureLocationPanel();
		    }
		});
	},
	
    getCurrentFurnitureRestriction:function(){
		var record = this.abTaEditForm_Location.record;
    	var restriction = new Ab.view.Restriction();
    	
    	if(record) {
 			restriction.addClause('ta.ta_id', record.getValue('ta.ta_id'), '=', 'OR');  
 		} else {
    		restriction.addClause('ta.ta_id', '', 'IS NULL', 'OR');
    	}
    	return restriction;
	},
	
	/**
	 * validate building code against site code
	 */
	validateBlAndSite: function(record){
		var bl_id = record.getValue('ta.bl_id');
		var site_id = record.getValue('ta.site_id');
		if(valueExistsNotEmpty(bl_id) && valueExistsNotEmpty(site_id)){
			var parameters = {
				tableName: 'bl',
		        fieldNames: toJSON(['bl.bl_id', 'bl.site_id']),
		        restriction: toJSON(new Ab.view.Restriction({'bl.bl_id':bl_id, 'bl.site_id':site_id}))
			};
		    try {
		        var result = Ab.workflow.Workflow.call('AbCommonResources-getDataRecords', parameters);
		        if (result.data.records.length == 0){
					View.showMessage(getMessage('no_match_bl_site'));
					return false;
				}
		    } catch (e) {
		        Workflow.handleError(e);
				return false;
		    }
		}
		return true;
	}
});



function refreshFurnitureLocationPanel() {
	var furnitureLocationPanel = abFurnitureForm_tabLocationController.abTaEditForm_Location;
	furnitureLocationPanel.refresh(furnitureLocationPanel.restriction);
}

function callCallbackMethod(){
	var controller = View.controllers.get('abFurnitureForm_tabLocationController');
	if(valueExists(controller.callbackMethod)){
		controller.callbackMethod();
	}
	return true;
}