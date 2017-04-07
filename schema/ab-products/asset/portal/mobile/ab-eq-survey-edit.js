var abEqSurveyEditCtrl = View.createController('abEqSurveyEditController', {
	surveyId: null,
	eqId: null,
	surveyFields: [],
	
	afterViewLoad: function() {
		if(this.view.restriction){
			this.surveyId = this.view.restriction["eq_audit.survey_id"];
			this.eqId = this.view.restriction["eq_audit.eq_id"];
		}

		this.surveyFields = getSurveyFields(this.surveyId);
		
		this.showOnlySelectedFields();
	},

	showOnlySelectedFields: function(){
		var formFieldIds = this.eqSurveyDetailForm_form.fields.keys;
		
		for(var i=0; i<formFieldIds.length; i++){
			var fieldName = formFieldIds[i].replace("eq_audit.", "");
			var fieldIsSelected = this.surveyFields.indexOf(fieldName) < 0 ? false : true;
			var fieldIsReadOnly = this.eqSurveyDetailForm_form.fields.get(formFieldIds[i]).config.readOnly == "true" ? true : false;
			
			//21.2 spec: The Survey Photo field is required
			var fieldIsPhoto = formFieldIds[i] == "eq_audit.survey_photo_eq" ? true : false;
			var fieldIsRedline = formFieldIds[i] == "eq_audit.survey_redline_eq" ? true : false;
			
			if(fieldIsSelected || fieldIsReadOnly || fieldIsPhoto ||fieldIsRedline){
				this.eqSurveyDetailForm_form.showField(formFieldIds[i], true);
			}else{
				this.eqSurveyDetailForm_form.showField(formFieldIds[i], false);
			}
		}
	}
});

function getSurveyFields(surveyId){
	var dataSource = getSurveyDataSource();
	var record = getSurveyRecord(dataSource, surveyId);
	var paramValue = record.values['survey.survey_fields'];
	if(paramValue){
		var paramArray = paramValue.split(";");
		return paramArray;
	}else{
		var dsConfig = {id : 'afm_activity_params_ds', 
				tableNames: ['afm_activity_params'], 
				fieldNames: ['afm_activity_params.activity_id', 'afm_activity_params.param_id', 'afm_activity_params.param_value']};
		
		datasource = Ab.data.createDataSourceForFields(dsConfig);
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('afm_activity_params.activity_id', 'AbAssetManagement', '=');
		restriction.addClause('afm_activity_params.param_id', 'EquipmentFieldsToSurvey', '=');
		
		var records = datasource.getRecords(restriction);
		if(records!= null && records.length > 0){
			record = records[0];
			var paramValue = record.values['afm_activity_params.param_value'];
			var paramArray = paramValue.split(";");
			return paramArray;
		} 
	}
}

function onEditSurveyTask() {
	//refresh panel
	View.getOpenerView().panels.get('eqSurveyTasksGrid_grid').refresh();

	//close dialog
	View.getOpenerView().closeDialog();
}

function onDeleteSurveyTask() {
	var form = View.panels.get('eqSurveyDetailForm_form');
	var surveyId = form.getFieldValue('eq_audit.survey_id');
	var eqId = form.getFieldValue('eq_audit.eq_id');

	View.confirm(getMessage('deleteTaskConfirmMessage'), function(button) {
	    if (button == 'yes') {
	    	var result = null;
		   	try {
		   		result = Workflow.callMethod('AbAssetManagement-AssetMobileService-deleteSurveyTask', surveyId, eqId);
		    }catch (e) {
		    	if (e.code=='ruleFailed'){
		       	  View.showMessage(e.message);
		       	}else{
		     	  Workflow.handleError(e);
		     	}
		     	return;
		    }
			
		    if (result.code == 'executed') {
				View.getOpenerView().panels.get('eqSurveyTasksGrid_grid').refresh();
				View.getOpenerView().closeDialog();
			}
		}
	});
}
