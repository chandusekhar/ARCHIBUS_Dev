var abEquipmentForm_tabTelecomController = View.createController('abEquipmentForm_tabTelecomController', {
	
	afterInitialDataFetch: function () {
		/*var restriction = new Ab.view.Restriction();
		var tabs = View.getOpenerView().panels.get("abEquipmentForm_tabs");
		var newRecord = tabs.parameters.newRecord;
		var tabsRestriction = tabs.parameters.restriction;
		
		if(newRecord){
			this.abEqEditForm_Telecom.newRecord = newRecord;
			this.abEqEditForm_Telecom.show();
		}else{
			if(tabsRestriction){
				if(tabsRestriction["eq.eq_id"]) {
					restriction.addClause('eq.eq_id', tabsRestriction["eq.eq_id"]);
				} else if(tabsRestriction.clauses && tabsRestriction.clauses[0]){
					restriction.addClause('eq.eq_id', tabsRestriction.clauses[0].value);
				}
			}
			this.abEqEditForm_Telecom.refresh(restriction);
		}*/
		
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
					this.abEqEditForm_Telecom.newRecord = newRecord;
					this.abEqEditForm_Telecom.show();
				} else if(newRecord == false) {
					this.abEqEditForm_Telecom.refresh(tabsRestriction, newRecord);
				}
					
				}
		  }
		
	},
	
	abEqEditForm_Telecom_onCancel: function(){
		var telecomForm = this.abEqEditForm_Telecom;
		var detailsPanel = View.getOpenerView().parentViewPanel;
		
		if(detailsPanel){
			detailsPanel.loadView('ab-blank.axvw', telecomForm.restriction, null);
		}else{
			if(View.getOpenerView().getParentDialog() && View.getOpenerView().panels.get('abEquipmentForm_tabs')){
				View.getOpenerView().getParentDialog().close();
			}
		}
	},
	
	abEqEditForm_Telecom_beforeRefresh: function(){
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
				this.abEqEditForm_Telecom.newRecord = newRecord;
			}else if(newRecord == false) {
				if(tabsRestriction){
					if(tabsRestriction["eq.eq_id"]) {
						restriction.addClause('eq.eq_id', tabsRestriction["eq.eq_id"]);
					} else if(tabsRestriction.clauses && tabsRestriction.clauses[0]){
						restriction.addClause('eq.eq_id', tabsRestriction.clauses[0].value);
					}
				}
				this.abEqEditForm_Telecom.restriction = restriction;
				this.abEqEditForm_Telecom.newRecord = newRecord;
			}
		}
	},
	
	abEqEditForm_Telecom_onSave: function() {
		var telecomForm = this.abEqEditForm_Telecom;
		var telecomDataSource = this.ds_abEqEditFormTelecom;
		var restriction = new Ab.view.Restriction();
		var tabs = View.getOpenerView().panels.get("abEquipmentForm_tabs");
		var primaryFieldValue = telecomForm.getFieldValue("eq.eq_id");
		
		var message = getMessage('formSaved');
		
		try{
			  var isSaved = telecomForm.save();
				if(isSaved){
					telecomForm.setFieldValue('eq.eq_id', primaryFieldValue);
					restriction.addClause("eq.eq_id", primaryFieldValue);
					telecomForm.restriction = restriction;
					
					afterSaveEquipment(abEquipmentForm_tabTelecomController, telecomForm);
					
					telecomForm.refresh(restriction);
					var record = telecomDataSource.getRecord(restriction);

					telecomForm.displayTemporaryMessage(message);
				}
			
		}
		catch(e){
			var errMessage = getMessage('errorSave').replace('{0}', primaryFieldValue)+ '<br>'+ e.message;
            View.showMessage('error', errMessage, e.message, e.data);
            return;
		}
	},
	
});
