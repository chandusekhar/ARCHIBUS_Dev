/**
 * Create restriction and refresh panels
 */
var wrDetailController = View.createController('wrDetailController', {
    issue_wr_detl_wr_basic_afterRefresh: function(){
        var record = this.issue_wr_detl_wr_basic.getRecord();
        var wr = record.getValue("wr.wr_id");
        
        this.issue_wr_detl_wr_loc.setRecord(record);
        this.issue_wr_detl_wr_cost.setRecord(record);
        
        this.issue_wr_detl_wr_loc.show();
        this.issue_wr_detl_wr_cost.show();
        
        var cfrest = new Ab.view.Restriction();
        cfrest.addClause("wrcf.wr_id", wr, '=');
        this.issue_wr_detl_cf_report.refresh(cfrest);
        
        var tlrest = new Ab.view.Restriction();
        tlrest.addClause("wrtl.wr_id", wr, '=');
        this.issue_wr_detl_tl_report.refresh(tlrest);
        
        var ptrest = new Ab.view.Restriction();
        ptrest.addClause("wrpt.wr_id", wr, '=');
        this.issue_wr_detl_pt_report.refresh(ptrest);
        
        var otherrest = new Ab.view.Restriction();
        otherrest.addClause("wr_other.wr_id", wr, '=');
        this.issue_wr_detl_other_report.refresh(otherrest);
    }
    
});

function issueWO(){
    View.confirm(getMessage('confirmMessage'), function(button){
        if (button == 'yes') {
            var panel = View.getControl('', 'issue_wr_detl_wr_basic');
            var woId = panel.getFieldValue('wr.wo_id');
            //kb:3024805
			var result = {};
			//Issue work order,file='WorkRequestHandler.java'
            try {
                result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-issueWorkorder', woId);
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
                panel.refresh();
            }
            else {
                Workflow.handleError(result);
            }
        }
    });
}

/**
 * Print Work order<br />
 * Opens dialog to export pdf from current workorder
 * @param {String} form current form
 * @param {String} strSerialized
 */
function printWO(){
    var panel = View.getControl('', 'issue_wr_detl_wr_basic');
    var woId = panel.getFieldValue('wr.wo_id');
    //Guo changed 2009-08-28 to fix KB3023503
    if (woId) {
        var restriction = new Ab.view.Restriction();
        restriction.addClause('wo.wo_id', woId, '=');
        View.openDialog("ab-paginated-report-job.axvw?viewName=ab-pm-issue-wo-print.axvw", {
            'ds_ab-pm-issue-wo-print_paginated_wo': restriction
        });
    }
}

function cancelWr(){
    var panel = View.getControl('', 'issue_wr_detl_wr_basic');
    var wrId = panel.getFieldValue('wr.wr_id');
    //kb:3024805
	var result = {};
	//Cancel work requests , file='WorkRequestHandler.java'.
    try {
        result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-cancelWorkRequest', wrId);
    } 
    catch (e) {
		if (e.code == 'ruleFailed'){
			View.showMessage(e.message);
		}else{
		    Workflow.handleError(e);
		}
		return;
    }
    if (result.code == 'executed') {
        View.parentTab.parentPanel.selectTab('select');
    }
    else {
        Workflow.handleError(result);
    }
}
