/**
 * Called when click the button 'Save'<br />
 */
function saveToolType(){
    var panel = View.getControl('', 'wr_tooltype');
    var record = ABODC_getDataRecord2(panel);

    if (!panel.save()) {
    	return;
    }
	var result = {};
    try {
		 result = Workflow.callMethod("AbBldgOpsOnDemandWork-WorkRequestService-saveWorkRequestToolType", record);
	} catch (e) {
		Workflow.handleError(e);
 		}
    if (result.code == 'executed') {
        var wrcode = panel.getFieldValue("wrtt.wr_id");
        View.getOpenerView().panels.get('panel_estimation').refresh();
        View.getOpenerView().panels.get('tt_report').refresh();
        View.getOpenerView().closeDialog();
    }
    else {
        Workflow.handleError(result);
    }
}
