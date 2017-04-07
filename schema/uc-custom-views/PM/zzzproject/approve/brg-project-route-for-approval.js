var projectRouteForApprovalController = View.createController('projectRouteForApproval', {
    
    quest : null,
    
    projectRouteForApprovalProjectReport_afterRefresh : function() {			
		var project_type = this.projectRouteForApprovalProjectReport.getFieldValue('project.project_type');
		var q_id = 'Project - ' + project_type;
		this.quest = new Ab.questionnaire.Quest(q_id, 'projectRouteForApprovalProjectReport');
    },

	projectRouteForApprovalMgrsForm_onRouteForApproval : function() {
    	this.projectRouteForApprovalMgrsForm.save();

		var project_id = this.projectRouteForApprovalMgrsForm.getFieldValue('project.project_id');
		var apprv_mgr1 = this.projectRouteForApprovalMgrsForm.getFieldValue('project.apprv_mgr1');
		var apprv_mgr2 = this.projectRouteForApprovalMgrsForm.getFieldValue('project.apprv_mgr2');
		var apprv_mgr3 = this.projectRouteForApprovalMgrsForm.getFieldValue('project.apprv_mgr3');
		
		var managerListedMultipleTimes = false;
		var fieldName = '';
		if (apprv_mgr1 && apprv_mgr1 == apprv_mgr2)
		{
			managerListedMultipleTimes = true;
			fieldName = 'project.apprv_mgr2';
		}
		else if (apprv_mgr1 && apprv_mgr1 == apprv_mgr3)
		{
			managerListedMultipleTimes = true;
			fieldName = 'project.apprv_mgr3';
		}
		else if (apprv_mgr2 && apprv_mgr2 == apprv_mgr3)
		{
			managerListedMultipleTimes = true;
			fieldName = 'project.apprv_mgr3';
		}
		if (managerListedMultipleTimes)
		{
			this.projectRouteForApprovalMgrsForm.refresh();
			var fieldError = getMessage('managerListedMultipleTimes');
			this.projectRouteForApprovalMgrsForm.addInvalidField(fieldName, fieldError);
			this.projectRouteForApprovalMgrsForm.displayValidationResult();
			return;
		}
		
		var parameters = {'project_id':project_id,'apprv_mgr1':apprv_mgr1,'apprv_mgr2':apprv_mgr2,'apprv_mgr3':apprv_mgr3};
		var result = Workflow.runRuleAndReturnResult('AbCapitalBudgeting-routeProjectForApproval',parameters);
		if (result.code == 'executed') {
			this.selectProjectReport.refresh(null);
			this.projectRouteForApprovalMgrsForm.refresh();
			this.projectRouteForApprovalProjectReport.refresh();
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
	projectIdSelval("project.status IN ('Requested','Requested-Estimated')");
}