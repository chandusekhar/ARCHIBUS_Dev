var abHpdRVVerificationController =  View.createController("abHpdRVVerificationController",{

	/**
	 * @fileoverview Javascript functions for <a href='../../../viewdoc/overview-summary.html#ab-helpdesk-request-verification.axvw' target='main'>ab-helpdesk-request-verification.axvw</a>
	 */
	
	/**
	* Saves Satisfaction Rating and Comments<br />
	* Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/helpdesk/RequestHandler.html#verifyRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-verifyRequest</a><br />
	* Called by button 'Confirm'
	* @param {String} form current form
	*/
	verifyWorkPanel_onConfirm: function(){
		
		var record = ABHDC_getDataRecord2(this.verifyWorkPanel);
		
		try {
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-verifyRequest', record);
		}catch(e){
			Workflow.handleError(e);
		}
		
		if(result.code == 'executed'){
			ABHDC_getTabsSharedParameters(true)["refresh_from_ab_helpdesk_request_view_cancelRequest"] = true;
			var openView = View.getOpenerView();
			openView.closeDialog();
			openView.parentTab.loadView();
		} else {
			Workflow.handleError(result);
		}
	},
	
	
	/**
	* Verification Comments and sets request as incomplete (back to issued)
	* Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/helpdesk/RequestHandler.html#returnRequestIncomplete(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-returnRequestIncomplete</a><br />
	* Called by 'Return incomplete' button 
	* @param {String} form current form
	*/
	verifyWorkPanel_onInComplete: function(){
		
		var record = ABHDC_getDataRecord2(this.verifyWorkPanel);
		try {
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-returnRequestIncomplete', record);
		}catch(e){
			Workflow.handleError(e);
		}
		
		if(result.code == 'executed'){
			ABHDC_getTabsSharedParameters(true)["refresh_from_ab_helpdesk_request_view_cancelRequest"] = true;
			var openView = View.getOpenerView();
			openView.closeDialog();
			openView.parentTab.loadView();
	
		} else {
			Workflow.handleError(result);
		}
	}
});




