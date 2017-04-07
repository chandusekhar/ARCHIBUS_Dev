var projEstimateActionsCostsDesignMcController = View.createController('projEstimateActionsCostsDesignMc', {
	project_id : '',
	
	projEstimateActionsCostsDesignMcGrid_afterRefresh : function() {
		var controller = View.getOpenerView().controllers.get('projManageConsole');
		this.project_id = controller.project_id;
		if (this.project_id)  {
			this.projEstimateActionsCostsDesignMcGrid.appendTitle(this.project_id);
			var parameters = 
			{
				'project_id': this.project_id
			};
			var result = Workflow.callMethodWithParameters('AbCapitalBudgeting-CapitalProjectsService-rollUpActionCostsToProjects',parameters);
	
			if (result.code == 'executed') {
				var restriction = new Ab.view.Restriction();
				restriction.addClause('project.project_id', this.project_id);
				this.projEstimateActionsCostsDesignMcReport.refresh(restriction);
				this.projEstimateActionsCostsDesignMcReport.show(true);
		    } else   
		    {
		    	alert(result.code + " :: " + result.message);
		  	}
		}
	}
});