/**
 * Saves Verification Comments and confirms verification<br />
 * Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#verifyWorkRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-verifyWorkRequest</a><br />
 * Called by button 'Confirm'
 * @param {String} form current form
 */
function onVerify(){
    var form =  View.panels.get('wr_verif_wr_step_form');
	if (!form.canSave()){
		return;
	}
    var record = ABODC_getDataRecord2(form);
    var result = {};
	try {
		 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-verifyWorkRequest', record);
     } 
   	catch (e) {
		 Workflow.handleError(e);
 	}
    if (result.code == 'executed') {
    	var openerView = View.getOpenerView();
        openerView.closeDialog();
        if(openerView.controllers.get(0).afterVerification){
        	openerView.controllers.get(0).afterVerification();
        }else{
        	openerView.parentTab.loadView();
        }
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
    var form =  View.panels.get('wr_verif_wr_step_form');
	if (!form.canSave()){ //kevin added for kb 3026588
		return;
	}
    var record = ABODC_getDataRecord2(form);
	var result = {};
	try {
	    result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-returnWorkRequest', record);
     } 
   	catch (e) {
		Workflow.handleError(e);
 	}
    if (result.code == 'executed') {
    	var openerView = View.getOpenerView();
        openerView.closeDialog();
        if(openerView.controllers.get(0).afterVerification){
        	openerView.controllers.get(0).afterVerification();
        }else{
        	openerView.parentTab.loadView();
        }
    }
    else {
        Workflow.handleError(result);
    }
}

