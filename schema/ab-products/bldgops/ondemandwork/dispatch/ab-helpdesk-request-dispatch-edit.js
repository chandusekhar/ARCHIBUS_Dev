
var abOndmdHpdReqDispatchEditController = View.createController("abOndmdHpdReqDispatchEditController",{
	
	/**
	 * After view loads
	 */
	afterViewLoad : function() {
		//KB3044152 - Performance issue - use WFR to get workflow substitutes and avoid sub query 
		this.requestPanel.addParameter('emWorkflowSubstitutes', Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-getWorkflowSubstitutes','em_id').message);
	},
	
	requestPanel_beforeRefresh: function(){
		this.locationPanel.show(false);
		this.equipmentPanel.show(false);
		this.descriptionPanel.show(false);
		this.priorityPanel.show(false);
		this.historyPanel.show(false);
		this.documentsPanel.show(false);
		this.dispatchPanel.show(false);
	},
	requestPanel_afterRefresh: function(){
		this.doPrepareWork();
	},
	
	doPrepareWork: function(){
		var record = this.requestPanel.getRecord();
		
		this.locationPanel.setRecord(record);
		this.equipmentPanel.setRecord(record);
		this.descriptionPanel.setRecord(record);
		this.priorityPanel.setRecord(record);
		this.documentsPanel.setRecord(record);
		this.dispatchPanel.setRecord(record);
		
		this.locationPanel.show(true);
		this.equipmentPanel.show(true);
		this.descriptionPanel.show(true);
		this.priorityPanel.show(true);
		this.historyPanel.show(true);
		this.documentsPanel.show(true);
		this.dispatchPanel.show(true);
		
		ABODC_showPanelByFieldValue("activity_log.eq_id",this.equipmentPanel,'');
		ABODC_hideEmptyDocumentPanel("activity_log",this.documentsPanel);
		
		ABODC_showPriorityLevel("activity_log","activity_log_id","priority",this.priorityPanel,"activity_log.priority");
		ABODC_getStepInformation("activity_log","activity_log_id",this.requestPanel.getFieldValue("activity_log.activity_log_id"),this.historyPanel,"history",true);
	},
	
	historyPanel_afterRefresh: function(){
		ABODC_reloadHistoryPanel(this.historyPanel);
    }
});



/**
 * Save form with supervisor or trade filled in<br />
 * Called by 'Dispatch' button<br /> 
 * Calls WFR <a href='../../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#dispatchRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-dispatchRequest</a><br />
 * Reloads select tab
 * @param {String} form form submitted
 */
function saveForm(){    
	var dispatchPanel = View.panels.get("dispatchPanel");
	var requestPanel = View.panels.get("dispatchPanel");
	
	dispatchPanel.clearValidationResult();

	if(dispatchPanel.getFieldValue("activity_log.supervisor") == ''
		 && dispatchPanel.getFieldValue("activity_log.work_team_id") == ''){
		dispatchPanel.addInvalidField("activity_log.supervisor",getMessage("supervisorOrWorkteam"));
		dispatchPanel.displayValidationResult();
		return;
	}
	
    var record = ABODC_getDataRecord2(requestPanel);     
	var comments = document.getElementById("comments").value;
    var id = requestPanel.getFieldValue("activity_log.activity_log_id");
	var result = {};
    try {
		 result =Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-dispatchRequest', 'activity_log','activity_log_id',id,record,comments);
 	} 
   	catch (e) {
		Workflow.handleError(e);
 	}
	if(result.code == 'executed'){
		var tabs = View.getOpenerView().panels.get("abHpdReqDispatchTabs");
		ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_request_dispatch_edit"] = true;
		tabs.selectTab("select");
	} else {
		Workflow.handleError(result);
	}
}

/**
 * Reject request<br />
 * Called by 'Reject' button<br /> 
 * Calls WFR <a href='../../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#rejectDispatchRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-rejectDispatchRequest</a><br />
 * Reloads select tab
 * @param {String} form form submitted
 */
function rejectRequest(){
	//KB3042432 - Comments required when rejecting a request
	var comments = document.getElementById("comments").value;
	if(!valueExistsNotEmpty(comments)){
		View.showMessage(getMessage('noCommentsForReject'));
		return;
	}
	
	var requestPanel = View.panels.get("dispatchPanel");
	var activity_log_id = requestPanel.getFieldValue("activity_log.activity_log_id");
	
	var record = ABODC_getDataRecord2(requestPanel);     
	var result = {};
	try {						
		 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-rejectDispatchRequest','activity_log','activity_log_id',activity_log_id,record,comments);
	} 
   	catch (e) {
		 Workflow.handleError(e);
 	}
	if(result.code == 'executed'){
		var tabs = View.getOpenerView().panels.get("abHpdReqDispatchTabs");
		ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_request_dispatch_edit"] = true;
		tabs.selectTab("select");
	} else {
		Workflow.handleError(result);
	}
}

function onChangeSupervisor(fieldName,selectedValue,previousValue){
	if(fieldName != undefined && selectedValue != undefined){
		$(fieldName).value = selectedValue;
	}
	var dispatchPanel = View.panels.get("dispatchPanel");
	if(dispatchPanel.getFieldValue("activity_log.supervisor") != ''){
		dispatchPanel.setFieldValue("activity_log.work_team_id",'');
	}
}

function onChangeWorkTeam(fieldName,selectedValue,previousValue){
	if(fieldName != undefined && selectedValue != undefined){
		$(fieldName).value = selectedValue;
	}
	var dispatchPanel = View.panels.get("dispatchPanel");
	if(dispatchPanel.getFieldValue("activity_log.work_team_id") != ''){
		dispatchPanel.setFieldValue("activity_log.supervisor",'');
	}
}
