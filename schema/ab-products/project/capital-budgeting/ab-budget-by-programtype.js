var budgetByProgramController = View.createController('budgetByProgramType', {
	budget_id : '',
	
	afterInitialDataFetch : function() {
		this.budgetByProgramTypeConsole_onClear();
		this.budgetByProgramTypeTable.show(false);
		this.budgetByProgramTypeChart.show(false);
	},
	
	budgetByProgramTypeConsole_onShow : function() {
		this.budget_id = this.budgetByProgramTypeConsole.getFieldValue('budget.budget_id');
		if (this.budget_id == '') {
			View.showMessage(getMessage('emptyRequiredFields'));
			return;
		}
		this.budgetByProgramTypeTable.show(false);
		this.budgetByProgramTypeChart.show(false);
		var restriction = new Ab.view.Restriction();
		restriction.addClause('prog_budget_items.budget_id', this.budget_id);
		if ($('display_type_grid').checked) {
			this.budgetByProgramTypeTable.refresh(restriction);
			this.budgetByProgramTypeTable.show(true);
		} else {
			this.budgetByProgramTypeChart.addParameter('budgetId', this.budget_id);
			this.budgetByProgramTypeChart.refresh(restriction);
			this.budgetByProgramTypeChart.show(true);
		}
	},
	
	budgetByProgramTypeConsole_onClear : function() {
		this.budgetByProgramTypeConsole.clear();
		$('display_type_grid').checked = true;
	}
});

function budgetByProgramType_onClick(obj) {
	var controller = View.controllers.get('budgetByProgramType');
    obj.restriction.addClause('prog_budget_items.budget_id', controller.budget_id);
    View.openDialog('ab-budget-by-program-drilldown.axvw', obj.restriction);
}
