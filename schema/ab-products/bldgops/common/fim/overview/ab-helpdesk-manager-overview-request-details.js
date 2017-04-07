var abHpdMgrOverviewReqDetailController = View.createController("abHpdMgrOverviewReqDetailController",{
	
	requestPanel_beforeRefresh: function(){
		document.getElementById("comments").value = '';	 
	},
	
	requestPanel_afterRefresh: function(){ 
		this.doPrepareWork();
    },	
	
	/**
	* Called when loading the form
	* <div class='detailHead'>Pseudo-code:</div>
	*	<ol>
	* 		<li>Show 'Close Request' button if status is 'Completed'</li>
	* 		<li>Show 'Archive Request' button if status is 'Closed'</li>
	* 		<li>Show questionnaire answers</li>
	* 		<li>Show request fields according the request type</li>
	* 		<li>Show workflow step history</li>
	* 		<li>Show priority label</li>
	* 		<li>Hide documents, costs, satisfaction and/or equipment panels if empty</li>
	* 	</ol>
	*/
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
		
		var activityLogId = this.requestPanel.getFieldValue("activity_log.activity_log_id");
		var actType = this.descriptionPanel.getFieldValue("activity_log.activity_type");
		
		var quest = new Ab.questionnaire.Quest(actType, 'descriptionPanel', true);
		quest.showQuestions();
		
		ABHDC_checkHiddenFields(actType,this.equipmentPanel,this.locationPanel,this.documentsPanel,this.priorityPanel);
		ABHDC_getStepInformation("activity_log","activity_log_id",activityLogId,this.historyPanel,"history",true);
		ABHDC_showPriorityLevel("activity_log","activity_log_id","priority",this.priorityPanel,"activity_log.priority");
		ABHDC_hideEmptyDocumentPanel("activity_log",this.documentsPanel);
		ABHDC_showPanelByFieldValue("activity_log.eq_id",this.equipmentPanel,'');
		
		
		if(this.stepPanel.getFieldValue("activity_log_step_waiting.step_type") == 'approval'){
			handleApprovalFields("activity_log",this.stepPanel,this.descriptionPanel);
		}	
		
		ABHDC_showPanelByFieldValue("activity_log_step_waiting.step_type",this.stepPanel,'survey');
		
	},
	
	historyPanel_afterRefresh: function(){
		ABHDC_reloadHistoryPanel(this.historyPanel);
    }
	
});

function handleApprovalFields(tableName,approvalPanel,statusPanel){
		
	if(!valueExists(approvalPanel)
			|| !valueExists(tableName)
			|| !valueExists(statusPanel)){
		alert("the approvalPanel parameter is invalid!");
		return;	
	}
	
	var element = approvalPanel.getFieldElement(tableName + ".ac_id");
	if(element.value == ''){
		element.parentNode.parentNode.style.display = 'none'; 
	}
	
	element = approvalPanel.getFieldElement(tableName + ".po_id");
	if(element.value == ''||element.value == '0'){
		element.parentNode.parentNode.style.display = 'none'; 
	}
	
	element = approvalPanel.getFieldElement(tableName + ".cost_estimated");
	if(element.value == ''||element.value == '0.00'){
		element.parentNode.parentNode.style.display = 'none'; 
	}
	
	element = approvalPanel.getFieldElement(tableName + ".cost_to_replace");
	if(element.value == ''||element.value == '0.00'){
		element.parentNode.parentNode.style.display = 'none'; 
	}
	
	element = approvalPanel.getFieldElement(tableName + ".cost_cat_id");
	if(element.value == ''){
		element.parentNode.parentNode.style.display = 'none'; 
	}
	
	//------------------------------------------------------------------
	var approval_type = approvalPanel.getFieldValue(tableName + "_step_waiting.step");
	var status = statusPanel.getFieldValue(tableName + ".status");
	
	try {
		var result = Workflow.callMethod('AbBldgOpsHelpDesk-StepService-getRequiredFieldsForStep', approval_type, status);
	}catch(e){
		Workflow.handleError(e);	
	}
	

	if(result.code == 'executed'){
		var res = eval('('+result.jsonExpression+')');
		for(i=0;i<res.length;i++){
			field = approvalPanel.getFieldElement(tableName + "." + res[i].field);
			//field.parentNode.parentNode.removeAttribute("style") ;
			if(valueExists(field)){
				field.parentNode.parentNode.style.display = '';
			} 
		}	
	} else{
		Workflow.handleError(result);	
	}	
} 



/**
* Approve request<br />
* Calls WFR <a href='../../../../javadoc/com/archibus/eventhandler/helpdesk/RequestHandler.html#approveRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-approveRequest</a><br />
* Reloads request tab<br />
* Called by 'Approve' button which is shown if the workflow step type is 'approval'
* @param {String} formName current form
*/
function approveRequest(){
	
	var requestPanel = View.panels.get("requestPanel");
	var record = ABHDC_getDataRecord2(requestPanel);     
	var comments = document.getElementById("comments").value;
	
    try {
		var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-approveRequest', record,comments);
	}catch(e){
		Workflow.handleError(e);
	}

	if(result.code == 'executed'){
		ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_mgr_overview_request_select"] = true;
		View.parentTab.parentPanel.selectTab("request");
	} else {
		Workflow.handleError(result);
	}
}


/**
* Reject request<br />
* Calls WFR <a href='../../../../javadoc/com/archibus/eventhandler/helpdesk/RequestHandler.html#rejectRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-rejectRequest</a><br />
* Reloads request tab<br />
* Called by 'Reject' button which is shown if the workflow step type is 'approval'
* @param {String} formName current form
*/
function rejectRequest(){
	var requestPanel = 	View.panels.get("requestPanel");
	var record 		 =	ABHDC_getDataRecord2(requestPanel);     
	var comments 	 =	document.getElementById("comments").value;
    
    try {
		var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-rejectRequest', record,comments);
	}catch(e){
		Workflow.handleError(result);
	}

	if(result.code == 'executed'){
		ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_mgr_overview_request_select"] = true;
		View.parentTab.parentPanel.selectTab("request");
	} else {
		Workflow.handleError(result);
	}
}


/**
 * Accept request<br />
 * Calls WFR <a href='../../../../javadoc/com/archibus/eventhandler/helpdesk/RequestHandler.html#acceptRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-acceptRequest</a><br />
 * Reloads request tab<br />
 * Called by 'Accept' button which is shown if the workflow step type is 'acceptance'
 * @param {String} formName form submitted
 */
function acceptRequest(formName){
	var requestPanel = 	View.panels.get("requestPanel");
	var record = 		ABHDC_getDataRecord2(requestPanel);     
	var comments = 		document.getElementById("comments").value;
    
    try {
		var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-acceptRequest',  record,comments);
	}catch(e){
		Workflow.handleError(e);
	}

	if(result.code == 'executed'){
		ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_mgr_overview_request_select"] = true;
		View.parentTab.parentPanel.selectTab("request");
	} else {
		Workflow.handleError(result);
	}
}


/**
* Decline request<br />
* Calls WFR <a href='../../../../javadoc/com/archibus/eventhandler/helpdesk/RequestHandler.html#declineRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-declineRequest</a><br />
* Reloads request tab<br />
* Called by 'Decline' button which is shown if the workflow step type is 'acceptance'
* @param {String}formName current form
*/
function declineRequest(formName){
	var requestPanel = 	View.panels.get("requestPanel");
	var record = 		ABHDC_getDataRecord2(requestPanel);     
	var comments = 		document.getElementById("comments").value;
    
	try {
		var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-declineRequest', record, comments);
	}catch(e){
		Workflow.handleError(e);
	}

	if(result.code == 'executed'){
		ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_mgr_overview_request_select"] = true;
		View.parentTab.parentPanel.selectTab("request");
	} else {
		Workflow.handleError(result);
	}
}


/**
 * Opens a dialog for a satisfaction survey<br />
 * Called by 'Satisfaction Survey' button which is shown if the workflow step type='survey'
 * @param {String} form current form
 */
function satisfactionSurvey(){
	var requestPanel = 	View.panels.get("requestPanel");
	var act_id = requestPanel.getFieldValue("activity_log.activity_log_id");
	var restriction = new Ab.view.Restriction();
	restriction.addClause("activity_log.activity_log_id",act_id,'=');
	View.openDialog("ab-helpdesk-request-satisfaction.axvw", restriction, false, 10, 10, 600, 400); 
}


function dispatchRequest(){
	var stepPanel = View.panels.get("stepPanel");
	
	var supervisor = stepPanel.getFieldValue("activity_log.supervisor");
	var workTeamId = stepPanel.getFieldValue("activity_log.work_team_id");
	
	if(supervisor != "" && workTeamId != ""){
		View.showMessage(getMessage("supervisorOrWorkteam"));
		return;
	}
	
	if(supervisor == "" && workTeamId == ""){
		View.showMessage(getMessage("supervisorOrWorkteam"));
		return;
	}
	
	var requestPanel = View.panels.get("requestPanel");
	var record = ABHDC_getDataRecord2(requestPanel);   
	var comments = document.getElementById("comments").value;
    var id = requestPanel.getFieldValue("activity_log.activity_log_id");
    
    try {
		var result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-dispatchRequest', 'activity_log','activity_log_id',id,record,comments);
	}catch(e){
		Workflow.handleError(e);
	}

	if(result.code == 'executed'){
		ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_mgr_overview_request_select"] = true;
		View.parentTab.parentPanel.selectTab("request");
	} else {
		Workflow.handleError(result);
	}
}


/**
* Forward approval
* <div class='detailHead'>Pseudo-code:</div>
* <ol>
* 		<li>Get record from form data</li>
* 		<li>Get comment field</li>
* 		<li>Get the activity_log_id</li>
* 		<li>Call WFR <a href='../../../javadoc/com/archibus/eventhandler/helpdesk/RequestHandler.html#forwardApproval(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-forwardApproval</a></li>
* 		<li>If success go to Select tab page</li>
* </ol>
* @param {String} formName current form
*/
function forwardApproval(){
	
	var stepPanel = View.panels.get("stepPanel");
	var requestPanel = View.panels.get("requestPanel");
	
	// we use the approved_by as temporary field
	var forwardTo = stepPanel.getFieldValue("activity_log.approved_by");
    stepPanel.setFieldValue("activity_log.approved_by", "");
	
	var record = ABHDC_getDataRecord2(requestPanel);    
	var comments = document.getElementById("comments").value;
        
    if (forwardTo == '') {
    	alert(getMessage('forwardToMissing'))
    	return;
    }
    
	try {
		var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-forwardApproval', record, comments, forwardTo);
	}catch(e){
		Workflow.handleError(e);
	}
	if(result.code == 'executed'){
		ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_mgr_overview_request_select"] = true;
		View.parentTab.parentPanel.selectTab("request");
	} else {
		Workflow.handleError(result);
	}
}


function selectServiceDeskSupervisor(formId,tableName,actionListener){
	if(actionListener != undefined){
		View.selectValue(formId, getMessage('supervisor'), [tableName+'.supervisor'],
		 'em', ['em.em_id'], ['em.em_id','em.em_std','em.email'], 
		 'EXISTS (select cf_id from cf where cf.email = em.email AND cf.is_supervisor = 1)',actionListener);
	} else {
		View.selectValue(formId, getMessage('supervisor'), [tableName+'.supervisor'],
		 'em', ['em.em_id'], ['em.em_id','em.em_std','em.email'], 
		 'EXISTS (select cf_id from cf where cf.email = em.email AND cf.is_supervisor = 1)')		
	}
} 
