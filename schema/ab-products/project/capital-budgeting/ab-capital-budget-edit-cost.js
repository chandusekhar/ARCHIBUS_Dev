var capitalBudgetEditCostController = View.createController('capitalBudgetEditCost', {
	afterInitialDataFetch : function() {
		var openerTable = View.getOpenerView().panels.get('capitalBudgetEditItemsTable');
		var budget_id = openerTable.restriction.clauses[0].value;
		var restriction = this.capitalBudgetEditCostForm.restriction;
		restriction.addClause('prog_budget_items.budget_id', budget_id);
		this.capitalBudgetEditCostForm.refresh(restriction);
	},
	
	capitalBudgetEditCostForm_beforeSave : function() {
		this.capitalBudgetEditCostForm.setFieldValue('prog_budget_items.source', 'Manual');
	}
});