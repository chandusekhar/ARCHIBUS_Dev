var helpdeskSearchDetailsController = View.createController('forwardRequestForm', {
	
	forwardPanel_onSaveForward: function(){	
		
		var record = ABHDC_getDataRecord2(this.forwardPanel); 
		
		var activityLogId = this.forwardPanel.getFieldValue("activity_log.activity_log_id");
		var status = this.forwardPanel.getFieldValue("activity_log.status");
		var assignedTo = this.forwardPanel.getFieldValue("activity_log.assigned_to");
		var vendorId = this.forwardPanel.getFieldValue("activity_log.vn_id");
		var supervisor = this.forwardPanel.getFieldValue("activity_log.supervisor");
		var dispatcher = this.forwardPanel.getFieldValue("activity_log.dispatcher");
		var workTeamId = this.forwardPanel.getFieldValue("activity_log.work_team_id");
		var result;
     	try {	 
     		 result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-updateRequest', activityLogId,status,assignedTo,vendorId,supervisor,dispatcher,workTeamId,record);
		 } catch (e) {
			Workflow.handleError(e);
 		}
		 
		if (result.code == 'executed') {
			//this.forwardPanel.save();
			View.getOpenerView().refresh();
        	View.closeThisDialog();			
   		} else {
       	 	Workflow.handleError(result);
    	}
	}

});

function onChangeVnId(fieldName, selectedValue, previousValue){
	var form = View.panels.get("forwardPanel");
	if(valueExists(fieldName) && valueExists(selectedValue)){
		form.setFieldValue(fieldName,selectedValue)	
	}	
	if(form.getFieldValue('activity_log.vn_id') != ''){
		form.setFieldValue('activity_log.assigned_to','');	
	}
}

function onChangeAssignedTo(fieldName, selectedValue, previousValue){
	var form = View.panels.get("forwardPanel");
	if(valueExists(fieldName) && valueExists(selectedValue)){
		form.setFieldValue(fieldName,selectedValue)	
	}
	if(form.getFieldValue('activity_log.assigned_to') != ''){
		form.setFieldValue('activity_log.vn_id','');	
	}
}

function onChangeSupervisor(fieldName, selectedValue, preiousValue){
	var form = View.panels.get("forwardPanel");
	if(valueExists(fieldName) && valueExists(selectedValue)){
		form.setFieldValue(fieldName,selectedValue)	
	}
	if(form.getFieldValue('activity_log.supervisor') != ''){
		form.setFieldValue('activity_log.work_team_id','');
	}
}

function onChangeWorkTeamId(fieldName, selectedValue, previousValue){
	var form = View.panels.get("forwardPanel");
	if(valueExists(fieldName) && valueExists(selectedValue)){
		form.setFieldValue(fieldName,selectedValue)	
	}
	if(form.getFieldValue('activity_log.work_team_id') != ''){
		form.setFieldValue('activity_log.supervisor','');	
	}
}
