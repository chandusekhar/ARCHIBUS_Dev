var abCbAssessActionItemsCtrl = View.createController('abCbAssessActionItemsCtrl', {
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
	
	assessmentRow: null,

	afterInitialDataFetch: function(){
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
			this.assessmentRow = parentCtrl.assessmentRow;
			this.abCbAssessActionItemsList.setInstructions(informationHTML);
			
			// refresh panels
			var restriction = new Ab.view.Restriction();
			restriction.addClause('activity_log.activity_type', 'HAZMAT -%', 'LIKE');
			restriction.addClause('activity_log.assessment_id', this.activityLogId, '=');
			// add task restriction here as parameter
			var taskNodeRestr = "";
			if(this.taskMode == "assessor" || this.taskMode == "worker"){
				taskNodeRestr += "( activity_log.assessed_by = ${sql.literal(user.name)}  OR activity_log.assigned_to IN (SELECT person_id FROM cb_accredit_person WHERE cb_accredit_person.em_id = ${sql.literal(user.employee.id)}) ";
				taskNodeRestr += "OR activity_log.hcm_abate_by IN (SELECT person_id FROM cb_accredit_person WHERE cb_accredit_person.em_id = ${sql.literal(user.employee.id)})) ";
			}
			
			this.abCbAssessActionItemsList.addParameter("taskModeRest", taskNodeRestr);
			
			this.abCbAssessActionItemsList.refresh(restriction);
			this.abCbAssessActionItemForm.show(false, true);
			
			// set task mode layout
			this.setTaskModeLayout(this.taskMode);
			
		}
	},
	/**
	 * Set taskMode layout
	 */
	setTaskModeLayout: function(taskMode){
		switch(taskMode){
			case "assessor":
				{
					// field assessor
					this.abCbAssessActionItemForm.enableField("activity_log.assigned_to", false);
					this.abCbAssessActionItemForm.enableField("activity_log.assessed_by", false);
					this.abCbAssessActionItemForm.enableField("activity_log.hcm_abate_by", false);
					this.abCbAssessActionItemForm.enableField("activity_log.date_closed", false);
					break;
				}
			case "worker":
				{
					// abatement worker
					this.abCbAssessActionItemForm.enableField("activity_log.assigned_to", false);
					this.abCbAssessActionItemForm.enableField("activity_log.assessed_by", false);
					this.abCbAssessActionItemForm.enableField("activity_log.hcm_abate_by", false);
					this.abCbAssessActionItemForm.enableField("activity_log.date_closed", false);
					this.abCbAssessActionItemForm.enableField("activity_log.date_verified", false);
					break;
				}
			default:
			{
				// hazard manager
			}
		}
	},
	
	abCbAssessActionItemsList_onNew: function(){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.assessment_id', this.activityLogId, '=');
		restriction.addClause('activity_log.project_id', this.projectId, '=');
		this.abCbAssessActionItemForm.refresh(restriction, true);
		if (valueExists(this.assessmentRow)){
			this.abCbAssessActionItemForm.setFieldValue( "activity_log.site_id", this.assessmentRow['activity_log.site_id']);
			this.abCbAssessActionItemForm.setFieldValue( "activity_log.bl_id", this.assessmentRow['activity_log.bl_id']);
			this.abCbAssessActionItemForm.setFieldValue( "activity_log.fl_id", this.assessmentRow['activity_log.fl_id']);
			this.abCbAssessActionItemForm.setFieldValue( "activity_log.rm_id", this.assessmentRow['activity_log.rm_id']);
			this.abCbAssessActionItemForm.setFieldValue( "activity_log.assessed_by", this.assessmentRow['activity_log.assessed_by']);
			this.abCbAssessActionItemForm.setFieldValue( "activity_log.assigned_to", this.assessmentRow['activity_log.assigned_to']);
			this.abCbAssessActionItemForm.setFieldValue( "activity_log.hcm_abate_by", this.assessmentRow['activity_log.hcm_abate_by']);
			this.abCbAssessActionItemForm.setFieldValue( "activity_log.repair_type", this.assessmentRow['activity_log.repair_type']);
			this.abCbAssessActionItemForm.setFieldValue( "activity_log.cause_type", this.assessmentRow['activity_log.cause_type']);
		}
		this.abCbAssessActionItemTabs.enableTab('abCbActionItemsTab_2', false);
		onCheckSpecificTime();
	},
	
	abCbAssessActionItemForm_afterRefresh: function(){
		var priority = this.abCbAssessActionItemForm.getFieldValue("activity_log.priority");
		var radioButtons = document.getElementsByName("priorities");
		for (var i=0; i<radioButtons.length;i++){
			radioButtons[i].checked = (radioButtons[i].value == priority);
		}
		// set task mode layout
		this.setTaskModeLayout(this.taskMode);
	},
	
	abCbAssessActionItemForm_onCopyAsNew: function(){
		var site_id = this.abCbAssessActionItemForm.getFieldValue("activity_log.site_id");
		var bl_id = this.abCbAssessActionItemForm.getFieldValue("activity_log.bl_id");
		if(!validateSiteAndBldg(site_id, bl_id)){
			return false;
		}
		
		this.abCbAssessActionItemTabs.enableTab('abCbActionItemsTab_2', false);
		this.abCbAssessActionItemTabs.enableTab('abCbActionItemsTab_3', false);
		
		var record = this.abCbAssessActionItemForm.getRecord();
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.assessment_id', this.activityLogId, '=');
		restriction.addClause('activity_log.project_id', this.projectId, '=');
		this.abCbAssessActionItemForm.refresh(restriction, true);
		
		this.abCbAssessActionItemForm.fields.each(function(field){
			var fieldName = field.fieldDef.fullName;
			var fieldDef = field.fieldDef;
			if(!fieldDef.primaryKey && !fieldDef.isDocument ){
				var fieldValue = record.getValue(fieldName);
				if(fieldDef.isDate || fieldDef.isTime){
					fieldValue = record.getLocalizedValue(fieldName);
				}
				field.panel.setFieldValue(fieldName, fieldValue);
			}
		});
		onCheckSpecificTime();
		
	},
	/**
	 * Save location event handler
	 */
	abCbAssessActionItemLocation_onSave: function(){
		if(this.abCbAssessActionItemLocation.save()){
			this.abCbAssessActionItemLocationList.refresh(this.abCbAssessActionItemLocationList.restriction);
		}
	}, 
	/**
	 * Add new location handler
	 */
	abCbAssessActionItemLocationList_onNew: function(){
		var blId = this.abCbAssessActionItemForm.getFieldValue("activity_log.bl_id");
		var flId = this.abCbAssessActionItemForm.getFieldValue("activity_log.fl_id");
		var activityLogId = this.abCbAssessActionItemForm.getFieldValue("activity_log.activity_log_id");
		var restriction = new Ab.view.Restriction();
		restriction.addClause("cb_hcm_places.activity_log_id", activityLogId, "=");
		if(valueExistsNotEmpty(blId)){
			restriction.addClause("cb_hcm_places.bl_id", blId, "=");
		}
		if(valueExistsNotEmpty(flId)){
			restriction.addClause("cb_hcm_places.fl_id", flId, "=");
		}
		this.abCbAssessActionItemLocation.refresh(restriction, true);
	},
	
	
	abCbAssessActionItemsList_onDoc: function(){
		var activity_log = this.abCbAssessActionItemsList.restriction.clauses[1].value;
		var restriction = {'abCbActionItemsPgRptAssess_ds': " activity_log.activity_log_id = " + activity_log};
		var printableRestriction = [];
		printableRestriction.push({'title': getMessage('itemId'), 'value': activity_log});
		var parameters = {
				'printRestriction':true,
				'printableRestriction': printableRestriction
		}
		View.openPaginatedReportDialog('ab-cb-assess-action-items-pgrpt.axvw', restriction, parameters);
	}
})
/**
 * Validate custom field restrictions.
 */
function validateForm(ctx){
	var form = ctx.command.getParentPanel();
	form.clearValidationResult();
	if(form){
		var site_id = form.getFieldValue("activity_log.site_id");
		var bl_id = form.getFieldValue("activity_log.bl_id");
		if(!validateSiteAndBldg(site_id, bl_id)){
			return false;
		}
		// check dated
		// date_requested <= date_completed <= date_verified <= date_closed
		if(!compareDates(form, 'activity_log.date_requested', 'activity_log.date_completed', 'msg_field_smaller_or_equal_than', "<=")){
			return false;
		}
		if(!compareDates(form, 'activity_log.date_completed', 'activity_log.date_verified', 'msg_field_smaller_or_equal_than', "<=")){
			return false;
		}
		if(!compareDates(form, 'activity_log.date_verified', 'activity_log.date_closed', 'msg_field_smaller_or_equal_than', "<=")){
			return false;
		}
		
		if(!compareDates(form, 'activity_log.date_requested', 'activity_log.date_verified', 'msg_field_smaller_or_equal_than', "<=")){
			return false;
		}
		if(!compareDates(form, 'activity_log.date_completed', 'activity_log.date_closed', 'msg_field_smaller_or_equal_than', "<=")){
			return false;
		}
		if(!compareDates(form, 'activity_log.date_requested', 'activity_log.date_closed', 'msg_field_smaller_or_equal_than', "<=")){
			return false;
		}
		
	}
}

function onCheckSpecificTime(){
	var radioButtons = document.getElementsByName("priorities");
	var panel = View.panels.get("abCbAssessActionItemForm");
	if(document.getElementById("specificTime").checked){
		for (var i=0; i<radioButtons.length;i++){
			radioButtons[i].disabled = true;
		}
		panel.enableField("activity_log.date_required",true) ;
		panel.enableField("activity_log.time_required",true) ;
	} else {
		for (var i=0; i<radioButtons.length;i++){
			radioButtons[i].disabled = false;
		}
		panel.enableField("activity_log.date_required",false) ;
		panel.enableField("activity_log.time_required",false) ;
	}
}

function onChangePriority(radioButton){
	var panel = View.panels.get("abCbAssessActionItemForm");
	panel.setFieldValue("activity_log.priority", radioButton.value);
}