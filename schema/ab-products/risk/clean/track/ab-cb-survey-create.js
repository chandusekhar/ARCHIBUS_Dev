/**
 * Generate survey items
 */
var abCbSurveyCreateCtrl = View.createController('abCbSurveyCreateCtrl', {
	// page mode ("action", "request")
	pageMode: null,
	
	// id's of selected parent items
	pKeys: [],
	
	// callback method if defined
	callback: null,
	
	// selected project
	projectId: null,
	
	// problem type of selected project
	projProbType: null,
	
	afterViewLoad: function(){
		// make some labels bold
		this.setLabels();
		// read input data
		if(valueExists(this.view.parameters.pageMode)){
			this.pageMode = this.view.parameters.pageMode;
		}
		if(valueExists(this.view.parameters.pKeys)){
			this.pKeys = this.view.parameters.pKeys;
		}
		if(valueExists(this.view.parameters.callback)){
			this.callback = this.view.parameters.callback;
		}
		if(valueExists(this.view.parameters.projectId)){
			this.projectId = this.view.parameters.projectId;
		}
		if(valueExists(this.view.parameters.projProbType)){
			this.projProbType = this.view.parameters.projProbType;
		}
	},
	
	afterInitialDataFetch: function(){
		// refresh form to new record
		this.abCbSurveyCreateForm.refresh(null, true);
		this.abCbSurveyCreateForm.setFieldValue('activity_log.project_id', this.projectId);
		this.abCbSurveyCreateForm.setFieldValue('activity_log.prob_type', this.projProbType);
	},
	
	setLabels: function(){
		var elem = document.getElementById('abCbSurveyCreateForm_label_2_labelCell');
		if(elem){
			elem.style.fontWeight = 'bold';
		}
	},
	
	/*
	 *  Generate survey items handler.
	 */
	abCbSurveyCreateForm_onGenerate: function(){
		var pKeys = this.pKeys;
		var level = "";
		var radioGenerateFor = document.getElementsByName('radioGenerateFor');
		if(radioGenerateFor){
			for (var i=0; i < radioGenerateFor.length; i++){
				if (radioGenerateFor[i].checked){
					level = radioGenerateFor[i].value;
					break;
				}
			}
		}
		// validate settings
		try{
			var result = Workflow.callMethod('AbRiskCleanBuilding-CleanBuildingService-validateSurveySettings', level, pKeys);
			if(result.message == "error"){
				View.showMessage(getMessage("err_invalid_settings"));
				return false;
			}
		} catch(e){
    		Workflow.handleError(e);
    		return false;
		}
		var newRecord = this.abCbSurveyCreateForm.getOutboundRecord();
		
		var fieldId = "cb_hcm_loc_typ.hcm_loc_typ_id";
		var locTypes = this.abCbSurveyCreateForm.getFieldMultipleValues(fieldId);
				
		var controller = this;
		var surveyItems = [];

		// first call to get the number of records that will be generated
		var recordsNo = 0;
		var isCountOnly = true;
		try{
			var result = Workflow.callMethod('AbRiskCleanBuilding-CleanBuildingService-generateSurveyRecords', this.pageMode, pKeys, level, newRecord, locTypes, isCountOnly);
			recordsNo = result.value;
		}catch(e){
    		Workflow.handleError(e);
    		return false;
		}

		// get confirmation from user
		var confirmMessage = getMessage("msg_confirm_generate_survey_items").replace('{0}', recordsNo);
		View.confirm(confirmMessage, function(button) { 
		    if (button == 'yes') { 
				// second call to generate the records
				isCountOnly = false;
				try{
					var jobId  = Workflow.startJob('AbRiskCleanBuilding-CleanBuildingService-generateSurveyRecords', controller.pageMode, pKeys, level, newRecord, locTypes, isCountOnly);
				    View.openJobProgressBar(getMessage("msg_generate_survey_items"), jobId, '', function(status) { 
				    	
				    	if(valueExists(status.dataSet) && valueExists(status.dataSet.records)){
				    		for(var i = 0; i < status.dataSet.records.length; i++){
				    			var record = status.dataSet.records[i];
				    			surveyItems.push(record.getValue("activity_log.activity_log_id"));
				    		}
				    	}
				    	if(controller.callback){
				    		controller.callback.call(this, surveyItems);
				    	}
				    });
				    
				}catch(e){
		    		Workflow.handleError(e);
		    		return false;
				}
		    } 
		});
	}
});