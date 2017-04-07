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
	locArray:[],
    wr_upd_detl_wr_basic_afterRefresh: function(){
		$('showFloorPlan').value=getMessage('showFloorPlan');
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
        
        //KB3037458 - disable show floor plan button when fl_id is empty
        var flId = this.wr_upd_detl_wr_basic.getFieldValue('wr.fl_id');
        if(flId){
        	$('showFloorPlan').disabled = false;
        }else{
        	$('showFloorPlan').disabled = true;
        }
    },
    
    wr_upd_detl_wr_cf_afterRefresh: function(){
        showVerificationAction(this.wr_upd_detl_wr_basic);
    }
});

function showFloorDrawing(){
	showFloorPlan('wr_upd_detl_wr_basic',['wr.bl_id','wr.fl_id','wr.rm_id']);
}

function closeWorkRequest(){
    var panel = View.panels.get('wr_upd_detl_wr_basic');
    var record = ABODC_getDataRecord2(panel);
    
	var result = {};
    try {
		result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-closeWorkRequest', record);
    }catch (e) {
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
