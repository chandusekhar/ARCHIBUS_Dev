var projectsController = View.createController('projectsCtrl',{
	/**
	 * show paginated report
	 */
	afterViewLoad: function(){
		if(this.view.taskInfo.activityId == 'AbCapitalPlanningCA'){
			this.repProjects.addParameter('projectType', 'ASSESSMENT');
		}else if(this.view.taskInfo.activityId == 'AbRiskES'){
			this.repProjects.addParameter('projectType', 'ASSESSMENT - ENVIRONMENTAL');
		}
	},
	repProjects_onPaginatedReport: function(){
		var restriction = new Ab.view.Restriction();
		if(this.view.taskInfo.activityId == 'AbCapitalPlanningCA'){
			restriction.addClause('project.project_type', 'ASSESSMENT', '=');
		}else if(this.view.taskInfo.activityId == 'AbRiskES'){
			restriction.addClause('project.project_type', 'ASSESSMENT - ENVIRONMENTAL', '=');
		}
		
		View.openPaginatedReportDialog('ab-ca-prj-prnt.axvw', {'ds_Projects_data': restriction});
	}
});
