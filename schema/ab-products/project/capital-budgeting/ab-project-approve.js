var projectRouteForApprovalController = View.createController('projectRouteForApproval', {
    
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
    
    projectApproveProjectColumnReport_afterRefresh : function() {			
		var project_type = this.projectApproveProjectColumnReport.getFieldValue('project.project_type');
		var q_id = 'Project - '.toUpperCase() + project_type;
		this.quest = new Ab.questionnaire.Quest(q_id, 'projectApproveProjectColumnReport', true);
    },
    
    projectApproveMgrsForm_onApprove : function() {
    	var project_id = this.projectApproveMgrsForm.getFieldValue('project.project_id');
    	var message = String.format(getMessage('approveConfirm'), project_id);
    	if (!confirm(message)) return false;
    	this.projectApproveMgrsForm.save();
    	var apprv_mgr1 = this.projectApproveMgrsForm.getFieldValue('project.apprv_mgr1');
    	var apprv_mgr2 = this.projectApproveMgrsForm.getFieldValue('project.apprv_mgr2');
    	var apprv_mgr3 = this.projectApproveMgrsForm.getFieldValue('project.apprv_mgr3');
    	var parameters = {'project_id':project_id,'em_em_id':this.em_id,'apprv_mgr1':apprv_mgr1,'apprv_mgr2':apprv_mgr2,'apprv_mgr3':apprv_mgr3};
    	var result = Workflow.callMethodWithParameters('AbCapitalBudgeting-CapitalProjectsService-approveProject',parameters);
    	if (result.code == 'executed') {
    		this.selectProjectReport.refresh(null);
    		this.projectApproveMgrsForm.refresh();
    		this.projectApproveProjectColumnReport.refresh();
      	} 
      	else 
      	{
        	View.showMessage('error', result.code + " :: " + result.message);
      	}
    },
    
    projectApproveMgrsForm_onReject : function() {
    	var project_id = this.projectApproveMgrsForm.getFieldValue('project.project_id');
    	var message = String.format(getMessage('rejectConfirm'), project_id);
    	if (!confirm(message)) return false;
    	this.projectApproveMgrsForm.save();
    	var apprv_mgr1 = this.projectApproveMgrsForm.getFieldValue('project.apprv_mgr1');
    	var apprv_mgr2 = this.projectApproveMgrsForm.getFieldValue('project.apprv_mgr2');
    	var apprv_mgr3 = this.projectApproveMgrsForm.getFieldValue('project.apprv_mgr3');
    	var parameters = {'project_id':project_id,'em_em_id':this.em_id,'apprv_mgr1':apprv_mgr1,'apprv_mgr2':apprv_mgr2,'apprv_mgr3':apprv_mgr3};
    	var result = Workflow.callMethodWithParameters('AbCapitalBudgeting-CapitalProjectsService-rejectProject',parameters);
    	if (result.code == 'executed') {
    		this.selectProjectReport.refresh(null);
    		this.projectApproveMgrsForm.refresh();
    		this.projectApproveProjectColumnReport.refresh();
      	} 
      	else 
      	{
      		View.showMessage('error', result.code + " :: " + result.message);
      	}
    }
});

/****************************************************************
 * Project Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval("project.status LIKE '%Routed%'");
}