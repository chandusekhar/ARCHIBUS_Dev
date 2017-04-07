
var reviewSelectTabController = View.createController('reviewSelectTabController', {
	
	 /**
	 * After view loads
	 */
	afterViewLoad : function() {
		//KB3044152 - Performance issue - use WFR to get workflow substitutes and avoid sub query 
		this.request_report.addParameter('emWorkflowSubstitutes', Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-getWorkflowSubstitutes','em_id').message);
	},

    request_console_afterRefresh: function(){
        this.request_report.refresh();
    },
    request_report_afterRefresh: function(){
		 highlightBySubstitute(this.request_report, 'activity_log.supervisor', View.user.employee.id);		 
	}
});

/**
 * Create work requests for selected help requests (1 for each)<br />
 * Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#createWorkRequestFromHelpRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-createWorkRequestFromHelpRequest</a><br />
 * Called by 'Create Work Request(s)' button on upper panel<br />
 * Reloads select tab
 */
function createWorkRequest(){
    var grid = View.getControl('', "request_report");
    var records = grid.getPrimaryKeysForSelectedRows();
    if (records.length == 0) {
        alert(getMessage("noRecords"));
        return;
    }
    
    if (confirm(getMessage("confirmCreateWorkRequest"))) {
        window.recs = records;
		var result = {};
		try {
			
			 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-createWorkRequestFromHelpRequest', records,[]);
		
        } 
   		catch (e) {
		Workflow.handleError(e);
 		}
	    if (result.code == 'executed') {
            var res = eval('(' + result.jsonExpression + ')');
            var rest = new Ab.view.Restriction();
            
            var tabs = View.getControl('', 'reviewRequestTabs');
            if (res.length == 1) {
                rest.addClause("wr.wr_id", res[0].wr_id, "=");
                tabs.selectTab("WRdetails", rest, false);
            }
            else 
                if (res.length > 1) {
                    rest.addClause("wr.wr_id", res[0].wr_id, "=", ')AND(');
                    for (var i = 1; i < res.length; i++) {
                        rest.addClause("wr.wr_id", res[i].wr_id, "=", 'OR');
                    }
                    tabs.selectTab("WRdetails", rest, false);
                }
        }
        else {
            Workflow.handleError(result);
        }
    }
}


