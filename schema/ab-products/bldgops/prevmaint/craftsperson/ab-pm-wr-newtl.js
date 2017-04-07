function saveWorkRequestTool(){
    var panel = View.getControl('', 'ab_pm_wr_newtl_wrtl_form');
    record = panel.getFieldValues();
	var result = {};
	//Save a tooltype for a work request (estimation),file='WorkRequestHandler.java'
	try {
		result = Workflow.callMethod("AbBldgOpsOnDemandWork-WorkRequestService-saveWorkRequestTool", record);
	}catch (e) {
        Workflow.handleError(e);
   		 }
    View.getOpenerView().controllers.get(0).refreshGridPanel();
}
