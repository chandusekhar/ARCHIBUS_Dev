/**
 * Called when loading the form
 * <div class='detailHead'>Pseudo-code:</div>
 *	<ol>
 *		<li>Display 'Close Work Order' button for open work order (date_completed empty)</li>
 * 		<li>Create restriction and refresh work request list</li>
 *	</ol>
 */
var woUpdateController = View.createController('woUpdateController', {
	
	 /**
	 * After view loads
	 */
	afterViewLoad : function() {
		//KB3044152 - Performance issue - use WFR to get workflow substitutes and avoid sub query 
		this.wo_upd_view_wr_report.addParameter('emWorkflowSubstitutes', Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-getWorkflowSubstitutes','em_id').message);
	},

	
    wo_upd_view_wo_form_afterRefresh: function(){
        var record = this.wo_upd_view_wo_form.getRecord();
        var woId = record.getValue('wo.wo_id');
        
        this.wo_upd_view_wo_progress.setRecord(record);
        this.wo_upd_view_wr_cost.setRecord(record);
        
        this.wo_upd_view_wo_progress.show();
        this.wo_upd_view_wr_cost.show();
        
        var wrRestriction = new Ab.view.Restriction();
        wrRestriction.addClause("wr.wo_id", woId, '=');
        
        this.wo_upd_view_wr_report.refresh(wrRestriction);
        
        if (record.getValue('wo.qty_open_wr') > 0 && this.wo_upd_view_wo_progress.getFieldValue('wo.date_issued') != "") {
            this.wo_upd_view_wr_report.actions.get('complete').show(true);
        }
        else {
            this.wo_upd_view_wr_report.actions.get('complete').show(false);
        }
    },
    
    wo_upd_view_wr_report_afterRefresh: function(){
    	if(this.wo_upd_view_wr_report.rows.length>0){
    		var firstWrId = this.wo_upd_view_wr_report.rows[0]['wr.wr_id'];
    		var priorityLabel = '';
    		try {
    			priorityLabel = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-getPriorityLable', parseInt(firstWrId)).message;
    		} 
    		catch (e) {
    		}
    		
    		this.wo_upd_view_wo_form.setFieldValue('priorityLabel', priorityLabel);
    	}
    }
});

/**
 * Close Work order<br />
 * Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#closeWorkOrder(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-closeWorkOrder</a><br />
 * Called by 'Close Work Order' button<br />
 * Reloads select tab
 */
function closeWorkOrder(){
    var panel = View.panels.get('wo_upd_view_wo_form');
    var woId = panel.getFieldValue('wo.wo_id');
	var result = {};
	try {
		 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-closeWorkOrder', woId);
	} 
   	catch (e) {
		if (e.code == 'ruleFailed') {
            View.showMessage(e.message);
        }
        else {
            Workflow.handleError(e);
        }
		return;
 	}
    if (result.code == 'executed') {        
        View.parentTab.parentPanel.selectTab('select');
    }
    else{
       Workflow.handleError(result);
    }
}

/**
 * Print Work order<br />
 * Opens dialog to export pdf from current workorder
 */
function printWO(){
    var panel = View.panels.get('wo_upd_view_wo_form');
    var woId = panel.getFieldValue('wo.wo_id');
    var restriction = new Ab.view.Restriction();
    restriction.addClause('wo.wo_id', woId, '=');
    View.openDialog("ab-paginated-report-job.axvw?viewName=ab-helpdesk-workorder-print.axvw", {"woDS": restriction});
}
