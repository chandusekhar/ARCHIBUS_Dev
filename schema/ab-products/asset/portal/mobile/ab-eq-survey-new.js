var abEqSurveyNewCtrl = View.createController('eqNewSurveyController', {
	//user name returned after survey creation
	userName: null,
	currentSurveyId: null,
	
	afterViewLoad: function() {
		
		//hide all the buttons at title bar.
		if(Ext.get("alterButton")!=null)
			Ext.get("alterButton").dom.hidden = true;
	
		if(Ext.get("favoritesButton")!=null)
			Ext.get("favoritesButton").dom.hidden = true;
		
		if(Ext.get("printButton")!=null)
			Ext.get("printButton").dom.hidden = true;
		
		if(Ext.get("emailButton")!=null)
			Ext.get("emailButton").dom.hidden = true;
		
		if(Ext.get("loggingButton")!=null)
			Ext.get("loggingButton").dom.hidden = true;
		
	}
});

function onCreateSurvey() {
	var surveyForm = View.panels.get('eqNewSurvey_form');
	
	var survey_id = surveyForm.getFieldValue('survey.survey_id');
	var performed_by = surveyForm.fields.get('survey.em_id').dom.value;
	var survey_date = surveyForm.getFieldValue('survey.survey_date');
	var description = surveyForm.getFieldValue('survey.description');
	var bl_id = surveyForm.getFieldValue('survey.bl_id');
	var fl_id = surveyForm.getFieldValue('survey.fl_id');
	var dv_id = surveyForm.getFieldValue('survey.dv_id');
	var dp_id = surveyForm.getFieldValue('survey.dp_id');
	var eq_std = surveyForm.getFieldValue('survey.eq_std');
	
	surveyForm.clearValidationResult();
	if(!surveyForm.validateFields()){
		return;
	}
	
	var emDs = View.dataSources.get('emUser_ds');
	var dsRestriction = new Ab.view.Restriction();
	dsRestriction.addClause("em.em_id", makeLiteral(performed_by), "=");
	
	var records = emDs.getRecords(dsRestriction);
	
    if(records==null || records.length<1){
    	surveyForm.validationResult.valid = false;
    	surveyForm.validationResult.message = getMessage('errorInvalidEmployee1') + "[" + performed_by +"]. " + getMessage('errorInvalidEmployee2');
    	surveyForm.validationResult.invalidFields['survey.em_id'] = "";
    	surveyForm.displayValidationResult();
    	return false;
    } else {
    	var result = null;
	   	try {
		   	result = Workflow.callMethod('AbAssetManagement-AssetMobileService-createSurvey', survey_id, survey_date,
					performed_by, description);
       	}catch (e) {
     		if (e.code=='ruleFailed'){
       		  View.showMessage(e.message);
       		}else{
     		  Workflow.handleError(e);
     		}
     		return;
       	}	 
		if (result.code == 'executed') {
			//creatSurvey returns the user name
			abEqSurveyNewCtrl.userName = result.message;
			
			updateSurveyField(survey_id, 'survey.survey_fields', getEqFieldsActivityParamValue());
			
			importEquipmentToSurvey();
			
			abEqSurveyNewCtrl.currentSurveyId = survey_id;
			var tabPanel = View.panels.get('abEqSurveyNew_tabs'); 
			tabPanel.selectTab('abEqSurveyNew_tab2');
		}
    }
}

function importEquipmentToSurvey(){
	var surveyForm = View.panels.get('eqNewSurvey_form');
	
	var survey_id = surveyForm.getFieldValue('survey.survey_id');
	var bl_id = surveyForm.getFieldValue('survey.bl_id');
	var fl_id = surveyForm.getFieldValue('survey.fl_id');
	var dv_id = surveyForm.getFieldValue('survey.dv_id');
	var dp_id = surveyForm.getFieldValue('survey.dp_id');
	var eq_std = surveyForm.getFieldValue('survey.eq_std');
	
	try {
		result = Workflow.callMethod('AbAssetManagement-AssetMobileService-importEquipmentToSurvey', survey_id, bl_id, fl_id, dv_id, dp_id, abEqSurveyNewCtrl.userName, eq_std);
    }catch (e) {
    	if (e.code=='ruleFailed'){
    		View.showMessage(e.message);
    	}else{
    		Workflow.handleError(e);
     	}
     	return;
    }	
       	
    if (result.code == 'executed') {
		 //if no record exists in eq table, ask user if they like to create a new survey without any records in eq_audit table.
		 if(result.value<1){
			 View.confirm(getMessage('noEqRecordsConfirmMessage'), function(button) {
			    if (button == 'yes') {
			    	 // new survey is created, close the dialog
			    	refreshSurveyAndTasksGrids();
				} else {
					// delete the new survey, 
					try {
						result = Workflow.callMethod('AbAssetManagement-AssetMobileService-deleteSurvey', survey_id);
				    }catch (e) {
				    	if (e.code=='ruleFailed'){
				    		View.showMessage(e.message);
				    	}else{
				    		Workflow.handleError(e);
				     	}
				     	return;
				    }	
				    if (result.code == 'executed') {
				    	refreshSurveyAndTasksGrids();
						
						//close dialog
						View.getOpenerView().closeDialog();
					}
				}
			});
		 } else {
			 refreshSurveyAndTasksGrids();
		 }
	 }
}

function refreshSurveyAndTasksGrids(){
	View.getOpenerView().panels.get('eqSurveyGrid_grid').refresh();
	//clear the task grid
	View.getOpenerView().panels.get('eqSurveyTasksGrid_grid').refresh("1!=1");
}

function updateSurveyField(surveyId, fieldName, fieldValue){
	var surveyDs = abEqSurveyNewCtrl.eqNewSurvey_ds;
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause('survey.survey_id', surveyId, '=');
	
	var surveyRecord = surveyDs.getRecord(restriction);
	if(surveyRecord && fieldName && fieldValue){
		surveyRecord.setValue(fieldName, fieldValue);
		surveyRecord.isNew = false;
		surveyDs.saveRecord(surveyRecord);
	}
}

function makeLiteral(value){
	return "'" + value.replace(/\'/g, "''") +"'";
}