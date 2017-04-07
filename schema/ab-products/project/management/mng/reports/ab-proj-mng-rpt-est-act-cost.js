var projMngRptEstActCostController = View.createController('projMngRptEstActCost', {
	project_id : '',
	
	projMngRptEstActCostGrid_afterRefresh : function() {
		var controller = View.getOpenerView().getOpenerView().controllers.get('projMng');
		this.project_id = controller.project_id;
		if (this.project_id)  {
			this.projMngRptEstActCostGrid.appendTitle(this.project_id);
			var parameters = 
			{
				'project_id': this.project_id
			};
			var result = Workflow.callMethodWithParameters('AbCapitalBudgeting-CapitalProjectsService-rollUpActionCostsToProjects',parameters);
	
			if (result.code == 'executed') {
				var restriction = new Ab.view.Restriction();
				restriction.addClause('project.project_id', this.project_id);
				this.projMngRptEstActCostReport.refresh(restriction);
				this.projMngRptEstActCostReport.show(true);
		    } else   
		    {
		    	alert(result.code + " :: " + result.message);
		  	}
		}
	}
});