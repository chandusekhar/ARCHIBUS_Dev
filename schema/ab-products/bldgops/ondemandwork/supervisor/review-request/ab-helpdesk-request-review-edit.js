/**
 * @fileoverview Javascript functions for <a href='../../../viewdoc/overview-summary.html#ab-helpdesk-request-review-edit.axvw' target='main'>ab-helpdesk-request-review-edit.axvw</a>
 */
var reviewEditTabController = View.createController('reviewEditTab', {

    /**
     * Called when loading the form
     * <div class='detailHead'>Pseudo-code:</div>
     *	<ol>
     *		<li>Hide equipment panel if empty</li>
     * 		<li>Show label for priority level</li>
     * 		<li><a href='#showPossibleWorkRequests'>Show possible work requests</a> to link to</li>
     * 		<li><a href='#showDocuments'>Show documents</a></li>
     * 		<li>Show workflow step history</li>
     *	</ol>
     */
    panel_request_afterRefresh: function(){
        if (!valueExists(this.panel_request.restriction)) {
            return;
        }
        this.loadPanelsRecord();
        hideEmptyEquipmentPanel();
        ABODC_showPriorityLevel('activity_log', 'activity_log_id', 'priority', this.panel_priority, 'activity_log.priority');
        showDocuments();
        showPossibleWorkRequests();
		
        ABODC_getStepInformation('activity_log', 'activity_log_id', this.panel_request.getFieldValue('activity_log.activity_log_id'), this.panel_history, 'history', true);
    },
    loadPanelsRecord: function(){
        var loadedRecord = this.panel_request.getRecord();
        this.panel_location.setRecord(loadedRecord);
        this.panel_equipment.setRecord(loadedRecord);
        this.panel_description.setRecord(loadedRecord);
        this.panel_priority.setRecord(loadedRecord);
        this.panel_documents.setRecord(loadedRecord);
    },
	
	panel_history_afterRefresh: function(){
		ABODC_reloadHistoryPanel(this.panel_history);
    }
})


/**
 * Hide equipment panel if no equipment is entered for current request
 */
function hideEmptyEquipmentPanel(){
    var eqPanel = View.panels.get('panel_equipment');
    if (eqPanel.getFieldValue("activity_log.eq_id") == "") {
        eqPanel.show(false);
    }
}


/**
 * Show document of help request to copy to work request<br />
 * Called by <a href='#user_form_onload' target='main'>user_form_onload</a>
 */
function showDocuments(){
	var docsPanel = View.panels.get("panel_documents");
    for (i = 1; i <= 4; i++) {
    	if (docsPanel.getFieldValue("activity_log.doc" + i) == "") {
            $("doc" + i).style.display = "none";
        } else {
        	//$("doc" + i).disabled = true;
        	$("doc" + i).style.display = "";
        }
    }
}

/**
 * Create a grid with work requests records selected by the workflowrule<br />
 * Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#getSimilarWorkRequests(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-getSimilarWorkRequests</a><br />
 * The grid has row buttons to <a href='#selectWr'>select a work request</a> to link to current help request to<br />
 * The selected work requests have the same problem type, location and equipment (if given) as the current help request
 */
function showPossibleWorkRequests(){
    var activity_log_id = View.panels.get("panel_request").getFieldValue("activity_log.activity_log_id");
    document.getElementById("wr_grid").innerHTML = "";
	var result = {};
    try {
		 result = Workflow.callMethod("AbBldgOpsOnDemandWork-WorkRequestService-getSimilarWorkRequests", activity_log_id);
	 } 
   	catch (e) {
		Workflow.handleError(e);
 	}
    if (result.code == 'executed') {
        var wrs = eval('(' + result.jsonExpression + ')');
        if (wrs.length == 0) {
            View.panels.get('panel_wr').show(false);
        }
        else {
            var columns = [new Ab.grid.Column('wr.select', '', 'button', selectWorkRequest), 
						   new Ab.grid.Column('wr.wr_id', getMessage("workRequestCode"), 'number'), 
						   new Ab.grid.Column('wr.prob_type', getMessage("problemType"), 'text'), 
						   new Ab.grid.Column('wr.bl_id', getMessage("buildingCode"), 'text'), 
						   new Ab.grid.Column('wr.fl_id', getMessage("floorCode"), 'text'), 
						   new Ab.grid.Column('wr.rm_id', getMessage("roomCode"), 'text'), 
						   new Ab.grid.Column('wr.eq_id', getMessage("equipmentCode"), 'text'), 
						   new Ab.grid.Column('wr.status', getMessage("status"), 'text'), 
						   new Ab.grid.Column('wr.description', getMessage("description"), 'text')];
            columns[0].text = getMessage("select");
            
            var configObj = new Ab.view.ConfigObject();
			doneRows(wrs);
            configObj['rows'] = wrs;
            configObj['columns'] = columns;
            
            // create new Grid component instance
            var wr_grid = new Ab.grid.Grid('wr_grid', configObj);
            wr_grid.build();
        }
    }
    else {
        Workflow.handleError(result);
    }
}

function doneRows(rows){
	for (var i=0,row;row=rows[i];i++){
		row["wr.wr_id"] += "";
		row["wr.bl_id"] += "";
		row["wr.fl_id"] += "";
		row["wr.rm_id"] += "";
		row["wr.eq_id"] += "";
	}
}

/**
 * Select a work request to link the current help request to<br />
 * Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#linkHelpRequestToWorkRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-linkHelpRequestToWorkRequest</a><br />
 * Called by a row button in the grid with work requests
 *
 * @param evt event
 * @param row grid row object
 * @param column grid column object
 */
function selectWorkRequest(row){

    if (confirm(getMessage("confirmLink"))) {
        var wr_id = row['wr.wr_id'];
        var activity_log_id = View.panels.get("panel_request").getFieldValue("activity_log.activity_log_id");
		var result = {};
		try {
			 result = Workflow.callMethod("AbBldgOpsOnDemandWork-WorkRequestService-linkHelpRequestToWorkRequest", wr_id,activity_log_id);
         } 
   		catch (e) {
		Workflow.handleError(e);
 		}
		if (result.code == 'executed') {
			changeTab("select",{});
        }
        else {
            Workflow.handleError(result);
        }
    }
    
    
}

/**
 * Create a work request based on the current help request and link to it<br />
 * Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#createWorkRequestFromHelpRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-createWorkRequestFromHelpRequest</a><br />
 * Reloads select tab page
 * @param {String} form current form
 */
function createWorkRequest(){
    if (confirm(getMessage("confirmCreate"))) {
        var activity_log_id = View.panels.get("panel_request").getFieldValue("activity_log.activity_log_id");
        var records = [{
            'activity_log.activity_log_id': activity_log_id
        }];
        
        var documents = new Array();
        
        for (i = 1; i <= 4; i++) {
            var field = document.getElementById("doc" + i);
            if (field.checked) {
                documents.push(field.value);
            }
        }
		var result = {};
        try {
			 result = Workflow.callMethod("AbBldgOpsOnDemandWork-WorkRequestService-createWorkRequestFromHelpRequest", records,documents);
          } 
   		catch (e) {
		Workflow.handleError(e);
 		}
		if (result.code == 'executed') {
            var res = eval('(' + result.jsonExpression + ')');
			
            var rest = new Ab.view.Restriction();
            rest.addClause("wr.wr_id", res[0].wr_id, "=");
			changeTab("WRdetails",rest);
        }
        else {
            Workflow.handleError(result);
        }
    }
}

/**
 * Opens popup window with contract information for given equipment<br />
 * Called by the 'Show Contracts' button from a request form with an equipment given
 */
function onShowContracts(tableName){
    if (!valueExists(tableName)) 
        tableName = 'activity_log';
    
    var eq_id = View.panels.get('panel_equipment').getFieldValue(tableName + ".eq_id");
    if (eq_id != "") {
        var restriction = new Ab.view.Restriction();
        restriction.addClause("eq.eq_id", eq_id, '=');
        View.openDialog("ab-helpdesk-request-equipment.axvw", restriction, false);
    }
}

function changeTab(TabName,restriction){
	var tabs = View.getControl('', 'reviewRequestTabs');
    tabs.selectTab(TabName, restriction, false);
}
