
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
    options: [],
	locArray:[],
    wo_upd_wr_form_afterRefresh: function(){
		$('showFloorPlan').value=getMessage('showFloorPlan');
        var record = this.wo_upd_wr_form.getRecord();
        createStatusSelectList(this.wo_upd_wr_form);
        
        this.wo_upd_cf_form.setRecord(record);
        this.wo_upd_cost_form.setRecord(record);
        
        this.wo_upd_cf_form.show();
        this.wo_upd_cost_form.show();
        
        var wrId = this.wo_upd_wr_form.getFieldValue('wr.wr_id');
        var restriction = new Ab.view.Restriction();
        restriction.addClause('wr.wr_id', wrId, '=');
        this.wo_upd_cf_form.restriction = restriction;
        
        showVerificationAction(this.wo_upd_wr_form);
        
        //KB3037458 - disable show floor plan button when fl_id is empty
        var flId = this.wo_upd_wr_form.getFieldValue('wr.fl_id');
        if(flId){
        	$('showFloorPlan').disabled = false;
        }else{
        	$('showFloorPlan').disabled = true;
        }
        
        this.setPriorityLabel();
    },
    
	 /**
	 * Check if exists my approved requests.
	 */
	setPriorityLabel: function() {
		var priorityLabel = '';
		try {
			priorityLabel = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-getPriorityLable', parseInt(this.wo_upd_wr_form.getFieldValue('wr.wr_id'))).message;
		} 
		catch (e) {
		}
		
		this.wo_upd_wr_form.setFieldValue('priorityLabel', priorityLabel);
    },
    
    wo_upd_cf_form_afterRefresh: function(){
        showVerificationAction(this.wo_upd_wr_form);
    }
});
function showFloorDrawing(){
	showFloorPlan('wo_upd_wr_form',['wr.bl_id','wr.fl_id','wr.rm_id']);
}

function selectProblemResolutionCode(){
	View.selectValue("wo_upd_cf_form", getMessage('ProblemResolution'), ["wr.cf_notes"], "pr", ["pr.pr_description"], ["pr.pr_id", "pr.pr_description"], {});
}
