var abEquipmentForm_tabSurveyController = View.createController('abEquipmentForm_tabSurveyController', {
	
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
					this.abEqEditForm_Survey.newRecord = newRecord;
					this.abEqEditForm_Survey.show();
				} else if(newRecord == false) {
					this.abEqEditForm_Survey.refresh(tabsRestriction, newRecord);
				}
					
				}
		  }
		
	},
	
	abEqEditForm_Survey_onCancel: function(){
		var surveyForm = this.abEqEditForm_Survey;
		var detailsPanel = View.getOpenerView().parentViewPanel;
		
		if(detailsPanel){
			detailsPanel.loadView('ab-blank.axvw', surveyForm.restriction, null);
		}else{
			if(View.getOpenerView().getParentDialog() && View.getOpenerView().panels.get('abEquipmentForm_tabs')){
				View.getOpenerView().getParentDialog().close();
			}
		}
	},
	
	abEqEditForm_Survey_beforeRefresh: function(){
		
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
				this.abEqEditForm_Survey.newRecord = newRecord;
			}else if(newRecord == false) {
				if(tabsRestriction){
					if(tabsRestriction["eq.eq_id"]) {
						restriction.addClause('eq.eq_id', tabsRestriction["eq.eq_id"]);
					} else if(tabsRestriction.clauses && tabsRestriction.clauses[0]){
						restriction.addClause('eq.eq_id', tabsRestriction.clauses[0].value);
					}
				}
				this.abEqEditForm_Survey.restriction = restriction;
				this.abEqEditForm_Survey.newRecord = newRecord;
			}
		}
	},
	
	abEqEditForm_Survey_afterRefresh: function() {
		if (valueExistsNotEmpty(this.abEqEditForm_Survey.getFieldValue('eq.survey_photo_eq'))) {
			this.abEqEditForm_Survey.showImageDoc('survey_photo_image', 'eq.eq_id', 'eq.survey_photo_eq');
		}
	},
	
	abEqEditForm_Survey_onSave: function() {
		var surveyForm = this.abEqEditForm_Survey;
		var surveyDataSource = this.ds_abEqEditFormSurvey;
		var restriction = new Ab.view.Restriction();
		var tabs = View.getOpenerView().panels.get("abEquipmentForm_tabs");
		var primaryFieldValue = surveyForm.getFieldValue("eq.eq_id");
		
		var message = getMessage('formSaved');
		
		try{
			  var isSaved = surveyForm.save();
				if(isSaved){
					surveyForm.setFieldValue('eq.eq_id', primaryFieldValue);
					restriction.addClause("eq.eq_id", primaryFieldValue);
					surveyForm.restriction = restriction;
					
					afterSaveEquipment(abEquipmentForm_tabSurveyController, surveyForm);
					
					surveyForm.refresh(restriction);
					var record = surveyDataSource.getRecord(restriction);

					surveyForm.displayTemporaryMessage(message);
				}
			
		}
		catch(e){
			var errMessage = getMessage('errorSave').replace('{0}', primaryFieldValue)+ '<br>'+ e.message;
            View.showMessage('error', errMessage, e.message, e.data);
            return;
		}
		
	},
	
});

