var projMngDashProfEditController = View.createController('projMngDashProfEdit', {
    
    quest : null,
    accessLevel : 'executive',
    
    callbackMethod: null,
    
    afterInitialDataFetch: function() {
    	if(valueExists(View.getOpenerView().getOpenerView().controllers.get('projMng'))){
        	this.accessLevel = View.getOpenerView().getOpenerView().controllers.get('projMng').accessLevel;
    	}
    	
    	if(valueExists(this.view.parameters) 
    			&& valueExists(this.view.parameters.callback)){
    		this.callbackMethod = this.view.parameters.callback;
    	}
    	
    	if (this.accessLevel == 'manager' || this.accessLevel == 'fcpm') {
    		this.projMngDashProfEdit_form.enableField('project.proj_mgr', false);
    		this.projMngDashProfEdit_form.enableField('project.bl_id', false);
    		this.projMngDashProfEdit_form.enableField('project.site_id', false);
    		this.projMngDashProfEdit_form.enableField('project.dv_id', false);
    		this.projMngDashProfEdit_form.enableField('project.dp_id', false);
    		this.projMngDashProfEdit_form.enableField('project.cost_budget', false);
    		this.projMngDashProfEdit_form.enableField('project.ac_id', false);
    		this.projMngDashProfEdit_form.enableField('project.project_name', false);
    	}
    },
    
    projMngDashProfEdit_form_afterRefresh : function() {			
		var project_type = this.projMngDashProfEdit_form.getFieldValue('project.project_type');
		var q_id = 'Project - ' + project_type;
		this.quest = new Ab.questionnaire.Quest(q_id, 'projMngDashProfEdit_form');
		
		for (var i = 0; i < 6; i++) {
			this.projMngDashProfEdit_form.getFieldElement('project.status').options[i].setAttribute("disabled", "true");
		}
		var status = this.projMngDashProfEdit_form.getFieldValue('project.status');
		if (status == 'Approved' || status == 'Approved-In Design' || status == 'Approved-Cancelled' || status == 'Issued-In Process' || 
				status == 'Issued-On Hold' || status == 'Issued-Stopped' || status == 'Completed-Pending' || status == 'Completed-Not Ver' ||
				status == 'Completed-Verified' || status == 'Closed') {
			this.projMngDashProfEdit_form.enableField('project.status', true);
		}
		else this.projMngDashProfEdit_form.enableField('project.status', false);
    },
    
    projMngDashProfEdit_form_beforeSave : function() {
    	if (!this.quest.beforeSaveQuestionnaire()) return false; 
    	this.projMngDashProfEdit_form.clearValidationResult();
    	return this.validateDateFields();
    },
    
    validateDateFields : function() {
    	var date_start = getDateObject(this.projMngDashProfEdit_form.getFieldValue('project.date_start'));//note that getFieldValue returns date in ISO format
    	var date_end = getDateObject(this.projMngDashProfEdit_form.getFieldValue('project.date_end'));
    	if (date_end < date_start) {
    		this.projMngDashProfEdit_form.addInvalidField('project.date_end', getMessage('endBeforeStart'));
    		this.projMngDashProfEdit_form.displayValidationResult('');
    		return false;
    	}
    	var date_commence_work = getDateObject(this.projMngDashProfEdit_form.getFieldValue('project.date_commence_work'));//note that getFieldValue returns date in ISO format
    	var date_target_end = getDateObject(this.projMngDashProfEdit_form.getFieldValue('project.date_target_end'));
    	if (date_target_end < date_commence_work) {
    		this.projMngDashProfEdit_form.addInvalidField('project.date_target_end', getMessage('endBeforeStart'));
    		this.projMngDashProfEdit_form.displayValidationResult('');
    		return false;
    	}
    	return true;    	
    },
    
    projMngDashProfEdit_form_onRequest: function(){
    	if (this.projMngDashProfEdit_form.canSave()) {
    		try{
        		this.projMngDashProfEdit_form.setFieldValue('project.status', 'Requested');
        		this.projMngDashProfEdit_form.save();
        		if (valueExistsNotEmpty(this.callbackMethod)) {
        			this.callbackMethod();
        		} else if (valueExists(View.getOpenerView().dialogOpenerPanel)){
        			View.getOpenerView().dialogOpenerPanel.refresh(View.getOpenerView().dialogOpenerPanel.restriction);
        		}
        		View.closeThisDialog();
    		} catch(e) {
    			Workflow.handleError(e);
    			return false;
    		}
    	}
    	
    }
});

function getDateObject(ISODate)
{
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0],tempArray[1]-1,tempArray[2]);
}

function onCallback(){
	var controller = View.controllers.get('projMngDashProfEdit');
	if(valueExistsNotEmpty(controller.callbackMethod)){
		controller.callbackMethod();
	}
}
