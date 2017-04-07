var abEquipmentForm_tabLocationController = View.createController('abEquipmentForm_tabLocationController', {
	
	afterInitialDataFetch: function () {
		
		if(valueExists(View.getOpenerView())){
			var openerConsole = View.getOpenerView();
			var tabs = View.getOpenerView().panels.get("abEquipmentForm_tabs");
			
			if(tabs){
				var newRecord = tabs.parameters.newRecord;
				if(!newRecord){
					newRecord = View.newRecord;
				}
				var tabsRestriction = tabs.parameters.restriction;
				
				if (valueExists(newRecord) && newRecord == true) {
					this.abEqEditForm_Location.newRecord = newRecord;
					this.abEqEditForm_Location.show();
				} else if(newRecord == false) {
					this.abEqEditForm_Location.refresh(tabsRestriction, newRecord);
					
				}
		  }
		}

	},
	
	abEqEditForm_Location_onCancel: function(){
		var locationForm = this.abEqEditForm_Location;
		var detailsPanel = View.getOpenerView().parentViewPanel;
		
		if(detailsPanel){
			detailsPanel.loadView('ab-blank.axvw', locationForm.restriction, null);
		}else{
			if(View.getOpenerView().getParentDialog() && View.getOpenerView().panels.get('abEquipmentForm_tabs')){
				View.getOpenerView().getParentDialog().close();
			}
		}
	},
	
	abEqEditForm_Location_beforeRefresh: function(){
		
		var restriction = new Ab.view.Restriction();
		var newRecord = null;
		var tabsRestriction = null;

		var tabs = View.getOpenerView().panels.get("abEquipmentForm_tabs");
		if(tabs){
			newRecord = tabs.parameters.newRecord;
			tabsRestriction = tabs.parameters.restriction;
			
			if(!valueExists(newRecord)){
				newRecord = View.parameters.newRecord;
				tabsRestriction = View.parameters.restriction;
			}
			
			if(valueExists(newRecord) && newRecord == true) {
				this.abEqEditForm_Location.newRecord = newRecord;
			}else if(newRecord == false) {
				if(tabsRestriction){
					if(tabsRestriction["eq.eq_id"]) {
						restriction.addClause('eq.eq_id', tabsRestriction["eq.eq_id"]);
					} else if(tabsRestriction.clauses && tabsRestriction.clauses[0]){
						restriction.addClause('eq.eq_id', tabsRestriction.clauses[0].value);
					}
				}
				this.abEqEditForm_Location.restriction = restriction;
				this.abEqEditForm_Location.newRecord = newRecord;
			}
		}
	},
	
	abEqEditForm_Location_onSave: function() {
		
		var locationForm = this.abEqEditForm_Location;
		var locationDataSource = this.ds_abEqEditFormLocation;
		var restriction = new Ab.view.Restriction();
		var tabs = View.getOpenerView().panels.get("abEquipmentForm_tabs");
		var primaryFieldValue = locationForm.getFieldValue("eq.eq_id");
		var recordLocation = locationForm.getRecord();
		
		var message = getMessage('formSaved');
		try{
			
			if(!this.validateBlAndSite(recordLocation)){
				return;
			}
			
			locationDataSource.saveRecord(recordLocation);
			restriction.addClause("eq.eq_id", primaryFieldValue, '=');
			locationForm.restriction = restriction;
			locationForm.newRecord = false;
			afterSaveEquipment(abEquipmentForm_tabLocationController, locationForm);
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
	
	abEqEditForm_Location_onLocate: function(context){
		var me = this;
		var restriction = this.getCurrentEquipmentRestriction();
		var record = this.abEqEditForm_Location.getRecord();
		
		View.openDialog('ab-locate-asset.axvw', restriction, false, {
		    width: 800,
		    height: 600,
		    record: record,
		    assetType: 'eq',
		    callback: function(){
		    	refreshEquipmentLocationPanel();
		    }
		});
	},
    
    getCurrentEquipmentRestriction:function(){
		var record = this.abEqEditForm_Location.record;
    	var restriction = new Ab.view.Restriction();
    	
    	if(record) {
 			restriction.addClause('eq.eq_id', record.getValue('eq.eq_id'), '=', 'OR');  
 		} else {
    		restriction.addClause('eq.eq_id', '', 'IS NULL', 'OR');
    	}
    	return restriction;
	},
	
	/**
	 * validate building code against site code
	 */
	validateBlAndSite: function(record){
		var bl_id = record.getValue('eq.bl_id');
		var site_id = record.getValue('eq.site_id');
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



function refreshEquipmentLocationPanel() {
	var equipmentLocationPanel = abEquipmentForm_tabLocationController.abEqEditForm_Location;
	equipmentLocationPanel.refresh(equipmentLocationPanel.restriction);
}

function callCallbackMethod(){
	var controller = View.controllers.get('abEquipmentForm_tabLocationController');
	if(valueExists(controller.callbackMethod)){
		controller.callbackMethod();
	}
	return true;
}

function customCommand(ctx){
	var controller = View.controllers.get('abEquipmentForm_tabLocationController');
	var form = ctx.command.getParentPanel();
	controller.customCommand(form);
}

