/**
 * Called when loading the form
 * <div class='detailHead'>Pseudo-code:</div>
 *	<ol>
 *		<li>Display 'Close Work Order' button for open work order (date_completed empty)</li>
 * 		<li>Create restriction and refresh work request list</li>
 *	</ol>
 */
var woUpdateController = View.createController('woUpdateController', {
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
    }
});

/**
 * Close Work order<br />
 * Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#closeWorkOrder(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-closeWorkOrder</a><br />
 * Called by 'Close Work Order' button<br />
 * Reloads select tab
 */
function closeWorkOrder(){
    var panel = View.getControl('', 'wo_upd_view_wo_form');
    var woId = panel.getFieldValue('wo.wo_id');

    //kb:3024805
	var result = {};
	//Close work order by calling closeWorkOrder which belong to  WorkRequestHandler.java
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
        var parameter = {
            tableName: 'hwr',
            fieldNames: toJSON(['hwr.wr_id', 'hwr.wo_id']),
            restriction: 'hwr.wo_id = ' + woId
        };
        //kb:3024805
		var hwrResult = {};
        try {
            hwrResult = Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameter);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        if (hwrResult.code == 'executed') {
            for (var i = 0; i < hwrResult.data.records.length; i++) {
                var wr_id = hwrResult.data.records[i]['hwr.wr_id'];
                updateEquipment(wr_id);
            }
        }
        else {
            View.showMessage(hwrResult.message);
        }
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
    var panel = View.getControl('', 'wo_upd_view_wo_form');
    var woId = panel.getFieldValue('wo.wo_id');
    var restriction = new Ab.view.Restriction();
    restriction.addClause('wo.wo_id', woId, '=');
    View.openDialog("ab-paginated-report-job.axvw?viewName=ab-pm-issue-wo-print.axvw", {
        'ds_ab-pm-issue-wo-print_paginated_wo': restriction
    });
}
