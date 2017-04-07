/**@lei
 * @fileoverview Javascript functions for <a href='../../../viewdoc/overview-summary.html#ab-helpdesk-workorder-manager-workorder.axvw' target='main'>ab-helpdesk-workorder-manage-workorder.axvw</a>
 */
/**
 * Called when loading the form<br />
 * Set priority value
 */
function user_form_onload(){
    document.getElementById("priority").value = document.getElementById("wo.priority").value;
    if (document.getElementById("wo.wo_id").value != "") {
        var report = AFM.view.View.getControl('', 'wr_report');
        var rest = {
            "wr.wo_id": document.getElementById("wo.wo_id").value
        }
        report.refresh(rest)
    }
}

/**
 * Saves workorder<br />
 * Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#saveWorkorder(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-saveWorkorder</a><br />
 * Called by 'Save Work Order' button<br />
 * Reloads details tab page
 * @param {String} formName current form
 */
function onSave(formName){
	
    var record = ABODC_getDataRecord2(View.panels.get(formName));
    var result = {};
    try {
		 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-saveWorkorder', record);
	}catch(e){
		Workflow.handleError(result);
	}
    if (result.code == 'executed') {
        res = eval('(' + result.jsonExpression + ")");
        wo_id = res.wo_id;
        var rest = new AFM.view.Restriction();
        rest.addClause("wo.wo_id", wo_id, "=");
        View.selectTabPage("details", rest, "");
    }
    else {
        Workflow.handleError(result);
    }
}

/**
 * Selects tab edit_workrequest with the restriction for a new work request record
 */
function addWorkRequest(){
    top.wo_id = document.getElementById("wo.wo_id").value;
    
    AFM.view.View.selectTabPage("edit_workrequest", null, null, true);
}

