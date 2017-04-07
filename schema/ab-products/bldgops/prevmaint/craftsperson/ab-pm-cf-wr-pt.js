function saveWorkRequestPart(){
    var panel = View.getControl('', 'ab_pm_cf_wr_pt_wrpt_form');
    record = ABPMC_getDataRecord(panel);
	var result = {};
	//Save a part for a work request (estimation),file='WorkRequestHandler.java'
	try {
		result = Workflow.callMethod("AbBldgOpsOnDemandWork-WorkRequestService-saveWorkRequestPart", record);
	}catch (e) {
        Workflow.handleError(e);
   		}
    View.getOpenerView().controllers.get(0).refreshGridPanel();
}
