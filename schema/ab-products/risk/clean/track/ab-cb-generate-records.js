/**
 * Used to generate assessment, action and service request records for clean building app.
 * 
 */
// controller implementation
var abCbGenerateRecCtrl = View.createController('abCbGenerateRecCtrl', {
	/*
	 * Specify page mode: assessment , action or service request records.
	 * Valid values: "assessment", "action", "request" 
	 */
	pageMode: null,
	
	// selected project code
	projectId: null,
	
	// problem type of selected project
	probType: null,
	
	// callback function
	callbackMethod: null,
	
	afterViewLoad: function(){
		this.setLabels();
		// initialize page variables
		
		if (valueExists(this.view.parameters.pageMode)){
			this.pageMode = this.view.parameters.pageMode;
		} else {
			View.showMessage("Internal error : Page Mode not defined");
		}
		
		if (valueExists(this.view.parameters.projectId)){
			this.projectId = this.view.parameters.projectId;
		} else {
			View.showMessage("Internal error : Project Code not defined");
		}
		
		if (valueExists(this.view.parameters.probType)){
			this.probType = this.view.parameters.probType;
		} else {
			View.showMessage("Internal error : Problem Type not defined");
		}
		
		if (valueExists(this.view.parameters.callback)){
			this.callbackMethod = this.view.parameters.callback;
		} 
		
		if(this.pageMode == "action" || this.pageMode == "request"){
			// XXX: this code relies on undocumented DOM element ID and is not guaranteed to work in future versions of ARCHIBUS 
			var elem = document.getElementById("cb_hcm_loc_typ.hcm_loc_typ_id.required_star");
			if(elem){
				elem.style.display = 'none';
			}
		}
		
	},
	
	afterInitialDataFetch: function(){
		// set project id
		this.abCbGenerateRec.setFieldValue('project_id', this.projectId);
		this.abCbGenerateRec.setFieldValue('cb_hcm_loc_typ.prob_type', this.probType);
		initFormFromProject(this.projectId, this.abCbGenerateRec, "bl");
		
		// set min limit for Last Assessed (Months)
		this.abCbGenerateRec.setMinValue('last_assessed', 0);
		
		// set title
		var titleName = "title_" + this.pageMode;
		this.abCbGenerateRec.setTitle(getMessage(titleName));
		// show/ hide default values panel
		this.abCbGenerateRecDefaultsRequest.setFieldValue('activity_log.activity_type', "SERVICE DESK - MAINTENANCE");
		this.abCbGenerateRecDefaultsRequest.setFieldValue('activity_log.requestor', this.view.user.employee.id);
		this.abCbGenerateRecDefaultsRequest.setFieldValue('activity_log.phone_requestor', this.view.user.employee.phone)
		this.abCbGenerateRecDefaultsAssess.show( (this.pageMode == "assessment") , true);
		this.abCbGenerateRecDefaultsAction.show( (this.pageMode == "action") , true);
		this.abCbGenerateRecDefaultsRequest.show( (this.pageMode == "request") , true);
		onCheckSpecificTime();
	},
	
	
	// set some custom labels and styles
	setLabels: function(){
		$('radioGenerateFor_bl_label').innerHTML = getMessage('label_bl');
		$('radioGenerateFor_fl_label').innerHTML = getMessage('label_fl');
		$('radioGenerateFor_rm_label').innerHTML = getMessage('label_rm');
	},
	
	/*
	 * Generate records event handler.
	 */
	abCbGenerateRec_onGenerate: function(){
		if(!this.validateSettings()){
			return false;
		}
		
		if(!this.validateDefaults()){
			return false;
		}
		
		var projectId = this.projectId;
		var recFilter = this.getFilterRecord();
		var recDefaults;
		if (this.pageMode == "request") {
			recDefaults = this.abCbGenerateRecDefaultsRequest.getOutboundRecord();
		} else if (this.pageMode == "action"){
			recDefaults = this.abCbGenerateRecDefaultsAction.getOutboundRecord();
		} else {
			recDefaults = this.abCbGenerateRecDefaultsAssess.getOutboundRecord();
		}
		// we need one config parameter for WFR
		var locations = this.abCbGenerateRec.getFieldMultipleValues("cb_hcm_loc_typ.hcm_loc_typ_id");
		var levelValue = getRadioValue("radioGenerateFor");
		var config = {
			project: this.projectId,
			probType: this.probType,
			level: levelValue
		};

		// get records number
		var recordsNo = 0;
		try{
			var result = Workflow.callMethod('AbRiskCleanBuilding-CleanBuildingService-generateRecords', this.pageMode, config, locations, recFilter, recDefaults, true);
			recordsNo = result.value;
		} catch(e){
			Workflow.handleError(e);
			return false;
		}
		
		var confirmMessage = getMessage("msg_confirm_" + this.pageMode);
		var generateMessage = getMessage("msg_generate_" + this.pageMode);
		confirmMessage = confirmMessage.replace('{0}', recordsNo);

		var controller = this;
		View.confirm(confirmMessage, function(button) { 
		    if (button == 'yes') { 
		    	try{
		    		var jobId  = Workflow.startJob('AbRiskCleanBuilding-CleanBuildingService-generateRecords', controller.pageMode, config, locations, recFilter, recDefaults, false);
				    View.openJobProgressBar(generateMessage, jobId, '', function(status) {
				    	if(controller.callbackMethod){
				    		controller.callbackMethod.call();
				    	}
				    	controller.view.closeThisDialog();
				    });
		    	}catch(e){
		    		Workflow.handleError(e);
		    		return false;
		    	}
		    } 
		});
	},
	
	/*
	 * validate field settings
	 */
	validateSettings: function(){
		var objPanel = this.abCbGenerateRec;
		var objDs = objPanel.getDataSource();
		// clear validation result
		objPanel.clearValidationResult();
		
		// check Year Built From/To
		if(!compareDates(objPanel, 'date_bl_from', 'date_bl_to', 'msg_field_smaller_than', '<')){
			return false;
		}
		// check Year of Rehab From/To
		if(!compareDates(objPanel, 'date_rehab_from', 'date_rehab_to', 'msg_field_smaller_than', '<')){
			return false;
		}
		
		// check generate level
		var level = getRadioValue('radioGenerateFor');
		var blId = objPanel.getFieldValue('bl.bl_id');
		var flId = objPanel.getFieldValue('fl.fl_id');
		var rmId = objPanel.getFieldValue('rm.rm_id');
		if((level == "bl" && (valueExistsNotEmpty(rmId) || valueExistsNotEmpty(flId))) 
				||(level == "fl" && valueExistsNotEmpty(rmId))){
			View.showMessage(getMessage("msg_level_not_match"));
			return false;
		}
		
		// check mandatory fields
		// site code
		var siteId = objPanel.getFieldValue('bl.site_id');
		if(!valueExistsNotEmpty(siteId)){
			var fldSite = objPanel.fields.get('bl.site_id');
			//var displayedMessage = getMessage('msg_field_mandatory').replace('{0}', fldSite.fieldDef.title);
			objPanel.validationResult.valid = false;
			objPanel.validationResult.message = objPanel.getLocalizedString(Ab.form.Form.z_MESSAGE_INVALID_FIELD);
			objPanel.validationResult.invalidFields['bl.site_id'] = "";
			objPanel.displayValidationResult();
			//View.showMessage(displayedMessage);
			return false;
		}
		
		if(!validateSiteAndBldg(objPanel.getFieldValue('bl.site_id'), objPanel.getFieldValue('bl.bl_id'))){
			return false;
		}
		
		//location of material
		var hcmLocTypId = objPanel.getFieldValue('cb_hcm_loc_typ.hcm_loc_typ_id');
		if(!valueExistsNotEmpty(hcmLocTypId) && this.pageMode == "assessment"){
			var fldHcmLocTypId = objPanel.fields.get('cb_hcm_loc_typ.hcm_loc_typ_id');
			//var displayedMessage = getMessage('msg_field_mandatory').replace('{0}', fldHcmLocTypId.fieldDef.title);
			objPanel.validationResult.valid = false;
			objPanel.validationResult.message = objPanel.getLocalizedString(Ab.form.Form.z_MESSAGE_INVALID_FIELD);
			objPanel.validationResult.invalidFields['cb_hcm_loc_typ.hcm_loc_typ_id'] = "";
			objPanel.displayValidationResult();
			//View.showMessage(displayedMessage);
			return false;
		}
		
		return true;
	},
	
	/*
	 * get filter settings
	 * return object
	 */
	getFilterRecord: function(){
		var record = {};
		var readfields = {"bl.site_id": true, "bl.bl_id": true, "fl.fl_id": true, "rm.rm_id": true,
				"rm.rm_cat": true, "bl.construction_type": true, "rm.dv_id": true, "rm.rm_type": true,
				"bl.use1": true, "rm.dp_id": true, "last_assessed": true, "date_bl_from": true, "date_bl_to": true,
				"date_rehab_from": true, "date_rehab_to": true};
		var consolePanel = this.abCbGenerateRec;
		consolePanel.fields.eachKey(function (fieldName){
			if(readfields[fieldName]){
				var fieldValue = consolePanel.hasFieldMultipleValues(fieldName) ? consolePanel.getFieldMultipleValues(fieldName).join("','") : consolePanel.getFieldValue(fieldName);
				if ( valueExistsNotEmpty(fieldValue) ){
					record[fieldName] = fieldValue;
				}
			}
		});
		
		return record;
	},
	/**
	 * validate default values.
	 */
	validateDefaults: function(){
		if(this.pageMode == "action"){
			// we must check activity_type, is mandatory
			var objPanel = this.abCbGenerateRecDefaultsAction;
			// clear validation result
			objPanel.clearValidationResult();
			var activityType = objPanel.getFieldValue('activity_log.activity_type');
			if(!valueExistsNotEmpty(activityType)){
				objPanel.validationResult.valid = false;
				objPanel.validationResult.message = objPanel.getLocalizedString(Ab.form.Form.z_MESSAGE_INVALID_FIELD);
				objPanel.validationResult.invalidFields['activity_log.activity_type'] = "";
				objPanel.displayValidationResult();
				return false;
			}
			var actionTitle = objPanel.getFieldValue('activity_log.action_title');
			if(!valueExistsNotEmpty(actionTitle)){
				objPanel.validationResult.valid = false;
				objPanel.validationResult.message = objPanel.getLocalizedString(Ab.form.Form.z_MESSAGE_INVALID_FIELD);
				objPanel.validationResult.invalidFields['activity_log.action_title'] = "";
				objPanel.displayValidationResult();
				return false;
			}
		}
		if(this.pageMode == "request"){
			var objPanel = this.abCbGenerateRecDefaultsRequest;
			// clear validation result
			objPanel.clearValidationResult();
			//$('cboPriorityRec').parentNode.className = '';
			var probType = objPanel.getFieldValue('activity_log.prob_type');
			if(!valueExistsNotEmpty(probType)){
				objPanel.validationResult.valid = false;
				objPanel.validationResult.message = objPanel.getLocalizedString(Ab.form.Form.z_MESSAGE_INVALID_FIELD);
				objPanel.validationResult.invalidFields['activity_log.prob_type'] = "";
				objPanel.displayValidationResult();
				return false;
			}
			var requestor = objPanel.getFieldValue('activity_log.requestor');
			if(!valueExistsNotEmpty(requestor)){
				objPanel.validationResult.valid = false;
				objPanel.validationResult.message = objPanel.getLocalizedString(Ab.form.Form.z_MESSAGE_INVALID_FIELD);
				objPanel.validationResult.invalidFields['activity_log.requestor'] = "";
				objPanel.displayValidationResult();
				return false;
			}
			var description = objPanel.getFieldValue('activity_log.description');
			if(!valueExistsNotEmpty(description)){
				objPanel.validationResult.valid = false;
				objPanel.validationResult.message = objPanel.getLocalizedString(Ab.form.Form.z_MESSAGE_INVALID_FIELD);
				objPanel.validationResult.invalidFields['activity_log.description'] = "";
				objPanel.displayValidationResult();
				return false;
			}

			var chkSpecificTime = document.getElementById('specificTime');
			if(chkSpecificTime.checked){
				var dateRequired = objPanel.getFieldValue('activity_log.date_required');
				if(!valueExistsNotEmpty(dateRequired)){
					objPanel.validationResult.valid = false;
					objPanel.validationResult.message = objPanel.getLocalizedString(Ab.form.Form.z_MESSAGE_INVALID_FIELD);
					objPanel.validationResult.invalidFields['activity_log.date_required'] = "";
					objPanel.displayValidationResult();
					return false;
				}
			}/*else if (!chkSpecificTime.checked){
				var priority = $('cboPriorityRec').value;
				if(!valueExistsNotEmpty(priority)){
					objPanel.validationResult.valid = false;
					objPanel.validationResult.message = objPanel.getLocalizedString(Ab.form.Form.z_MESSAGE_INVALID_FIELD);
					//objPanel.validationResult.invalidFields['cboPriorityRec'] = "";
					$('cboPriorityRec').parentNode.className = 'formErrorInput';
					objPanel.displayValidationResult();
					return false;
				}
			}*/
		}
		return true;
	}
});

/**
 * Set priority to hidden field when selection is changed.
 * @param el
 * @param formId
 */
function onChangePriority(el, formId){
	var value = el.value;
	var form = View.panels.get(formId);
	form.setFieldValue("activity_log.priority", value);
}

/**
 * Click event for specific time checkbox.
 */
function onCheckSpecificTime(){
	var checkBox = document.getElementById("specificTime");
	var form = View.panels.get("abCbGenerateRecDefaultsRequest");
//	var objPriority = document.getElementById("cboPriorityRec");
	if(checkBox.checked){
		form.enableField("activity_log.date_required", true);
//		objPriority.disabled = true;
//		objPriority.value = "";
//		form.setFieldValue("activity_log.priority", "");
	}else{
		form.enableField("activity_log.date_required", false);
//		objPriority.disabled = false;
	}
	
}