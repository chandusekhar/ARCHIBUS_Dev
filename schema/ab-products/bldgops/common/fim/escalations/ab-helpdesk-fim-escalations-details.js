var abHpdFimEscalationDetailController = View.createController("abHpdFimEscalationDetailController",{
	
	requestPanel_beforeRefresh: function(){
		this.servicePanel.enableField("activity_log.dispatcher",true);
		this.servicePanel.enableField("activity_log.supervisor",true);
		this.servicePanel.enableField("activity_log.work_team_id",true);
		this.servicePanel.enableField("activity_log.assigned_to",true);
		this.servicePanel.enableField("activity_log.vn_id",true);
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
		this.servicePanel.setRecord(record);
		this.priorityPanel.setRecord(record);
		this.documentsPanel.setRecord(record);
		this.costsPanel.setRecord(record);
				
		
		this.locationPanel.show(true);
		this.equipmentPanel.show(true);
		this.descriptionPanel.show(true);
		this.servicePanel.show(true);
		this.priorityPanel.show(true);
		this.documentsPanel.show(true);
		this.costsPanel.show(true);
		this.historyPanel.show(true);
			
		var activityLogId = this.requestPanel.getFieldValue("activity_log.activity_log_id");
		var actType = this.descriptionPanel.getFieldValue("activity_log.activity_type");
		
		if(this.descriptionPanel.getFieldValue("activity_log.act_quest") != ''){
			var quest = new Ab.questionnaire.Quest(actType, 'descriptionPanel', true);
		}
		
		ABHDC_checkHiddenFields(actType,this.equipmentPanel,this.locationPanel,this.documentsPanel,this.priorityPanel);
		ABHDC_getStepInformation("activity_log","activity_log_id",activityLogId,this.historyPanel,"history",true);
		ABHDC_showPriorityLevel("activity_log","activity_log_id","priority",this.priorityPanel,"activity_log.priority");
		ABHDC_hideEmptyDocumentPanel("activity_log",this.documentsPanel);
		ABHDC_showPanelByFieldValue("activity_log.eq_id",this.equipmentPanel,'');
		
		this.removeStatusOptions("activity_log.status");
		onchangeStatus();
		 
	},
	
	requestPanel_onArchive: function(){
		if(confirm(getMessage("confirmArchive"))){
			var activity_log_id = this.requestPanel.getFieldValue("activity_log.activity_log_id");
			
			try {
				var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-archiveRequest', activity_log_id,null);
			}catch(e){
				Workflow.handleError(e);
			}
			if(result.code =='executed'){
				ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_request_close_select_closed"] = true;
				View.parentTab.parentPanel.selectTab('closed');
			} else {
				Workflow.handleError(result);
			}
		}
	},
	
	requestPanel_onClose: function(){
		if (confirm(getMessage("confirmClose"))) {	
			var record = ABHDC_getDataRecord2(this.requestPanel); 
			
			try {
				var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-closeRequest', record);
			}catch(e){
				Workflow.handleError(e);
			}
			if(result.code=='executed'){
				ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_request_close_select"] = true;
				View.parentTab.parentPanel.selectTab('completed');
			} else {
				Workflow.handleError(result);
			}
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
* Opens window with workorder or work request for current action item<br />
* Called by 'Show Related On Demand Work' button<br />
* Opened dialog depends on whether a work request or a work order is linked to the action item (i.e. wr_id or wo_id given)
*/
function showOnDemand(){
	if($("activity_log.wr_id").value=='' && $("activity_log.wo_id").value==''){
		View.showMessage(getMessage("noWorkOrderOrWorkRequest"));
	} else {	
		if($("activity_log.wr_id").value != ""){	
			var restriction = new Ab.view.Restriction();
			restriction.addClause("wr.wr_id",parseInt($("activity_log.wr_id").value),'=');
			View.openDialog("ab-helpdesk-request-ondemand-wr.axvw",restriction, false);			
		} else if($("activity_log.wo_id").value != '') {
			var restriction = new Ab.view.Restriction();
			restriction.addClause("wo.wo_id",parseInt($("activity_log.wo_id").value),'=');
			View.openDialog("ab-helpdesk-request-ondemand-wo.axvw",restriction, false);
		}
	}
}

/**
 * Called when status value is changed<br />
 * Enables/disables fields for dispatcher, assigned_to, vn_id according to the selected status
 */
function onchangeStatus(){
	var state = $("activity_log.status").value;
	var activity = $("activity_log.activity_type").value;
	var form = View.panels.get('servicePanel');
	
	if(activity == 'SERVICE DESK - MAINTENANCE'){
		if(state == 'APPROVED'){
			form.enableField("activity_log.dispatcher",true);
			form.enableField("activity_log.supervisor",true);
			form.enableField("activity_log.work_team_id",true);
		} else {
			form.enableField("activity_log.dispatcher",false);
			form.enableField("activity_log.supervisor",false);
			form.enableField("activity_log.work_team_id",false);
		}
	} else {
		if(state == 'REQUESTED' || state == 'APPROVED'){
			form.enableField("activity_log.assigned_to",false);
			form.enableField("activity_log.vn_id",false);
		} else {
			form.enableField("activity_log.assigned_to",true);
			form.enableField("activity_log.vn_id",true);
		}
	}
}

/**
 * Update escalated request<br />
 * Calls WFR <a href='../../../../javadoc/com/archibus/eventhandler/helpdesk/RequestHandler.html#updateRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-updateRequest</a> 
 */
function updateRequest(){
	if($("activity_log.vn_id").value != '' && $("activity_log.assigned_to").value != ''){
		View.showMessage(getMessage("VnOrAssignee"));
		return;
	}
	if($("activity_log.supervisor").value != '' && $("activity_log.dispatcher").value != ''){
		View.showMessage(getMessage("supervisorOrDispatcher"));
		return;
	}
	if($("activity_log.work_team_id").value != '' && $("activity_log.dispatcher").value != ''){
		View.showMessage(getMessage("supervisorOrDispatcher"));
		return;
	}
	if($("activity_log.supervisor").value != '' && $("activity_log.work_team_id").value != ''){
		View.showMessage(getMessage("supervisorOrDispatcher"));
		return;
	}
	var record = ABHDC_getDataRecord2(View.panels.get("requestPanel")); 
	
	var activityLogId = $("activity_log.activity_log_id").value;
	var status = $("activity_log.status").value;
	var assignedTo = $("activity_log.assigned_to").value;
	var vendorId = $("activity_log.vn_id").value;
	var supervisor = $("activity_log.supervisor").value;
	var dispatcher = $("activity_log.dispatcher").value;
	var workTeamId = $("activity_log.work_team_id").value;
	
	try {
		var result = Workflow.callMethod("AbBldgOpsHelpDesk-RequestsService-updateRequest", activityLogId,status,assignedTo,vendorId,supervisor,dispatcher,workTeamId,record);
	}catch(e){
		Workflow.handleError(e); 
	}
	
	if(result.code == 'executed'){
		ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_fim_escalations_select"] = true;
		ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_fim_escalations_select_completion"] = true; 
		var restriction = new Ab.view.Restriction();
		restriction.addClause("activity_log.activity_log_id",activityLogId,'=');
		View.panels.get("requestPanel").refresh(restriction, false);
	} else {
		Workflow.handleError(result); 
	}
}

function onChangeSupervisor(fieldName,selectedValue,previousValue){
	if(fieldName != undefined && selectedValue != undefined){
		$(fieldName).value = selectedValue;
	}
	var panel = View.panels.get("servicePanel");
	if(panel.getFieldValue("activity_log.supervisor") != ''){
		panel.setFieldValue("activity_log.dispatcher",'');
		panel.setFieldValue("activity_log.work_team_id",'');
	}
}

function onChangeWorkTeam(fieldName,selectedValue,previousValue){
	if(fieldName != undefined && selectedValue != undefined){
		$(fieldName).value = selectedValue;
	}
	var panel =  View.panels.get("servicePanel");
	if(panel.getFieldValue("activity_log.work_team_id") != ''){
		panel.setFieldValue("activity_log.dispatcher",'');
		panel.setFieldValue("activity_log.supervisor",'');
	} 
}

function onChangeEmployee(fieldName,selectedValue,previousValue){
	if(fieldName != undefined && selectedValue != undefined){
		$(fieldName).value = selectedValue;
	}
	var panel = View.panels.get("servicePanel");
	if(panel.getFieldValue("activity_log.assigned_to") != ''){
		panel.setFieldValue("activity_log.vn_id",'');
	}
}

function onChangeVendor(fieldName,selectedValue,previousValue){
	if(fieldName != undefined && selectedValue != undefined){
		$(fieldName).value = selectedValue;
	}
	var panel = View.panels.get("servicePanel");
	if(panel.getFieldValue("activity_log.vn_id") != ''){
		panel.setFieldValue("activity_log.assigned_to",'');
	}
}

function onChangeDispatcher(fieldName,selectedValue,previousValue){
	if(fieldName != undefined && selectedValue != undefined){
		$(fieldName).value = selectedValue;
	}
	var panel = View.panels.get("servicePanel");
	if(panel.getFieldValue("activity_log.dispatcher") != ''){
		panel.setFieldValue("activity_log.supervisor",'');
		panel.setFieldValue("activity_log.work_team_id",'');
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