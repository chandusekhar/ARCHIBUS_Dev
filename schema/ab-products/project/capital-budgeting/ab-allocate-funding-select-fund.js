var allocateFundingSelectFundController = View.createController('allocateFundingSelectFund', {
	
	afterInitialDataFetch: function() {
		if (this.allocateFundingSelectFundGrid.rows.length == 0)
			View.showMessage(getMessage('noFunds'));
	},
	
	allocateFundingSelectFundGrid_onSelectFund: function(row, action)
	{
		var openerController = View.getOpenerView().controllers.get('allocateFundingEdit');		
		var funding_record = row.getRecord();
		
		if (openerController.checkProgramIdMatch(funding_record)) {
			var fund_id = funding_record.getValue('funding.fund_id');
			openerController.allocateFundingForm.setFieldValue('projfunds.fund_id', fund_id);
			View.closeThisDialog();
		}		
	}
});
  