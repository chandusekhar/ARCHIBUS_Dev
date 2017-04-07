function saveWorkRequestTool(){
    var panel = View.getControl('', 'ab_pm_wr_tl_wrtl_form');
    record = ABPMC_getDataRecord(panel);
	var result = {};
	//Save a tooltype for a work request (estimation),file='WorkRequestHandler.java'
	try {
		result = Workflow.callMethod("AbBldgOpsOnDemandWork-WorkRequestService-saveWorkRequestTool", record);
		}catch (e) {
        Workflow.handleError(e);
   		 }
    View.getOpenerView().controllers.get(0).refreshGridPanel();
}
