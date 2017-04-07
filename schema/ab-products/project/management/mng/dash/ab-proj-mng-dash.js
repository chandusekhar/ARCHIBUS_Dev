var projMngDashController = View.createController('projMngDash',{	
	project_id: null,

	refreshProjDash: function(record) {
		var projMngController = View.getOpenerView().controllers.get('projMng');
		var project_id = projMngController.project_id;
		if (record) {
			project_id = record.getValue('project.project_id');
			this.project_id = project_id;
			var project_name = record.getValue('project.project_name');
			projMngController.project_name = project_name;			
		}		
		this.projMngDashProf_form.setTitle(project_id);
		var restriction = new Ab.view.Restriction();
		restriction.addClause('project.project_id', project_id);
		this.projMngDashMile_grid.refresh(restriction);	
		this.projMngDashLogsFilter.refresh();
		this.projMngDashTeamFilter.refresh();
		this.projMngDashDocsGrid.refresh(restriction);
		var projRestriction = " project.project_id = '" + getValidRestVal(this.project_id) + "'";
		this.projMngDashAlert_msgs.addParameter('projRestriction', projRestriction);
		this.projMngDashAlert_msgs.refresh();
		this.projMngDashCps_cps.refresh(restriction);		
	}
});

