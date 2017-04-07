var projEstimateActionsCostsDesignController = View.createController('projEstimateActionsCostsDesign', {
	project_id : '',
	
	afterInitialDataFetch : function () {
		this.projEstimateActionsCostsDesignReport.show(false);
		this.projEstimateActionsCostsDesignGrid.show(false);
		this.projEstimateActionsCostsDesignForm.show(false);
	},
	
	selectProjectReport_onSelectProjectId : function(row) {
		this.project_id = row.record['project.project_id.key'];
		var restriction = new Ab.view.Restriction();
		restriction.addClause('project.project_id', this.project_id);
		this.projEstimateActionsCostsDesignGrid.refresh(restriction);
		this.projEstimateActionsCostsDesignGrid.show(true);
	},
	
	projEstimateActionsCostsDesignGrid_afterRefresh : function() {
		if (this.project_id)  {
			this.projEstimateActionsCostsDesignGrid.appendTitle(this.project_id);
			var parameters = 
			{
				'project_id': this.project_id
			};
			var result = Workflow.callMethodWithParameters('AbCapitalBudgeting-CapitalProjectsService-rollUpActionCostsToProjects',parameters);
	
			if (result.code == 'executed') {
				var restriction = new Ab.view.Restriction();
				restriction.addClause('project.project_id', this.project_id);
				this.projEstimateActionsCostsDesignReport.refresh(restriction);
				this.projEstimateActionsCostsDesignReport.show(true);
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
	projectIdSelval('project.is_template = 0');
}