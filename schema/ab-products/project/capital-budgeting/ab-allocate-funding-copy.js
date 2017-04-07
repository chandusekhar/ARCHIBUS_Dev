var allocateFundingCopyController = View.createController('allocateFundingCopy', {
	
	afterInitialDataFetch: function() {
		if (this.allocateFundingCopyGrid.rows.length == 0)
			View.showMessage(getMessage('noScenarios'));
	},
	
	allocateFundingCopyGrid_onCopyScenarioRecords: function(row, action)
	{
		var record = row.getRecord();
		var projScenarioId = record.getValue('projscns.proj_scenario_id');
		var destProjectId = record.getValue('projscns.project_id');
		var parameters = 
		{
			'updatedRecordsRequired':false,
			'ProjectId':destProjectId,
			'ProjScenarioId':projScenarioId  
		};
		var result = Workflow.callMethodWithParameters('AbCapitalBudgeting-CapitalProjectsService-copyScenarioRecordsToProjectFunds', parameters);
		if (result.code == 'executed') {
			View.getOpenerView().panels.get('allocateFundingGrid').refresh();
			View.closeThisDialog();
		} else {
			View.showMessage('error', result.code + ' :: ' + result.message);
		}
	}
});
  