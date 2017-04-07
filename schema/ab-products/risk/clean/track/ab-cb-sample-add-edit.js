var abCbAssesssSamplesHideForWorker = (View.taskInfo.taskId == 'Manage My Hazard Abatement Items') ? true : false;
var abCbSampleEditCtrl = View.createController('abCbSampleEditCtrl', {
	// selected assessment id
	activityLogId: null,
	
	// selected sample id
	sampleId: -1,
	
	// problem type of selected project
	projProbType: null,
	
	isNewRecord: true,
	
	// infos to display in instructions
	activityLogInfo_SamplesField: null,
	
	afterViewLoad: function(){
		// get parameters
		if(valueExists(this.view.parameters.isNew)){
			this.isNewRecord = this.view.parameters.isNew;
		}
		if(valueExists(this.view.parameters.projProbType)){
			this.projProbType = this.view.parameters.projProbType;
		}
		var restriction = new Ab.view.Restriction();
		if(valueExists(this.view.parameters.restriction)){
			restriction = this.view.parameters.restriction;
		}
		// get activityLogId
		var clause = restriction.findClause("cb_samples.activity_log_id");
		if(clause){
			this.activityLogId = clause.value;
		}
		// get sample id
		var clause = restriction.findClause("cb_samples.sample_id");
		if(clause){
			this.sampleId = clause.value;
			this.isNewRecord = false;
		}
		
		if (valueExists(this.view.parameters.activityLogInfo_SamplesField)){
			this.activityLogInfo_SamplesField = this.view.parameters.activityLogInfo_SamplesField;
		}
	},
	
	afterInitialDataFetch: function(){
		var sampleRestr = new Ab.view.Restriction();
		sampleRestr.addClause("cb_samples.activity_log_id", this.activityLogId, "=");
		sampleRestr.addClause("cb_samples.sample_id", this.sampleId, "=");
		
		var resultRestr = new Ab.view.Restriction();
		resultRestr.addClause("cb_sample_result.sample_id", this.sampleId, "=");

		// refresh sample edit form
		this.abCbSampleEdit.refresh(sampleRestr, this.isNewRecord);
		
		if(this.isNewRecord){
			this.abCbSamplesResultsList.show(false, true);
		}else{
			this.abCbSamplesResultsList.refresh(resultRestr);
		}
		
		// refresh sample results
		//this.abCbSamplesResultsList.refresh(resultRestr);
		
		// refresh sample result edit form
		//this.abCbSampleResultEdit.refresh(resultRestr, true);

		// show information label
		var informationHTML = "";
		if(this.activityLogInfo_SamplesField){
			for (prop in this.activityLogInfo_SamplesField){
				if (prop != "reset"){
					informationHTML += this.activityLogInfo_SamplesField[prop].label + ": " + this.activityLogInfo_SamplesField[prop].value +"; ";
				}
			}
			this.abCbSampleEdit.setInstructions(informationHTML);
		}
	},
	
	abCbSampleEdit_afterSave: function(newRecord){
		var controller = this;
		setTimeout(function(){
			
			//for Save button, not for Save and Add New button
			if(valueExistsNotEmpty(controller.abCbSampleEdit.getFieldValue('cb_samples.sample_id')) && !newRecord){
				controller.sampleId = controller.abCbSampleEdit.getFieldValue('cb_samples.sample_id');
			}
			
			controller.isNewRecord = newRecord;
			controller.afterInitialDataFetch();
			
			if(View.parameters.callback){View.parameters.callback.call();}
		},3000);
	},
	/**
	 * Sample form copy with lab results as new handler.
	 */
	abCbSampleEdit_onCopyWithResults: function(){
		this.abCbSampleEdit.clearValidationResult();
		try{
			var result = Workflow.callMethod('AbRiskCleanBuilding-CleanBuildingService-copySampleAndLabResults', 
					this.abCbSampleEdit.getFieldValue('cb_samples.sample_id'));
			this.sampleId = result.message;
		}catch(e){
			Workflow.handleError(e);
    		return false;
		}
		
		//refresh forms and grid
		var restrictionForm =  new Ab.view.Restriction();
		restrictionForm.addClause('cb_samples.activity_log_id', this.activityLogId,'=');
		restrictionForm.addClause('cb_samples.sample_id', this.sampleId,'=');
		this.abCbSampleEdit.refresh(restrictionForm);
		
		var restrictionGrid =  new Ab.view.Restriction({'cb_sample_result.sample_id': this.sampleId});
		this.abCbSamplesResultsList.refresh(restrictionGrid);
		
		this.abCbSampleResultEdit.show(false, true);
		
		//refresh callback grids
		if(View.parameters.callback){
			View.parameters.callback.call();
		}
		
		//show message to inform about copy and save
		this.abCbSampleEdit.displayTemporaryMessage(getMessage("msg_save_sample_and_lab_results"), 4000);
	},
	/**
	 * Sample form copy as new handler.
	 */
	abCbSampleEdit_onCopyAsNew: function(){
		var restriction =  new Ab.view.Restriction({'cb_samples.activity_log_id': this.activityLogId});
		this.copyAsNewRecord(this.abCbSampleEdit, restriction);
		this.abCbSamplesResultsList.show(false, true);
		this.abCbSampleResultEdit.show(false, true);
	},
	
	/**
	 * Copy as new event handler
	 */
	abCbSampleResultEdit_onCopyAsNew: function(){
		var sampleId = this.abCbSampleEdit.getFieldValue('cb_samples.sample_id');
		var restriction = new Ab.view.Restriction({'cb_sample_result.sample_id' : sampleId});
		this.copyAsNewRecord(this.abCbSampleResultEdit, restriction);
	},
	
	/**
	 * Copy as new record common handler
	 */
	copyAsNewRecord: function(form, restriction){
		if(form.newRecord){
			View.showMessage(getMessage('err_copy_as_new'));
			return false;
		}
		var record = form.getRecord();
		form.refresh(restriction, true);
		
		form.fields.each(function(field){
			var fieldName = field.fieldDef.fullName;
			if(!field.fieldDef.primaryKey){
				var fieldValue = record.getValue(fieldName);
				if(field.fieldDef.isDate){
					fieldValue = record.getLocalizedValue(fieldName);
				}
				field.panel.setFieldValue(fieldName, fieldValue);
			}
		});
	}
});


function validateForm(){
	var form = View.panels.get("abCbSampleEdit");
	//check dates
	if(!compareDates(form, 'cb_samples.date_collected', 'cb_samples.date_received', 'msg_field_smaller_or_equal_than', "<=")){
		return false;
	}
	if(!compareDates(form, 'cb_samples.date_received', 'cb_samples.date_analysis', 'msg_field_smaller_or_equal_than', "<=")){
		return false;
	}
	if(!compareDates(form, 'cb_samples.date_collected', 'cb_samples.date_analysis', 'msg_field_smaller_or_equal_than', "<=")){
		return false;
	}
	return true;
}

function afterSelectSampleCompId(fieldName, selectedValue, previousValue){
	return afterSelectSampleCompIdCommon('abCbSampleResultEdit',fieldName, selectedValue, previousValue);
}
