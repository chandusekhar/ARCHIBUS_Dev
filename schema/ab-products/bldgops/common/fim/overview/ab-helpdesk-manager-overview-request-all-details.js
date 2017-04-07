var abHpdMgrOverviewReqAllDetailController = View.createController("abHpdMgrOverviewReqAllDetailController",{
	
	requestPanel_beforeRefresh: function(){
		this.servicePanel.enableField("activity_log.dispatcher",true);
		this.servicePanel.enableField("activity_log.supervisor",true);
		this.servicePanel.enableField("activity_log.work_team_id",true);
		
		this.servicePanel.enableField("activity_log.assigned_to",false);
		this.servicePanel.enableField("activity_log.vn_id",false);
	},
	
	requestPanel_afterRefresh: function(){ 
		this.doPrepareWork();
		this.removeStatusOptions("activity_log.status");
		onchangeStatus();
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
		this.servicePanel.setRecord(record);
		this.costsPanel.setRecord(record);

	 	this.locationPanel.show(true);
		this.equipmentPanel.show(true);
		this.descriptionPanel.show(true);
		this.priorityPanel.show(true);
		this.documentsPanel.show(true);
		this.historyPanel.show(true);
		this.servicePanel.show(true);
		this.costsPanel.show(true);
		
		var activityLogId = this.requestPanel.getFieldValue("activity_log.activity_log_id");
		var actType = this.descriptionPanel.getFieldValue("activity_log.activity_type");
		
		var quest = new Ab.questionnaire.Quest(actType, 'descriptionPanel', true);
		quest.showQuestions();
		
		ABHDC_checkHiddenFields(actType,this.equipmentPanel,this.locationPanel,this.documentsPanel,this.priorityPanel);
		ABHDC_getStepInformation("activity_log","activity_log_id",activityLogId,this.historyPanel,"history",true);
		ABHDC_showPriorityLevel("activity_log","activity_log_id","priority",this.priorityPanel,"activity_log.priority");
		ABHDC_hideEmptyDocumentPanel("activity_log",this.documentsPanel);
		ABHDC_showPanelByFieldValue("activity_log.eq_id",this.equipmentPanel,'');
		
		
		if(this.requestPanel.getFieldValue("activity_log.wr_id") != '' || this.requestPanel.getFieldValue("activity_log.wo_id") != ''){
			this.servicePanel.enableField("activity_log.dispatcher",false);
			this.servicePanel.enableField("activity_log.supervisor",false);
			this.servicePanel.enableField("activity_log.work_team_id",false);
		}
	},
	removeStatusOptions: function(fieldName){
		
		var selectElement = this.descriptionPanel.getFieldElement(fieldName);	
		if (selectElement == null) return;
		
		for (var i=selectElement.options.length-1; i>=0; i--) {
			if (selectElement.options[i].value == "N/A" || selectElement.options[i].value == "CREATED" 
			|| selectElement.options[i].value == "PLANNED" || selectElement.options[i].value == "TRIAL" 
			|| selectElement.options[i].value == "BUDGETED" || selectElement.options[i].value == "SCHEDULED" 
			|| selectElement.options[i].value == "IN PROCESS-H" || selectElement.options[i].value == "COMPLETED-V" 	
			) {
				selectElement.remove(i);
			}
		}	
	},

	historyPanel_afterRefresh: function(){
		ABHDC_reloadHistoryPanel(this.historyPanel);
    }
});


/**
 * @fileoverview Javascript function for <a href='../../../../viewdoc/overview-summary.html#ab-helpdesk-manager-overview-request-all-details.axvw' target='main'>ab-helpdesk-manager-overview-request-all-details.axvw</a>
 */

/**
 * Called when form is loading
 * <div class='detailHead'>Pseudo-code:</div>
 *	<ol>
 *		<li>Show request fields according to the request type</li>
 * 		<li>Show label for the priority level</li>
 *  	<li>Show questionnaire answers</li>
 * 		<li>Show step history</li>
 * 		<li>Display form fields depending on the step</li>
 *  	<li>Hide documents panel if empty</li>
 *	</ol> 
*/

/**
 * Called when status value is changed<br />
 * Enables/disables fields for dispatcher, assigned_to, vn_id according to the selected status
 */
function onchangeStatus(){
	
	var descriptionPanel = View.panels.get("descriptionPanel");
	
	var state = descriptionPanel.getFieldValue("activity_log.status");
	var activity = descriptionPanel.getFieldValue("activity_log.activity_type");

	var servicePanel =  View.panels.get("servicePanel");
	var requestPanel =  View.panels.get("requestPanel");
	
	if(activity == 'SERVICE DESK - MAINTENANCE'){
		if(state == 'APPROVED' && requestPanel.getFieldValue("activity_log.wr_id") == '' && requestPanel.getFieldValue("activity_log.wo_id") == ''){
			servicePanel.enableField("activity_log.dispatcher",true);
			servicePanel.enableField("activity_log.supervisor",true);
			servicePanel.enableField("activity_log.work_team_id",true);
		} else {
			servicePanel.enableField("activity_log.dispatcher",false);
			servicePanel.enableField("activity_log.supervisor",false);
			servicePanel.enableField("activity_log.work_team_id",false);
		}
	} else {
		if(state == 'REQUESTED' || state == 'APPROVED'){
			servicePanel.enableField("activity_log.assigned_to",false);
			servicePanel.enableField("activity_log.vn_id",false);
		} else {
			servicePanel.enableField("activity_log.assigned_to",true);
			servicePanel.enableField("activity_log.vn_id",true);
		}
	}
}


function updateRequest(){
	
	var servicePanel = View.panels.get("servicePanel");
	var descriptionPanel = View.panels.get("descriptionPanel");
	var requestPanel = View.panels.get("requestPanel");
	
	if(servicePanel.getFieldValue("activity_log.vn_id") != "" && servicePanel.getFieldValue("activity_log.assigned_to") != ""){
		View.showMessage(getMessage("VnOrAssignee"));
		return;
	}
	if(servicePanel.getFieldValue("activity_log.supervisor") != "" && servicePanel.getFieldValue("activity_log.dispatcher") != ""){
		View.showMessage(getMessage("supervisorOrDispatcher"));
		return;
	}
	if(servicePanel.getFieldValue("activity_log.work_team_id") != "" && servicePanel.getFieldValue("activity_log.dispatcher") != ""){
		View.showMessage(getMessage("supervisorOrDispatcher"));
		return;
	}
	if(servicePanel.getFieldValue("activity_log.supervisor") != "" && servicePanel.getFieldValue("activity_log.work_team_id") != ""){
		View.showMessage(getMessage("supervisorOrDispatcher"));
		return;
	}

	var record = ABHDC_getDataRecord2(servicePanel); 
	
	var activityLogId = requestPanel.getFieldValue("activity_log.activity_log_id");
	var status = descriptionPanel.getFieldValue("activity_log.status");
	var assignedTo = servicePanel.getFieldValue("activity_log.assigned_to");
	var vendorId = servicePanel.getFieldValue("activity_log.vn_id");
	var supervisor = servicePanel.getFieldValue("activity_log.supervisor");
	var dispatcher = servicePanel.getFieldValue("activity_log.dispatcher");
	var workTeamId = servicePanel.getFieldValue("activity_log.work_team_id");
	
	try {
		var result = Workflow.callMethod("AbBldgOpsHelpDesk-RequestsService-updateRequest", activityLogId,status,assignedTo,vendorId,supervisor,dispatcher,workTeamId,record);
	}catch(e){
		Workflow.handleError(e); 
	}
	
	if(result.code == 'executed'){
		ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_mgr_overview_request_all_select"] = true;
		View.parentTab.loadView();
	} else {
		Workflow.handleError(result); 
	}
}


function onChangeSupervisor(fieldName,selectedValue,previousValue){
	var panel = View.panels.get('servicePanel');
	
	if(fieldName != undefined && selectedValue != undefined){
		panel.setFieldValue(fieldName,selectedValue);
	}
	
	if(panel.getFieldValue("activity_log.supervisor") != ""){
		panel.setFieldValue("activity_log.dispatcher","");
		panel.enableField("activity_log.dispatcher",false);
		panel.setFieldValue("activity_log.work_team_id","");
	}
}


function onChangeEmployee(fieldName,selectedValue,previousValue){
	var panel = View.panels.get('servicePanel');
	
	if(fieldName != undefined && selectedValue != undefined){
		panel.setFieldValue(fieldName,selectedValue);
	}
	
	if(panel.getFieldValue("activity_log.assigned_to") != ""){
		panel.setFieldValue("activity_log.vn_id","");
	}
}


function onChangeVendor(fieldName,selectedValue,previousValue){
	var panel = View.panels.get('servicePanel');
	
	if(fieldName != undefined && selectedValue != undefined){
		panel.setFieldValue(fieldName,selectedValue);
	}
	
	if(panel.getFieldValue("activity_log.vn_id") != ""){
		panel.setFieldValue("activity_log.assigned_to","");
	}
}


function onChangeDispatcher(fieldName,selectedValue,previousValue){
	var panel = View.panels.get('servicePanel');
	
	if(fieldName != undefined && selectedValue != undefined){
		panel.setFieldValue(fieldName,selectedValue);
	}

	if(panel.getFieldValue("activity_log.dispatcher") != ""){
		panel.setFieldValue("activity_log.supervisor","");
		panel.setFieldValue("activity_log.work_team_id","");
	}
}


function onChangeWorkTeam(fieldName,selectedValue,previousValue){
	var panel = View.panels.get('servicePanel');
	
	if(fieldName != undefined && selectedValue != undefined){
		panel.setFieldValue(fieldName,selectedValue);
	}
	
	if(panel.getFieldValue("activity_log.work_team_id") != ""){
		panel.setFieldValue("activity_log.dispatcher","");
		panel.enableField("activity_log.dispatcher",false);
		panel.setFieldValue("activity_log.supervisor","");
	} else if(panel.getFieldValue("activity_log.work_team_id") == '' && panel.getFieldValue("activity_log.supervisor") == ''){
		panel.enableField("activity_log.dispatcher",true);
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

