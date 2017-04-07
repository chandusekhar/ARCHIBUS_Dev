var abEquipmentForm_tabDatesController = View.createController('abEquipmentForm_tabDatesController', {
	
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
					this.abEqEditForm_Dates.newRecord = newRecord;
					this.abEqEditForm_Dates.show();
				} else if(newRecord == false) {
					this.abEqEditForm_Dates.refresh(tabsRestriction, newRecord);
				}
					
				}
		  }
	},
	
	abEqEditForm_Dates_onCancel: function(){
		var datesForm = this.abEqEditForm_Dates;
		var detailsPanel = View.getOpenerView().parentViewPanel;
		
		if(detailsPanel){
			detailsPanel.loadView('ab-blank.axvw', datesForm.restriction, null);
		}else{
			if(View.getOpenerView().getParentDialog() && View.getOpenerView().panels.get('abEquipmentForm_tabs')){
				View.getOpenerView().getParentDialog().close();
			}
		}
	},
	
	abEqEditForm_Dates_beforeRefresh: function(){
		
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
				this.abEqEditForm_Dates.newRecord = newRecord;
			}else if(newRecord == false) {
				if(tabsRestriction){
					if(tabsRestriction["eq.eq_id"]) {
						restriction.addClause('eq.eq_id', tabsRestriction["eq.eq_id"]);
					} else if(tabsRestriction.clauses && tabsRestriction.clauses[0]){
						restriction.addClause('eq.eq_id', tabsRestriction.clauses[0].value);
					}
				}
				this.abEqEditForm_Dates.restriction = restriction;
				this.abEqEditForm_Dates.newRecord = newRecord;
			}
		}
	},
	
	abEqEditForm_Dates_onSave: function() {
		var datesForm = this.abEqEditForm_Dates;
		var datesDataSource = this.ds_abEqEditFormDates;
		var restriction = new Ab.view.Restriction();
		var tabs = View.getOpenerView().panels.get("abEquipmentForm_tabs");
		var primaryFieldValue = datesForm.getFieldValue("eq.eq_id");
		
		var message = getMessage('formSaved');
		
		try{
			  var isSaved = datesForm.save();
				if(isSaved){
					datesForm.setFieldValue('eq.eq_id', primaryFieldValue);
					restriction.addClause("eq.eq_id", primaryFieldValue);
					datesForm.restriction = restriction;
					
					afterSaveEquipment(abEquipmentForm_tabDatesController, datesForm);
					
					datesForm.refresh(restriction);
					var record = datesDataSource.getRecord(restriction);

					datesForm.displayTemporaryMessage(message);
				}
			
		}
		catch(e){
			var errMessage = getMessage('errorSave').replace('{0}', primaryFieldValue)+ '<br>'+ e.message;
            View.showMessage('error', errMessage, e.message, e.data);
            return;
		}
	},
	
});

