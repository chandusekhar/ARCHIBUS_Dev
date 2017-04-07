var chgbkCostToApproveController = View.createController('chgbkCostToApproveCtrl',{
	gridCostToApprove_onApprove: function(){
		View.openProgressBar(getMessage('approveMessage'));
		try {
			var restriction = replaceAll(View.controllers.get('chgbkWizardCtrl').restriction, 'cost_tran.', 'cost_tran_sched.');
			Workflow.callMethod('AbCommonResources-CostService-approveAllChargebackCosts', restriction);
			
			var wizardController = View.controllers.get('chgbkWizardCtrl');
			wizardController.consoleRestriction_onFilter();
			View.closeProgressBar();
		} 
		catch (e) {
			View.closeProgressBar();
			Workflow.handleError(e);
		}
	}
});

