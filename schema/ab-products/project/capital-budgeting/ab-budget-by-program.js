var budgetByProgramController = View.createController('budgetByProgram', {
	budget_id : '',
	
	afterInitialDataFetch : function() {
		this.budgetByProgramConsole_onClear();
		this.budgetByProgramTable.show(false);
		this.budgetByProgramChart.show(false);
	},
	
	budgetByProgramConsole_onShow : function() {
		this.budget_id = this.budgetByProgramConsole.getFieldValue('budget.budget_id');
		if (this.budget_id == '') {
			View.showMessage(getMessage('emptyRequiredFields'));
			return;
		}
		this.budgetByProgramTable.show(false);
		this.budgetByProgramChart.show(false);
		var restriction = new Ab.view.Restriction();
		restriction.addClause('prog_budget_items.budget_id', this.budget_id);
		if ($('display_type_grid').checked) {
			this.budgetByProgramTable.refresh(restriction);
			this.budgetByProgramTable.show(true);
		} else {
			this.budgetByProgramChart.addParameter('budgetId', this.budget_id);
			this.budgetByProgramChart.refresh(restriction);
			this.budgetByProgramChart.show(true);
		}
	},
	
	budgetByProgramConsole_onClear : function() {
		this.budgetByProgramConsole.clear();
		$('display_type_grid').checked = true;
	}
});

function budgetByProgram_onClick(obj) {
	var controller = View.controllers.get('budgetByProgram');
    obj.restriction.addClause('prog_budget_items.budget_id', controller.budget_id);
    View.openDialog('ab-budget-by-program-drilldown.axvw', obj.restriction);
}
