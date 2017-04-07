
/**
 * Create restriction and refresh panels
 */
var wrDetailController = View.createController('wrDetailController', {
    wo_issue_detl_wr_form_afterRefresh: function(){
        var record = this.wo_issue_detl_wr_form.getRecord();
        var wr = record.getValue('wr.wr_id');
        this.wo_issue_detl_wr_loc.setRecord(record);
        this.wo_issue_detl_wr_cost.setRecord(record);
        
        this.wo_issue_detl_wr_loc.show();
        this.wo_issue_detl_wr_cost.show();
        
        var cfrest = new Ab.view.Restriction();
        cfrest.addClause("wrcf.wr_id", wr, '=');
        this.wo_issue_detl_cf_report.refresh(cfrest);
        
        var tlrest = new Ab.view.Restriction();
        tlrest.addClause("wrtl.wr_id", wr, '=');
        this.wo_issue_detl_tl_report.refresh(tlrest);
        
        var ptrest = new Ab.view.Restriction();
        ptrest.addClause("wrpt.wr_id", wr, '=');
        this.wo_issue_detl_pt_report.refresh(ptrest);
        
        var otherrest = new Ab.view.Restriction();
        otherrest.addClause("wr_other.wr_id", wr, '=');
        this.wo_issue_detl_other_report.refresh(otherrest);
    }
    
});

function cancelWr(){
    var panel = View.getControl('', 'wo_issue_detl_wr_form');
    var wrId = panel.getFieldValue("wr.wr_id");

    //kb:3024805
	var result = {};
	//Cancel work requests ,file='WorkRequestHandler.java'.
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
        View.getOpenerView().controllers.get(0).refreshGridPanel();
        View.closeThisDialog();
    }
    else {
        Workflow.handleError(result);
    }
}
