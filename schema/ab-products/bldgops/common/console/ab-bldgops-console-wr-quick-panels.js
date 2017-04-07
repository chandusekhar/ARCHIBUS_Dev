/**
 * Controller for the other quick panels exclude console filter and grid.
 */
View.createController('wrOtherController', {
	
	/**
	 * After initial data fetch.
	 */
	afterInitialDataFetch : function() {
		//if the schema not having rejected_step field, hide Approval form cancel button and make the UI same as v21.3 
		if(!Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-checkSchemaExisting','helpdesk_step_log', 'rejected_step').value){
			this.approvePanel.actions.get('cancel').show(false);
			this.dispatchPanel.actions.get('cancel').show(false);
		}
	},
	
	 /**
     * Forward approval.
     */
	approvePanel_onForwardApproval: function(action){
		var selectedRecords = getSelectedWrRecordsForWFR();
		View.forwardRecords = selectedRecords;
			
		this.forwardForm.setFieldValue('em.em_id','');
		this.forwardForm.showInWindow({
			x : 200,
			y : 200,
			modal : true,
			width : 500,
			height : 200
		});
	}, 
	
    /**
     * Issue a work request.
     */
	issuePanel_onIssueYes: function(action){
		issueWRs(View.WRrecords);	
		this.issuePanel.closeWindow();		
	}, 

    /**
     * Cancel a work request.
     */	
	cancelPanel_onCancelYes: function(action){	
		cancelWRs(View.WRrecords);
		this.cancelPanel.closeWindow();	
	}, 

    /**
     * Hold a work request.
     */				
	holdPanel_onHoldYes: function(action){
		// TODO:  API for radio buttons
		var status = '';
		var radioOptions = document.getElementsByName('holdRadio');
		for(var i=0; i<radioOptions.length; i++){
			if(radioOptions[i].checked == 1){
				status = radioOptions[i].value;
			}
		} 
		this.updateWorkRequestStatusForRecords(status);
		this.holdPanel.closeWindow();		
	}, 

    /**
     * Stop a work request.
     */	
	stopPanel_onStopYes: function(action){
		this.updateWorkRequestStatusForRecords('S');
		this.stopPanel.closeWindow();
	}, 

    /**
     * Complete a work request.
     */	
	completePanel_onCompleteYes: function(action){	
		this.updateWorkRequestStatusForRecords('Com');
		this.completePanel.closeWindow();
	}, 
	
	/**
     * Cf Complete a work request.
     */	
	completeCfPanel_onCompleteYes: function(action){	
		try{
			Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-completeCf', View.WRrecords);
			var wrFilter = View.controllers.get('wrFilter');
			if (wrFilter) {
			     wrFilter.wrFilter_onFilter();
			}
			this.completeCfPanel.closeWindow();
		}catch(e) {
			Workflow.handleError(e);
		}
		
	},
	
	/**
     * Complete a work request by option.
     */	
	completeOptionPanel_onCompleteYes: function(action){
		var option = '';
		var radioOptions = document.getElementsByName('completeOptionRadio');
		for(var i=0; i<radioOptions.length; i++){
			if(radioOptions[i].checked == 1){
				option = radioOptions[i].value;
			}
		}
		
		this.completeOptionPanel.closeWindow();
		
		if(option == 'completeMyAssignments'){
			this.completeCfPanel_onCompleteYes(action);
		}else{
			this.completePanel_onCompleteYes(action);
		}
		
	},

    /**
     * Close a work request.
     */
	closePanel_onCloseYes: function(action){
		if(this.closePanel.closeStopped){
			closeStoppedWRs(View.WRrecords)
		}else{
			closeWRs(View.WRrecords);
		}
			
		this.closePanel.closeWindow();
	},

    /**
     * Update work request status for records.
     */	
	updateWorkRequestStatusForRecords: function(status){
		var records = View.WRrecords;
		for(var i=0; i<records.length; i++){
			var record = records[i];
			var wrId = record['wr.wr_id'];
			var record = {'wr.wr_id': wrId, 'wr.activity_type': 'SERVICE DESK - MAINTENANCE'};
			//KB3046145 - Fill completed_by field
			if (status == 'Com') {
				record['wr.completed_by'] = View.user.employee.id;
			}
			this.updateWorkRequestStatus(wrId, record, status);
		}
		
		//KB3041584  - just need one refresh for bulk update
		var wrFilter = View.controllers.get('wrFilter');
		if (wrFilter) {
			wrFilter.wrFilter_onFilter();
		}		
	},
	
    /**
     * Update the status for a work request.
     */		
	updateWorkRequestStatus: function(wrId, record, status){
		var result = {};
		try {		
			result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-updateWorkRequestStatus', record,status);
		} catch (e) {
			Workflow.handleError(e);
		}		
	}			
});