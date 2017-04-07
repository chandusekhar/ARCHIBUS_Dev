var projectRouteForApprovalDialogController = View.createController('projectRouteForApprovalDialog', {
	//callback function
	onRouteForApproval: null,

	projectRouteForApprovalDialogMgrsForm_onRouteForApproval : function() {
    	if (!this.projectRouteForApprovalDialogMgrsForm.save()) return;

		var project_id = this.projectRouteForApprovalDialogMgrsForm.getFieldValue('project.project_id');
		var apprv_mgr1 = this.projectRouteForApprovalDialogMgrsForm.getFieldValue('project.apprv_mgr1');
		var apprv_mgr2 = this.projectRouteForApprovalDialogMgrsForm.getFieldValue('project.apprv_mgr2');
		var apprv_mgr3 = this.projectRouteForApprovalDialogMgrsForm.getFieldValue('project.apprv_mgr3');
		
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
			this.projectRouteForApprovalDialogMgrsForm.refresh();
			var fieldError = getMessage('managerListedMultipleTimes');
			this.projectRouteForApprovalDialogMgrsForm.addInvalidField(fieldName, fieldError);
			this.projectRouteForApprovalDialogMgrsForm.displayValidationResult('');
			return;
		}
		
		var parameters = {'project_id':project_id,'apprv_mgr1':apprv_mgr1,'apprv_mgr2':apprv_mgr2,'apprv_mgr3':apprv_mgr3};
		var result = Workflow.callMethodWithParameters('AbCapitalBudgeting-CapitalProjectsService-routeProjectForApproval',parameters);
		if (result.code == 'executed') {
			 if (this.onRouteForApproval) {
		            this.onRouteForApproval(this);
		        }
			View.closeThisDialog();
	  	} 
	  	else 
	  	{
	    	View.showMessage('error', result.code + " :: " + result.message);
	  	}
	}
});