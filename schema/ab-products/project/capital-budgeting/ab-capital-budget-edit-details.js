var capitalBudgetEditDetailsController = View.createController('capitalBudgetEditDetails', {
	budget_id : '',
	
	capitalBudgetEditDetailsConsole_onShow : function() {
		this.budget_id = this.capitalBudgetEditDetailsConsole.getFieldValue('budget.budget_id');
		if (this.budget_id == '') {
			View.showMessage(getMessage('emptyRequiredFields'));
			return;
		}
		var restriction = new Ab.view.Restriction();
		restriction.addClause('prog_budget_items.budget_id', this.budget_id);
		this.capitalBudgetEditItemsTable.refresh(restriction);
		this.capitalBudgetEditItemsTable.show(true);
	}
});
