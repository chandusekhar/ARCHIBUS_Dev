var projMngRptAtRiskController = View.createController('projMngRptAtRisk', {
	comments: ['budget_excess','cost_equal_budget','cost_exceeded_budget','ahead_of_schedule','equal_to_schedule','behind_schedule'],
	
	afterViewLoad: function() {
		var project_id = View.getOpenerView().getOpenerView().controllers.get('projMng').project_id;
		onCalcEndDatesForProject(project_id);
		
		for (var i = 0; i < this.comments; i++) {
			this.projMngRptAtRiskCrossTable.addParameter(this.comments[i], getMessage(this.comments[i]));
		}		
	}
});

function projMngRptAtRiskCrossTable_onclick(obj) {
	if (obj.restriction.clauses.length < 2) return;
	View.openDialog('ab-proj-mng-rpt-at-risk-dtl.axvw', obj.restriction);	
}
