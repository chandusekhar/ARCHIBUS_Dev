var abCbAssesssSamplesHideForWorker = (View.taskInfo.taskId == 'Manage My Hazard Abatement Items') ? true : false;
var abCbAssessSampleCtrl = View.createController('abCbAssessSampleCtrl', {
	//page task mode - from where is called
	taskMode: null,
	// selected project id
	projectId: null,
	
	// project prob_type
	projProbType: null,
	
	// main controller
	mainControllerId: null,
	
	// selected assessment item
	activityLogId: -100,
	
	afterInitialDataFetch: function(){
		this.view.log('SAMPLE intial data fetch : start');
		// get initial data
		if(valueExists(this.view.parentTab)){
			if (valueExists(this.view.parentTab.taskMode)){
				this.taskMode = this.view.parentTab.taskMode;
			}
			if (valueExists(this.view.parentTab.mainControllerId)){
				this.mainControllerId = this.view.parentTab.mainControllerId;
			}
		}
		if(valueExists(this.mainControllerId)){
			this.view.log('SAMPLE intial data fetch - REFRESH: start');
			// do some initializations here
			var parentCtrl  = View.getView('parent').controllers.get(this.mainControllerId);
			this.projectId = parentCtrl.projectId;
			this.projProbType = parentCtrl.projProbType;
			this.activityLogId = parentCtrl.activityLogId;
			// show information label
			var informationHTML = "";
			for (prop in parentCtrl.activityLogInfo){
				if (prop != "reset"){
					informationHTML += parentCtrl.activityLogInfo[prop].label + ": " + parentCtrl.activityLogInfo[prop].value +"; ";
				}
			}
			this.abCbAssessSamplesList.setInstructions(informationHTML);
			
			if(this.taskMode == "worker"){
				//for Abatement Worker edit button is details button
				this.abCbAssessSamplesList.afterCreateCellContent = this.abCbAssessSamplesList_afterCreateCellContent;	
			}
			
			// refresh panels
			var restriction = new Ab.view.Restriction();
			restriction.addClause('cb_samples.activity_log_id', this.activityLogId, '=');
			
			this.abCbAssessSamplesList.refresh(restriction);
						
			this.abCbAssessSampleForm.show(false, true);
			this.abCbAssessSamplesResultList.show(false, true);
			this.abCbAssessSamplesResultForm.show(false, true);
			this.view.log('SAMPLE intial data fetch - REFRESH: end');
		}
		this.view.log('SAMPLE intial data fetch : end');
	},
	
	/**
	 * Add new sample event handler
	 */
	abCbAssessSamplesList_onNew: function(){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('cb_samples.activity_log_id', this.activityLogId, '=');

		this.abCbAssessSampleForm.refresh(restriction, true);
		this.abCbAssessSamplesResultList.show(false, true);
		this.abCbAssessSamplesResultForm.show(false, true);
	},
	
	abCbAssessSampleForm_afterRefresh: function(){
		if(this.abCbAssessSampleForm.newRecord){
			this.abCbAssessSampleForm.setFieldValue('cb_samples.activity_log_id', this.activityLogId);
		}
	},
	
	abCbAssessSamplesResultForm_afterRefresh: function(){
		if(this.abCbAssessSamplesResultForm.newRecord){
			var sampleId = this.abCbAssessSampleForm.getFieldValue('cb_samples.sample_id');
			this.abCbAssessSamplesResultForm.setFieldValue('cb_sample_result.sample_id', sampleId);
		}
	},
    abCbAssessSampleForm_onCopyToOther: function(){
        var restriction = {};
        restriction['activity_log.project_id'] = this.abCbAssessSampleForm.record.values['activity_log.project_id'];
        View.openDialog('uc-cb-samples-select-assessments.axvw', restriction, false, {
            width: 680,
            height: 300
        });
    },
	
	/**
	 * Sample form copy with lab results as new handler.
	 */
	abCbAssessSampleForm_onCopyWithResults: function(){
		this.abCbAssessSampleForm.clearValidationResult();
		try{
			var result = Workflow.callMethod('AbRiskCleanBuilding-CleanBuildingService-copySampleAndLabResults', 
					this.abCbAssessSampleForm.getFieldValue('cb_samples.sample_id'));
			this.sampleId = result.message;
		}catch(e){
			Workflow.handleError(e);
    		return false;
		}
		
		//refresh forms and grid
		var restrictionMaterials = new Ab.view.Restriction();
		restrictionMaterials.addClause('cb_samples.activity_log_id', this.activityLogId,'=');
		this.abCbAssessSamplesList.refresh(restrictionMaterials);
		
		var restrictionForm =  new Ab.view.Restriction();
		restrictionForm.addClause('cb_samples.activity_log_id', this.activityLogId,'=');
		restrictionForm.addClause('cb_samples.sample_id', this.sampleId,'=');
		this.abCbAssessSampleForm.refresh(restrictionForm);
		
		var restrictionGrid =  new Ab.view.Restriction({'cb_sample_result.sample_id': this.sampleId});
		this.abCbAssessSamplesResultList.refresh(restrictionGrid);
		
		this.abCbAssessSamplesResultForm.show(false, true);
		
		//show message to inform about copy and save
		this.abCbAssessSampleForm.displayTemporaryMessage(getMessage("msg_save_sample_and_lab_results"), 4000);
	},
	
	/*
	 * Sample form copy as new handler.
	 */
	abCbAssessSampleForm_onCopyAsNew: function(){
		var restriction =  new Ab.view.Restriction({'cb_samples.activity_log_id': this.activityLogId});
		this.copyAsNewRecord(this.abCbAssessSampleForm, restriction);
		this.abCbAssessSamplesResultList.show(false, true);
		this.abCbAssessSamplesResultForm.show(false, true);
	},
	
	abCbAssessSamplesResultForm_onCopyAsNew: function(){
		var sampleId = this.abCbAssessSampleForm.getFieldValue('cb_samples.sample_id');
		var restriction = new Ab.view.Restriction({'cb_sample_result.sample_id' : sampleId});
		this.copyAsNewRecord(this.abCbAssessSamplesResultForm, restriction);
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
	},
	
	abCbAssessSamplesList_afterCreateCellContent: function(row, column, cellElement){
		 if(column.id == "edit"){
			 cellElement.firstChild.value = getMessage("detailsTitle");
		 }
	 },
	
	refreshMainList: function(){
		var parentCtrl  = View.getView('parent').controllers.get(this.mainControllerId);
		if (parentCtrl) {
			var assessItemsTab = parentCtrl.abCbAssessItemsTabs.findTab('abCbAssessItemsTab_1');
			var sampleList = assessItemsTab.getContentFrame().View.panels.get('abCbAssessAssessmentsSamples');
			if(sampleList && sampleList.visible){
				sampleList.refresh(sampleList.restriction);
			}
		}
	}
})

function refreshMainList(){
	var controller = View.controllers.get("abCbAssessSampleCtrl");
	controller.refreshMainList();
	return true;
}

function validateForm(){
	var form = View.panels.get("abCbAssessSampleForm");
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
	return afterSelectSampleCompIdCommon('abCbAssessSamplesResultForm',fieldName, selectedValue, previousValue);
}
