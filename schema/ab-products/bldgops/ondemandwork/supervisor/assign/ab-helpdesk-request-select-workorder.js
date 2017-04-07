/**
 * @fileoverview Javascript functions for <a href='../../../viewdoc/overview-summary.html#ab-helpdesk-request-select-workorder.axvw' target='main'>ab-helpdesk-request-select-workorder.axvw</a>
 */
/**
 * Assign work request(s) to work order<br />
 * Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#assignWrToWo(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-assignWrToWo</a><br />
 * Called by 'Select' button in a report row<br />
 * Closes dialog window and reload select tab in opening window
 */
var abHelpdeskRequestViewController = View.createController("abHelpdeskAssignWorkorderController", {

    afterViewLoad: function(){
    }
})

function onSelect(){
    var records = View.getOpenerView().WRrecords;
    var woassignreport = View.panels.get('wo_assign_report');
    var wo_id = woassignreport.rows[woassignreport.selectedRowIndex]['wo.wo_id'];
	var result = {};
	try {
		 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-assignWrToWo',records, wo_id);
	 } 
    catch (e) {
	 Workflow.handleError(e);
 	}
    if (result.code == 'executed') {
        var opennerView = View.getOpenerView();
        var tabs = opennerView.parentTab.parentPanel;
        tabs.selectTab('select');
        opennerView.closeDialog();
        
    }
    else {
        Workflow.handleError(result);
    }
}
