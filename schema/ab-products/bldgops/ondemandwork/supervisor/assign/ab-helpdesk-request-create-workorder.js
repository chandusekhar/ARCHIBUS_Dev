/**
 * @fileoverview Javascript functions for <a href='../../../viewdoc/overview-summary.html#ab-helpdesk-request-create-workorder.axvw' target='main'>ab-helpdesk-request-create-workorder.axvw</a>
 */
/**
 * Called when form is loading<br />
 * If opener has attribute WRrecords (JSONarray of wr.wr_id's) and length is not 0 <a href='#showHelpRequests'>show help requests</a><br />
 * Else hide help request panel
 *
 */
var abHelpdeskRequestViewController = View.createController("abHelpdeskRequestViewController", {

    afterViewLoad: function(){
        var recs = View.getOpenerView().WRrecords;
        if (recs.length > 0) {
            showHelpRequests(recs);
        }
        else {
            hidePanel("helpRequest_panel");
        }
    }
});
var activity_log_id_to_link = 0;
var linkTo = false;

/**
 * Called when checkbox to link the work order to a help request is changed
 * @param {Boolean} link link help request to work order or not
 */
function linkHelpRequest(link){
    if (link) {
        linkTo = true;
    }
    else {
        linkTo = false;
    }
}

/**
 * Show help request to which the work order can be linked<br />
 * Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#getHelpRequestsForWorkRequests(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-getHelpRequestsForWorkRequests</a><br />
 * The WFR returns a JSONArray with help requests linked to the selected work requests. <br />
 * If this is only 1 help request, the work order can be linked to this request, so the checkbox can be shown<br />
 * Otherwise the checkbox stays hidden.
 * @param {Array} recs selected work requests from opening window
 */
function showHelpRequests(recs){
	var result = {};
	try {
		 result = Workflow.callMethod("AbBldgOpsOnDemandWork-WorkRequestService-getHelpRequestsForWorkRequests", recs);
	}catch(e){
		 Workflow.handleError(e);
	}
    if (result.code == 'executed') {
        var jsonArray = eval('(' + result.jsonExpression + ')');
        if (jsonArray.length == 1) {
            activity_log_id_to_link = jsonArray[0];
            document.getElementById("linkToHelpRequest").innerHTML = getMessage("linkToHelpRequest") + jsonArray[0];
        }
        else {
            document.getElementById("linkTo").style.display = 'none';
        }
    }
    else {
        Workflow.handleError(result);
    }
}

function onSave(){
    var woPanel = View.panels.get("wo_panel");
    var description = View.panels.get('wo_panel').getFieldValue('wo.description');
    
    if (description == "") {
        woPanel.clearValidationResult();
        woPanel.addInvalidField("wo.description", getMessage("noDescription"));
        woPanel.displayValidationResult();
        return;
    }
    
    var record = woPanel.getFieldValues();
    
    var recs = View.getOpenerView().WRrecords;
	var result = {};
    if (recs != undefined) {
        if (linkTo && activity_log_id_to_link != 0) {
			try {
				 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-saveNewWorkorder',
										 	record,
								 			recs,
											activity_log_id_to_link,
											"");
											} 
   			catch (e) {
				 Workflow.handleError(e);
 				}
        }
        else {
            try {
					 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-saveNewWorkorder', record, recs,"","");
			} 
			catch (e) {
				Workflow.handleError(e);
			}
			
        }
    }
    else {
    
        var activity_log_id = View.getOpenerView().activity_log_id;
        if (activity_log_id != undefined) {
		try {
			 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-saveNewWorkorder', record,[],"",activity_log_id);
		 } catch (e) {
				Workflow.handleError(e);
			}
        }
    }
    
    if (result.code == 'executed') {
    
        var res = eval('(' + result.jsonExpression + ')');
        alert(getMessage("createdWO") + res.wo_id);
        var opennerView = View.getOpenerView();
        var tabs = opennerView.parentTab.parentPanel;
        tabs.selectTab('select');
        opennerView.closeDialog();
    }
    else {
        Workflow.handleError(result);
    }
}

function setPriorityValue() {
	var selectedEL = document.getElementById("priority");
	var priorityValue = selectedEL.options[selectedEL.selectedIndex].value
	var panel = View.panels.get("wo_panel");
	panel.setFieldValue("wo.priority", priorityValue);
}

