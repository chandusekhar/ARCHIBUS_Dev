
var woIssueController = View.createController('woIssueController', {
    wo_issue_wo_form_afterRefresh: function(){
        this.refreshGridPanel();
    },
    refreshGridPanel: function(){
        var woId = this.wo_issue_wo_form.getFieldValue('wo.wo_id');
        var restriction = new Ab.view.Restriction();
        restriction.addClause("wo.wo_id", woId, '=');
        this.wo_issue_wr_report.refresh(restriction);
    }
});

/**
 * Issue Work Order<br />
 * Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#issueWorkorder(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-issueWorkorder</a><br />
 * Reloads Issue tab page
 * @param {String} form current form
 */
function issueWO(){
    var panel = View.getControl('', 'wo_issue_wo_form');
    var woId = panel.getFieldValue('wo.wo_id');
   
	var result = {};
	//Issue work order,file='WorkRequestHandler.java'
	try {
   		result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-issueWorkorder', woId);
    	}catch (e) {
		  if (e.code == 'ruleFailed') {
                    View.showMessage(e.message);
                }
                else {
                    Workflow.handleError(e);
                }
                return;
 		}	
    if (result.code == 'executed') {
        var tabs = View.parentTab.parentPanel;
        if (tabs != null) {
            var restriction = new Ab.view.Restriction();
            restriction.addClause('wo.wo_id', woId, '=');
            panel.refresh(restriction);
        }
    }
    else {
        Workflow.handleError(result);
    }
}

/**
 * Print Work order<br />
 * Opens dialog to export pdf from current workorder
 */
function printWO(){
    var panel = View.getControl('', 'wo_issue_wo_form');
    var woId = panel.getFieldValue('wo.wo_id');
	//Guo changed 2009-08-28 to fix KB3023503
	if(woId){
		var restriction = new Ab.view.Restriction();
	    restriction.addClause('wo.wo_id', woId, '=');
		View.openDialog("ab-paginated-report-job.axvw?viewName=ab-pm-issue-wo-print.axvw", {'ds_ab-pm-issue-wo-print_paginated_wo': restriction});
	}
}

function cancelWrs(){
    var grid = View.getControl('', "wo_issue_wr_report");
    var records = grid.getPrimaryKeysForSelectedRows();
	//KB3020860
	if(records.length==0){
		View.showMessage(getMessage('noRecordSelected'));
		return;
	}
	var result = {};
	//Cancel work requests , file='WorkRequestHandler.java'.
	try {
		result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-cancelWorkRequests', records);
	}catch (e){
		if (e.code == 'ruleFailed'){
			View.showMessage(e.message);
		}else{
			 Workflow.handleError(e);
		}
		return;
 	}
    if (result.code == 'executed') {
        View.controllers.get("woIssueController").refreshGridPanel();
		//Guo changed 2009-01-05 for KB3021193
		if(View.panels.get('wo_issue_wr_report').rows.length==0){
			View.parentTab.parentPanel.selectTab('select');
		}
    }
    else {
        Workflow.handleError(result);
    }
}

