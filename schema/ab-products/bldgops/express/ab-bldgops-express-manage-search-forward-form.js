var helpdeskSearchDetailsController = View.createController('forwardRequestForm', {
	
	forwardPanel_onSaveForward: function(){	
		var activityLogId = this.forwardPanel.getFieldValue("activity_log.activity_log_id");
		var supervisor = this.forwardPanel.getFieldValue("activity_log.supervisor");
		var workTeamId = this.forwardPanel.getFieldValue("activity_log.work_team_id");
		var result;
     	try {	 
     		 result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-updateRequest', activityLogId,'0','0','0',supervisor,'0',workTeamId,{});
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
