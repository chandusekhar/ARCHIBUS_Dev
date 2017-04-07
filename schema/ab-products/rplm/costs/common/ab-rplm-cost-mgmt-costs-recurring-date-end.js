var mgmtRecurringCostDateEndController = View.createController('mgmtRecurringCostDateEnd', {

    openerController: null,
    
    costIds: null,
    
    consoleDate_onScheduleCosts: function(){
        var dateEnd = this.consoleDate.getFieldValue('cost_tran_recur.date_end');
        if (dateEnd.length == 0) {
            View.showMessage(getMessage('setDate'));
        }
        else {
            try {
                Workflow.callMethod('AbCommonResources-CostService-createScheduledCosts', this.costIds, dateEnd);
                
                if(View.activityParameters['AbCommonResources-EnableVatAndMultiCurrency'] == 1){
                    var objDsScheduled = View.dataSources.get("dsScheduledCosts");
                    var recurCostIds = this.costIds;
                    var confirmMessage = getMessage("confirm_message");
                    var messageJob = getMessage("message_job");
                    var controller = this;

            		var restriction = new Ab.view.Restriction();
            		restriction.addClause("cost_tran_sched.cost_tran_recur_id", recurCostIds, 'IN');
            		var records = objDsScheduled.getRecords(restriction);
            		var costs = [];
            		var types = [];
            		for(var i= 0; i< records.length; i++){
            			var record =  records[i];
            			var costId = record.getValue("cost_tran_sched.cost_tran_sched_id");
            			costs.push(parseInt(costId));
            			types.push("cost_tran_sched");
            		}

            		var jobId  = Workflow.startJob('AbCommonResources-CostService-updateCostRecordforVATandMC', costs, types);
        		    View.openJobProgressBar(messageJob, jobId, '', function(status) {
            			controller.openerController.recurringCostGrid.refresh();
            			controller.openerController.view.controllers.get('mgmtScheduledCost').scheduledCostGrid.refresh();
        		    	if(valueExists(status.jobProperties.noExchangeRate)){
        		    		View.showMessage(status.jobProperties.message);
        		    	}else{
        		    		controller.openerController.view.closeDialog();
        		    	}
       		    	});

/*    KB 3039098 Remove confirm message                
                    View.confirm( confirmMessage , function(button){
                    	if(button == 'yes'){
                    		var restriction = new Ab.view.Restriction();
                    		restriction.addClause("cost_tran_sched.cost_tran_recur_id", recurCostIds, 'IN');
                    		var records = objDsScheduled.getRecords(restriction);
                    		var costs = [];
                    		var types = [];
                    		for(var i= 0; i< records.length; i++){
                    			var record =  records[i];
                    			var costId = record.getValue("cost_tran_sched.cost_tran_sched_id");
                    			costs.push(parseInt(costId));
                    			types.push("cost_tran_sched");
                    		}
                    		try{
                        		var jobId  = Workflow.startJob('AbCommonResources-CostService-updateCostRecordforVATandMC', costs, types);
                    		    View.openJobProgressBar(messageJob, jobId, '', function(status) {
                        			controller.openerController.recurringCostGrid.refresh();
                        			controller.openerController.view.controllers.get('mgmtScheduledCost').scheduledCostGrid.refresh();
                    		    	if(valueExists(status.jobProperties.noExchangeRate)){
                    		    		View.showMessage(status.jobProperties.message);
                    		    	}else{
                    		    		controller.openerController.view.closeDialog();
                    		    	}
                   		    	});
                    			
                    			
                    		}catch(e){
                    			Workflow.handleError(e);
                    			return false;
                    		}
                    	}else{
                			controller.openerController.recurringCostGrid.refresh();
                			controller.openerController.view.controllers.get('mgmtScheduledCost').scheduledCostGrid.refresh();
                			controller.openerController.view.closeDialog();
                    	}
                    });
*/                    
                }else{
                    this.openerController.recurringCostGrid.refresh();
                    this.openerController.view.controllers.get('mgmtScheduledCost').scheduledCostGrid.refresh();
                    this.openerController.view.closeDialog();
                }
                
            } 
            catch (e) {
                Workflow.handleError(e);
            }
            
        }
    }
})
