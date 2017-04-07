var abHpdMgrOverviewWrDetailController = View.createController("abHpdMgrOverviewWrDetailController",{
	
	requestPanel_beforeRefresh: function(){
		document.getElementById("comments").value = '';	 
	},
	
	requestPanel_afterRefresh: function(){ 
		this.doPrepareWork();
    },	
	
	doPrepareWork: function(){
		 
		var activityLogId = this.requestPanel.getFieldValue("activity_log_hactivity_log.activity_log_id");
		var record = this.requestPanel.getRecord();
		
		this.locationPanel.setRecord(record);
		this.equipmentPanel.setRecord(record);
		this.descriptionPanel.setRecord(record);
		this.priorityPanel.setRecord(record);
		this.documentsPanel.setRecord(record);
		this.stepPanel.setRecord(record);
		
		this.locationPanel.show(true);
		this.equipmentPanel.show(true);
		this.descriptionPanel.show(true);
		this.priorityPanel.show(true);
		this.documentsPanel.show(true);
		this.historyPanel.show(true);
		this.stepPanel.show(true);
		
		var wrId = this.requestPanel.getFieldValue("wr.wr_id");
		var actType = this.descriptionPanel.getFieldValue("activity_log.activity_type");
		
		var quest = new Ab.questionnaire.Quest(actType, 'descriptionPanel', true);
		quest.showQuestions();
		
				
		ABHDC_checkHiddenFields(actType,this.equipmentPanel,this.locationPanel,this.documentsPanel,this.priorityPanel);
		ABHDC_getStepInformation("wr","wr_id",wrId,this.historyPanel,"history",true);
		ABHDC_showPriorityLevel("wr","wr_id","priority",this.priorityPanel,"wr.priority");
		ABHDC_hideEmptyDocumentPanel("wr",this.documentsPanel);
		ABHDC_showPanelByFieldValue("wr.eq_id",this.equipmentPanel,'');
		
		if(this.stepPanel.getFieldValue("wr_step_waiting.step_type") == 'approval'){
			hideWRApprovalFields();
			showWRApprovalFields();
		}	
	},
	
	historyPanel_afterRefresh: function(){
		ABHDC_reloadHistoryPanel(this.historyPanel);
    }
});

/**
 * Approve work request<br />
* Calls WFR AbBldgOpsOnDemandWork-approveWorkRequest<br />
* Reloads wr tab<br />
* Called by the 'Approve' button which is shown if the step_type='approval' 
* @param {String} formName current form
*/
function approveRequest(formName){

    var panel = View.panels.get("requestPanel");
	var record = ABHDC_getDataRecord2(panel);                     
    var id = panel.getFieldValue("wr.wr_id");
	var comments = document.getElementById("comments").value;
	
    try {
		var result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-approveWorkRequest', record,comments);
	}catch(e){
		Workflow.handleError(e);
	}

	if(result.code == 'executed'){
		ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_mgr_overview_wr_select"] = true;
		View.parentTab.parentPanel.selectTab('wr');
	} else {
		Workflow.handleError(result);
	}
}

/**
 * Reject workrequest<br />
* Calls WFR AbBldgOpsOnDemandWork-rejectWorkRequest<br />
* Reloads wr tab<br />
* Called by the 'Reject' button which is shown if the step_type='approval'
* @param {String} formName current form
*/
function rejectRequest(){
	var panel = View.panels.get("requestPanel");
	var record = ABHDC_getDataRecord2(panel);                     
  	var id = panel.getFieldValue("wr.wr_id");
  	var comments = document.getElementById("comments").value;
  	
	try {
		var result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-rejectWorkRequest',  record, comments);
	}catch(e){
		Workflow.handleError(e);
	}

	if(result.code == 'executed'){
		ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_mgr_overview_wr_select"] = true;
		View.parentTab.parentPanel.selectTab('wr');
	} else {
		Workflow.handleError(result);
	}
}

/**
 * Verify workrequest<br />
* Calls WFR AbBldgOpsOnDemandWork-verifyWorkRequest<br />
* Reloads wr tab<br />
* Called by the 'Request can be closed' button which is shown if the step_type='verification'
* @param {String} formName current form
*/
function verifyRequest(){
	
	var panel = View.panels.get("requestPanel");
	var record = ABHDC_getDataRecord2(panel);                     
  
    try {
		var result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-verifyWorkRequest', record);
	}catch(e){
		Workflow.handleError(e);
	}

	if(result.code == 'executed'){
		ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_mgr_overview_wr_select"] = true;
		View.parentTab.parentPanel.selectTab('wr');
	} else {
		Workflow.handleError(result);
	}
}

/**
 * Return workrequest<br />
* Calls WFR AbBldgOpsOnDemandWork-returnWorkRequest<br />
* Reloads wr tab<br />
* Called by the 'Return Work Request as Incomplete' button which is shown if the step_type='verification'
* @param {String} formName current form
*/
function returnRequest(){
	var panel = View.panels.get("requestPanel");
	var record = ABHDC_getDataRecord2(panel);                     
    
    try {
		var result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-returnWorkRequest',  record);
	}catch(e){
		Workflow.handleError(e);
	}

	if(result.code == 'executed'){
		ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_mgr_overview_wr_select"] = true;
		View.parentTab.parentPanel.selectTab('wr');
	} else {
		Workflow.handleError(result);
	}
}

/**
 * Hide all form fields which may be required for some approval types
 * <ul>
 * 	<li>Account code</li>
 * </ul>
 */
function hideWRApprovalFields(){
	field = $('wr.ac_id');	
	field.parentNode.parentNode.style.display = "none"; 
}

/**
 * Show form fields depending on approval type<br />
 * Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/steps/StepHandler.html#getRequiredFieldsForStep(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-getRequiredFieldsForStep</a>
 */
function showWRApprovalFields() {

	var stepPanel = View.panels.get("stepPanel");
	var approval_type = stepPanel.getFieldValue("wr_step_waiting.step");
	
	var descriptionPanel = View.panels.get("descriptionPanel");
	var status = descriptionPanel.getFieldValue("wr.status");
	
	try {
		var result = Workflow.callMethod('AbBldgOpsHelpDesk-StepService-getRequiredFieldsForStep', approval_type, status);
	}catch(e){
		Workflow.handleError(e);	
	}
	
	if(result.code == 'executed'){
		var res = eval('('+result.jsonExpression+')');
		for(i=0;i<res.length;i++){
			field = $('wr.'+res[i].field);
			field.parentNode.parentNode.style.display = ''; 
			//field.parentNode.parentNode.removeAttribute("style");
		}	
	} else {
		Workflow.handleError(result);	
	}
}

/**
 * Opens popup with estimation for current request<br />
 * Called by 'Show Estimation' button
 */
function onShowEstimation(){
 	var panel = View.panels.get("requestPanel");
	
	var restriction = {
		"wr.wr_id" : panel.getFieldValue("wr.wr_id")
	};
	
	View.openDialog("ab-helpdesk-workrequest-estimation.axvw",restriction,false);
}

/**
 * Opens popup with schedule for current request<br />
 * Called by 'Show Schedule' button
 */
function onShowSchedule(){
	var panel = View.panels.get("requestPanel");
	
	var restriction = {
		"wr.wr_id" : panel.getFieldValue("wr.wr_id")
	};
	View.openDialog("ab-helpdesk-workrequest-scheduling.axvw",restriction,false);
}