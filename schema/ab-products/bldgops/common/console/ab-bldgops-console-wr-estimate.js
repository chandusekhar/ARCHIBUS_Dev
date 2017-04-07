/**
 * Controller for the work request estimate.
 */
View.createController('wrEstimate', {
	
	 /**
     * Show Complete Estimation button only for required step.
     */
	afterInitialDataFetch: function(){
		var openerController = View.getOpenerView().controllers.get('opsConsoleWrListActionController');
		var selectedWrRecords = openerController.selectedWrRecordsForAction;
		
		if(selectedWrRecords.length==1){
			this.wrtrGrid.showColumn('wrtr.wr_id', false);
			this.wrptGrid.showColumn('wrpt.wr_id', false);
			this.wrotherGrid.showColumn('wr_other.wr_id', false);
			this.wrCosts.showColumn('wr.wr_id', false);
			this.wrtrGrid.update();
			this.wrptGrid.update();
			this.wrCosts.update();
		}
		
		this.wrCosts.actions.get('completeEstimtion').show(false);
		this.wrptForm.showField('wrpt.qty_actual', false);
		
		this.wrotherGrid.showColumn('wr_other.cost_total', false);
		this.wrotherGrid.update();
		this.wrotherForm.showField('wr_other.cost_total', false);
		
		
		
		for(var i=0;i<selectedWrRecords.length;i++){
			
			var stepType = selectedWrRecords[i].getValue('wr.stepWaitingType');
			if(stepType == 'estimation'){
				
				this.wrCosts.actions.get('completeEstimtion').show(true);
				break;
				
			}
		}
		
	},
    	
    /**
     * Complete estimation for required step
     */
	wrCosts_onCompleteEstimtion: function(){
		var openerController = View.getOpenerView().controllers.get('opsConsoleWrListActionController');
		var selectedWrRecords = openerController.selectedWrRecordsForAction;
		
		for(var i=0;i<selectedWrRecords.length;i++){
			
			var wrId = selectedWrRecords[i].getValue('wr.wr_id');
			var stepCode = selectedWrRecords[i].getValue('wr.stepWaitingCode');
			
			if(stepCode){
				var record = {};
				record['wr.wr_id'] = wrId;
				record['wr_step_waiting.step_log_id'] = stepCode;
				if(selectedWrRecords[i].getValue('wr.status') == 'Rej'){
					record['wr.status'] = selectedWrRecords[i].getValue('wr.rejectedStep').split(';')[0];
				}
				
				try {
					Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-completeEstimation', 'wr', 'wr_id', wrId, record);
				}catch (e) {
					Workflow.handleError(e);
				}
			}
		}
		
		var wrFilter = View.getOpenerView().controllers.get('wrFilter');
		if (wrFilter) {
			wrFilter.wrFilter_onFilter();
		}
		
		View.closeThisDialog();
		
	}
  
});