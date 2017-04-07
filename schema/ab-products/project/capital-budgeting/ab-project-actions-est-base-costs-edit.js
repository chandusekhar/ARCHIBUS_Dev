var projectActionsEstBaseCostsController = View.createController('projectActionsEstBaseCosts', {
	project_id : '',
	
	afterInitialDataFetch : function () {
		this.projectActionsEstBaseCostsReport.show(false);
		this.projectActionsEstBaseCostsGrid.show(false);
		this.projectActionsEstBaseCostsForm.show(false);
	},
	
	selectProjectReport_onSelectProjectId : function(row) {
		this.project_id = row.record['project.project_id.key'];
		var restriction = new Ab.view.Restriction();
		restriction.addClause('project.project_id', this.project_id);
		this.projectActionsEstBaseCostsGrid.refresh(restriction);
		this.projectActionsEstBaseCostsGrid.show(true);
	},
	
	projectActionsEstBaseCostsGrid_afterRefresh : function() {
		if (this.project_id)  {
			this.projectActionsEstBaseCostsGrid.appendTitle(this.project_id);
			var parameters = 
			{
				'project_id': this.project_id
			};
			var result = Workflow.callMethodWithParameters('AbCapitalBudgeting-CapitalProjectsService-rollUpActionCostsToProjects',parameters);
	
			if (result.code == 'executed') {
				var restriction = new Ab.view.Restriction();
				restriction.addClause('project.project_id', this.project_id);
				this.projectActionsEstBaseCostsReport.refresh(restriction);
				this.projectActionsEstBaseCostsReport.show(true);
		    } else   
		    {
		    	alert(result.code + " :: " + result.message);
		  	}
		}
	}
});

/****************************************************************
 * Project Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval('');
}