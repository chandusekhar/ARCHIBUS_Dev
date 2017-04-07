function getSurveyDataSource(){
	var dsConfig = {id : 'survey_ds', 
			tableNames: ['survey'], 
			fieldNames: ['survey.survey_id', 'survey.survey_fields']};
	
	return new Ab.data.createDataSourceForFields(dsConfig);
}

function getEqFieldsActivityParamValue(){
	var dsConfig = {id : 'afm_activity_params_ds', 
			tableNames: ['afm_activity_params'], 
			fieldNames: ['afm_activity_params.activity_id', 'afm_activity_params.param_id', 'afm_activity_params.param_value']};
	
	var activityParamsDs = Ab.data.createDataSourceForFields(dsConfig);
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause('afm_activity_params.activity_id', 'AbAssetManagement', '=');
	restriction.addClause('afm_activity_params.param_id', 'EquipmentFieldsToSurvey', '=');
	
	var records = activityParamsDs.getRecords(restriction);
	if(records!= null && records.length > 0){
		return records[0].values['afm_activity_params.param_value'];
	}
}

function getSurveyRecord(dataSource, surveyId){
	var restriction = new Ab.view.Restriction();
	restriction.addClause("survey.survey_id", surveyId, "=");
	
	if (dataSource){
		var records = dataSource.getRecords(restriction);
		if (records!= null && records.length > 0){
			return records[0];
		}
	}
}

function showPhoto(formPanelId, fieldId, pkId, imgFieldId){
	if (!imgFieldId) {
		 imgFieldId = 'image_field';
	}
	var panel = View.panels.get(formPanelId);
	
	if(valueExistsNotEmpty(panel.getFieldValue(fieldId))){
		panel.showImageDoc(imgFieldId, pkId, fieldId);
	}else{
		panel.fields.get(imgFieldId).dom.src = null;
	}
}