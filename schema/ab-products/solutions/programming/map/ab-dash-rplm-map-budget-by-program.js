var abBudgetByProgramCtrl = View.createController('abBudgetByProgramCtrl', {
	afterInitialDataFetch: function(){
		this.budgetByProgramChart.config.showLegendOnLoad = (this.view.type != 'dashboard');
   	}
});

function budgetByProgram_onClick(obj) {
    obj.restriction.addClause('prog_budget_items.budget_id', "Capital-2007-11-3A-Proposed");
    View.openDialog('ab-budget-by-program-drilldown.axvw', obj.restriction);
}
