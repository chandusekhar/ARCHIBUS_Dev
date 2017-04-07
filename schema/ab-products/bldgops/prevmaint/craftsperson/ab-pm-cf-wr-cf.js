function saveWorkRequestCraftsperson(){
    var panel = View.getControl('', 'ab_pm_cf_wr_cf_form');
    var record = ABPMC_getDataRecord(panel);;
	var result = {};
	//Save craftsperson assignment ,file='WorkRequestHandler.java'
	try {
		result = Workflow.callMethod("AbBldgOpsOnDemandWork-WorkRequestService-saveWorkRequestCraftsperson", record);
    }catch (e) {
        Workflow.handleError(e);
   	}
	View.getOpenerView().controllers.get(0).refreshGridPanel();
	
}