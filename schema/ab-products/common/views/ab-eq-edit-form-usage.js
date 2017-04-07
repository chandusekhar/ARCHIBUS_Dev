var abEquipmentForm_tabUsageController = View.createController('abEquipmentForm_tabUsageController', {
	
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
					this.abEqEditForm_Usage.newRecord = newRecord;
					this.abEqEditForm_Usage.show();
				} else if(newRecord == false) {
					this.abEqEditForm_Usage.refresh(tabsRestriction);
				}
					
				}
		  }
		
	},
	
	abEqEditForm_Usage_onCancel: function(){
		var usageForm = this.abEqEditForm_Usage;
		var detailsPanel = View.getOpenerView().parentViewPanel;
		
		if(detailsPanel){
			detailsPanel.loadView('ab-blank.axvw', usageForm.restriction, null);
		}else{
			if(View.getOpenerView().getParentDialog() && View.getOpenerView().panels.get('abEquipmentForm_tabs')){
				View.getOpenerView().getParentDialog().close();
			}
		}
	},
	
	abEqEditForm_Usage_beforeRefresh: function(){
		
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
				this.abEqEditForm_Usage.newRecord = newRecord;
			}else if(newRecord == false) {
				if(tabsRestriction){
					if(tabsRestriction["eq.eq_id"]) {
						restriction.addClause('eq.eq_id', tabsRestriction["eq.eq_id"]);
					} else if(tabsRestriction.clauses && tabsRestriction.clauses[0]){
						restriction.addClause('eq.eq_id', tabsRestriction.clauses[0].value);
					}
				}
				this.abEqEditForm_Usage.restriction = restriction;
				this.abEqEditForm_Usage.newRecord = newRecord;
			}
		}
	},
	
	
	abEqEditForm_Usage_onSave: function() {
		var usageForm = this.abEqEditForm_Usage;
		var usageDataSource = this.ds_abEqEditFormUsage;
		var restriction = new Ab.view.Restriction();
		var tabs = View.getOpenerView().panels.get("abEquipmentForm_tabs");
		var primaryFieldValue = usageForm.getFieldValue("eq.eq_id");
		
		var message = getMessage('formSaved');
		
		try{
			  var isSaved = usageForm.save();
				if(isSaved){
					usageForm.setFieldValue('eq.eq_id', primaryFieldValue);
					restriction.addClause("eq.eq_id", primaryFieldValue);
					usageForm.restriction = restriction;
					
					afterSaveEquipment(abEquipmentForm_tabUsageController, usageForm);
					
					usageForm.refresh(restriction);
					var record = usageDataSource.getRecord(restriction);

					usageForm.displayTemporaryMessage(message);
				}
			
		}
		catch(e){
			var errMessage = getMessage('errorSave').replace('{0}', primaryFieldValue)+ '<br>'+ e.message;
            View.showMessage('error', errMessage, e.message, e.data);
            return;
		}
	},
});


