var planScenarioCostsSelectFundController = View.createController('planScenarioCostsSelectFund', {
	
	afterInitialDataFetch: function() {
		if (this.planScenarioCostsSelectFundGrid.rows.length == 0)
			View.showMessage(getMessage('noFunds'));
	},
	
	planScenarioCostsSelectFundGrid_onSelectFund: function(row, action)
	{
		var openerController = View.getOpenerView().controllers.get('planScenarioCostsPage2');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('project.project_id', openerController.project_id);
		var project_record = openerController.planScenarioCostsScenarioItemFormDs2.getRecord(restriction);
		var project_program_id = project_record.getValue('project.program_id');
		
		var funding_record = row.getRecord();
		var funding_program_id = funding_record.getValue('funding.program_id');
		
		if (openerController.checkProgramIdMatch(funding_program_id, project_program_id)) {
			var fund_id = funding_record.getValue('funding.fund_id');
			openerController.planScenarioCostsScenarioItemForm.setFieldValue('projscns.fund_id', fund_id);
			View.closeThisDialog();
		}	
	}
});