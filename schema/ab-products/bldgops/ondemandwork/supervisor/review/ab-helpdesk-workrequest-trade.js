/**
 * Called when click the button 'Save'<br />
 */
function saveTrade(){
    var panel = View.getControl('', 'wr_trade');
    var record = ABODC_getDataRecord2(panel);
    if (!panel.save()) {
    	return;
    }
	var result = {};
    try {
		 result = Workflow.callMethod("AbBldgOpsOnDemandWork-WorkRequestService-saveWorkRequestTrade", record);
	} 
   	catch (e) {
	Workflow.handleError(e);
 	}	
    if (result.code == 'executed') {
        var wrcode = panel.getFieldValue("wrtr.wr_id");
        View.getOpenerView().panels.get('panel_estimation').refresh();
        View.getOpenerView().panels.get('tr_report').refresh();
        View.getOpenerView().closeDialog();
    }
    else {
        Workflow.handleError(result);
    }
}
