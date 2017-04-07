var projectApproveFormController = View.createController('projectApproveForm', {
    
    quest : null,
    em_id : null,
    
    afterInitialDataFetch : function() {
		this.em_id = View.user.employee.id;
		if (this.em_id == "")
    	{
    	    // display error message
            View.showMessage('error', getMessage('noMatchingEmail'));
    	}
	},
    
    projectApproveFormDetails_afterRefresh : function() {
		var q_id = 'Project - '.toUpperCase() + this.projectApproveFormDetails.getFieldValue('project.project_type');
		this.quest = new Ab.questionnaire.Quest(q_id, 'projectApproveFormDetails', true);
    },
    
    projectApproveFormApprove_onApprove : function() {
    	if (!this.projectApproveFormApprove.save()) return;
    	var project_id = this.projectApproveFormApprove.getFieldValue('project.project_id');
    	var apprv_mgr1 = this.projectApproveFormApprove.getFieldValue('project.apprv_mgr1');
    	var apprv_mgr2 = this.projectApproveFormApprove.getFieldValue('project.apprv_mgr2');
    	var apprv_mgr3 = this.projectApproveFormApprove.getFieldValue('project.apprv_mgr3');
    	var parameters = {'project_id':project_id,'em_em_id':this.em_id,'apprv_mgr1':apprv_mgr1,'apprv_mgr2':apprv_mgr2,'apprv_mgr3':apprv_mgr3};
    	var result = Workflow.callMethodWithParameters('AbCapitalBudgeting-CapitalProjectsService-approveProject', parameters);
    	if (result.code == 'executed') {
    		this.projectApproveFormApprove.refresh();
    		this.projectApproveFormDetails.refresh();
      	} 
      	else 
      	{
        	View.showMessage(result.message);
      	}
    },
    
    projectApproveFormApprove_onReject : function() {
    	if (!this.projectApproveFormApprove.save()) return;
    	var project_id = this.projectApproveFormApprove.getFieldValue('project.project_id');
    	var apprv_mgr1 = this.projectApproveFormApprove.getFieldValue('project.apprv_mgr1');
    	var apprv_mgr2 = this.projectApproveFormApprove.getFieldValue('project.apprv_mgr2');
    	var apprv_mgr3 = this.projectApproveFormApprove.getFieldValue('project.apprv_mgr3');
    	var parameters = {'project_id':project_id,'em_em_id':this.em_id,'apprv_mgr1':apprv_mgr1,'apprv_mgr2':apprv_mgr2,'apprv_mgr3':apprv_mgr3};
    	var result = Workflow.callMethodWithParameters('AbCapitalBudgeting-CapitalProjectsService-rejectProject', parameters);
    	if (result.code == 'executed') {
    		this.projectApproveFormApprove.refresh();
    		this.projectApproveFormDetails.refresh();
      	} 
      	else 
      	{
        	View.showMessage(result.message);
      	}
    }
});