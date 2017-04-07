/**
 * Saves Verification Comments and confirms verification<br />
 * Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#verifyWorkRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-verifyWorkRequest</a><br />
 * Called by button 'Confirm'
 * @param {String} form current form
 */
function onVerify(){
    var form = View.panels.get('wr_verif_wr_step_form');
    var record = ABPMC_getDataRecord(form);

    //kb:3024805
	var result = {};
	//Save Work Request Verification - A supervisor can verify the work after a request has been completed by the craftsperson(s)
    try {
        result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-verifyWorkRequest', record);
    } 
    catch (e) {
        Workflow.handleError(e);
    }
    if (result.code == 'executed') {
		var openerView = View.getOpenerView();
		
		openerView.closeDialog();
		openerView.parentTab.parentPanel.selectTab('select');
    }
    else {
        Workflow.handleError(result);
    }
}

/**
 * Saves Verification Comments and sets request as incomplete (back to issued)
 * Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#returnWorkRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-returnWorkRequest</a><br />
 * Called by 'Return Incomplete' button
 * @param {String} form current form
 */
function onReturn(){
    var form = View.panels.get('wr_verif_wr_step_form');
    var record = ABPMC_getDataRecord(form);

    //kb:3024805
	var result = {};
	//This sets the status of the work request back to 'Issued' by calling method returnWorkRequest which belong to WorkRequestHandler.java
    try {
        result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-returnWorkRequest', record);
    } 
    catch (e) {
        Workflow.handleError(e);
    }
    if (result.code == 'executed') {
        View.getOpenerView().parentTab.parentPanel.selectTab('select');
        View.closeThisDialog();
    }
    else {
        Workflow.handleError(result);
    }
}
