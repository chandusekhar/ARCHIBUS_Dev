var chgbkCostToChgbkController = View.createController('chgbkCostToChgbkCtrl',{
	gridCostToChgbk_onChargeback: function(){
		var restriction = View.controllers.get('chgbkWizardCtrl').restriction;
		if(restriction == null){
			restriction = '';
		}
		var wizardController = View.controllers.get('chgbkWizardCtrl');
		var controller = this;
		// confirm delete scheduled costs
		var message = getMessage('confirmDeleteCosts_1')
					 + '<br/>' + getMessage('confirmDeleteCosts_2')
					 + '<br/>' + getMessage('confirmDeleteCosts_3');
		
		var jobRunMessage = getMessage('calculateMessage');
		
		View.confirm(message, function(button) {
			if (button == 'yes') {
				try {
	        		var jobId  = Workflow.startJob('AbCommonResources-CostService-calculateChargebackCosts', restriction, true, true);
	    		    View.openJobProgressBar(jobRunMessage, jobId, '', function(status) {
	    		    	wizardController.consoleRestriction_onFilter();
	    		    	controller.showExceptionsMessage();
	    		    });
				} 
				catch (e) {
					Workflow.handleError(e);
				}
			}
		});
	},
	showExceptionsMessage: function(){
		var restrict = " cost_tran.chrgbck_status IN ('N','BO','SU') "
						+ " AND (" + View.controllers.get('chgbkWizardCtrl').restriction +")";
		parameters = {
			tableName:'cost_tran',
			fieldNames: toJSON(['cost_tran.cost_tran_id']),
			restriction: toJSON(restrict)
		};
		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
		if(result.code == 'executed'){
			var exceptionsNumber = result.data.records.length;
			if(exceptionsNumber > 0) {
				var message = getMessage('exceptionsMessage_1')
								+ '<br/>' + getMessage('exceptionsMessage_2')
								+ '<br/>- ' + getMessage('exceptionsMessage_3')
								+ '<br/>- ' + getMessage('exceptionsMessage_4')
								+ '<br/>' + getMessage('exceptionsMessage_5');
				View.showMessage(message);
			}
		}else{
			Workflow.handleError(result);
		}
	}
});