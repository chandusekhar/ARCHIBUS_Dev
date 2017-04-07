var lastStepLogId;

/**
 * Called when form is loading<br />
 * <div class='detailHead'>Pseudo-code:</div>
 *	<ol>
 *		<li>Take tabs restriction and reload form</li>
 * 		<li><a href='#createStatusSelectList'>Create selection list for the status</a> according to the current status</li>
 *	</ol>
 */
var wrDetailUpdateController = View.createController('wrDetailUpdateController', {
    wr_upd_detl_wr_basic_afterRefresh: function(){
        var record = this.wr_upd_detl_wr_basic.getRecord();
        createStatusSelectList(this.wr_upd_detl_wr_basic);
        
        this.wr_upd_detl_wr_cf.setRecord(record);
        this.wr_upd_detl_wr_cost.setRecord(record);
        
        this.wr_upd_detl_wr_cf.show();
        this.wr_upd_detl_wr_cost.show();
        
        var wrId = this.wr_upd_detl_wr_basic.getFieldValue('wr.wr_id');
        var restriction = new Ab.view.Restriction();
        restriction.addClause('wr.wr_id', wrId, '=');
        this.wr_upd_detl_wr_cf.restriction = restriction;
        
        showVerificationAction(this.wr_upd_detl_wr_basic);
    },
    
    wr_upd_detl_wr_cf_afterRefresh: function(){
        showVerificationAction(this.wr_upd_detl_wr_basic);
    }
});

function closeWorkRequest(){
    var panel = View.getControl('', 'wr_upd_detl_wr_basic');
    var record = ABPMC_getDataRecord(panel);
    
    //kb:3024805
	var result = {};
	//Close one work request by calling method closeWorkRequests which belong to WorkRequestHandler.java
    try {
        result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-closeWorkRequest', record);
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
        var wrId = record.getValue('wr.wr_id');
        updateEquipment(wrId)
        View.parentTab.parentPanel.selectTab('select');
    }
    else {
        Workflow.handleError(result);
    }
}
