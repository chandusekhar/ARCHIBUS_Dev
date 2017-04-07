var abEquipmentForm_tabERPController = View.createController('abEquipmentForm_tabERPController', {
	
	callbackMethod: null,
	
	customActionCommand: null,
	
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
					this.abEqEditForm_ERP.newRecord = newRecord;
					this.abEqEditForm_ERP.show();
				} else if(newRecord == false) {
					this.abEqEditForm_ERP.refresh(tabsRestriction, newRecord);
				}
					
				}
		  }
		
	},
	
	abEqEditForm_ERP_onCancel: function(){
		var erpForm = this.abEqEditForm_ERP;
		var detailsPanel = View.getOpenerView().parentViewPanel;
		
		if(detailsPanel){
			detailsPanel.loadView('ab-blank.axvw', erpForm.restriction, null);
		}else{
			if(View.getOpenerView().getParentDialog() && View.getOpenerView().panels.get('abEquipmentForm_tabs')){
				View.getOpenerView().getParentDialog().close();
			}
		}
	},
	
	abEqEditForm_ERP_beforeRefresh: function(){
		
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
				this.abEqEditForm_ERP.newRecord = newRecord;
			}else if(newRecord == false) {
				if(tabsRestriction){
					if(tabsRestriction["eq.eq_id"]) {
						restriction.addClause('eq.eq_id', tabsRestriction["eq.eq_id"]);
					} else if(tabsRestriction.clauses && tabsRestriction.clauses[0]){
						restriction.addClause('eq.eq_id', tabsRestriction.clauses[0].value);
					}
				}
				this.abEqEditForm_ERP.restriction = restriction;
				this.abEqEditForm_ERP.newRecord = newRecord;
			}
		}
		
	},
	
	abEqEditForm_ERP_onSave: function() {
		var erpForm = this.abEqEditForm_ERP;
		var erpDataSource = this.ds_abEqEditFormERP;
		var restriction = new Ab.view.Restriction();
		var tabs = View.getOpenerView().panels.get("abEquipmentForm_tabs");
		var primaryFieldValue = erpForm.getFieldValue("eq.eq_id");
		
		var message = getMessage('formSaved');
		
		try{
			  var isSaved = erpForm.save();
				if(isSaved){
					erpForm.setFieldValue('eq.eq_id', primaryFieldValue);
					restriction.addClause("eq.eq_id", primaryFieldValue);
					erpForm.restriction = restriction;
					
					afterSaveEquipment(abEquipmentForm_tabERPController, erpForm);
					
					erpForm.refresh(restriction);
					var record = erpDataSource.getRecord(restriction);

					erpForm.displayTemporaryMessage(message);
				}
			
		}
		catch(e){
			var errMessage = getMessage('errorSave').replace('{0}', primaryFieldValue)+ '<br>'+ e.message;
            View.showMessage('error', errMessage, e.message, e.data);
            return;
		}
	},
	customCommand: function (form) {
		if(valueExists(this.customActionCommand)){
			this.customActionCommand(form);
		}
	}
});


function callCallbackMethod(){
	var controller = View.controllers.get('abEquipmentForm_tabERPController');
	if(valueExists(controller.callbackMethod)){
		controller.callbackMethod();
	}
	return true;
}
