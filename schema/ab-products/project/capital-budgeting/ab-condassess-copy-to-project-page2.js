var condassessCopyToProjectPage2Controller = View.createController('condassessCopyToProjectPage2', {
	
	condassessCopyToProjectPage2Grid_onSelect : function(row, action) {
		var condassessCopyToProjectController = View.getOpenerView().controllers.get('condassessCopyToProject');
		var projectId = row.record['project.project_id.key'];
		var projectName = row.record['project.project_name'];
		condassessCopyToProjectController.projectIdName = projectId;
		if (projectName) condassessCopyToProjectController.projectIdName += "-" + projectName;
		
		var parameters = 
		{
			'project_id' : projectId,
			'copied_from' : condassessCopyToProjectController.condassessProject,
			'activity_log_ids' : condassessCopyToProjectController.strSelectedItems
		};
		var result = Workflow.callMethodWithParameters('AbCapitalBudgeting-CapitalProjectsService-copyActionsToProject',parameters);
		if (result.code == 'executed') {
			var restriction = new Ab.view.Restriction();
			restriction.addClause('project.project_id', projectId);
			var tabs = View.getOpenerView().panels.get('condassessCopyToProjectTabs');
			tabs.selectTab('condassessCopyToProjectPage3', restriction);	
	    } else   
	    {
	    	alert(result.code + " :: " + result.message);
	  	}
	}
});