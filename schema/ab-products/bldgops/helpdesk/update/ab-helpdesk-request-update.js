
var helpDeskRequesUpdateController =  View.createController("helpDeskRequesUpdateController", {
	
	mainTabs: null,
 
	
	afterInitialDataFetch: function() {
		this.inherit();
 		this.mainTabs = View.getOpenerView().panels.get("hdrUpdTabs");
 	},
 	
	requestPanel_afterRefresh: function(){
		
		var record = this.requestPanel.getRecord();
		
		this.locationPanel.setRecord(record);
		this.equipmentPanel.setRecord(record);
		this.descriptionPanel.setRecord(record);
		this.priorityPanel.setRecord(record);
		this.documentsPanel.setRecord(record);
		this.satisfactionPanel.setRecord(record);
		this.updatePanel.setRecord(record);
		
		this.locationPanel.show(true);
		this.equipmentPanel.show(true);
		this.descriptionPanel.show(true);
		this.priorityPanel.show(true);
		this.documentsPanel.show(true);
		this.historyPanel.show(true);
		this.satisfactionPanel.show(true);
		this.updatePanel.show(true);
		
		this.prepareWork();
	},
	
	prepareWork: function(){
		
		var act_type = this.descriptionPanel.getFieldValue("activity_log.activity_type");
		
		ABHDC_checkHiddenFields(act_type,this.equipmentPanel,this.locationPanel,this.documentsPanel,this.priorityPanel);
		
		ABHDC_hideEmptyDocumentPanel("activity_log",this.documentsPanel);
		
		var quest = new Ab.questionnaire.Quest(act_type, 'descriptionPanel', true);
		quest.showQuestions();
		
		ABHDC_showPriorityLevel("activity_log","activity_log_id","priority",this.priorityPanel,"activity_log.priority");
		ABHDC_getStepInformation("activity_log","activity_log_id",this.requestPanel.getFieldValue("activity_log.activity_log_id"),this.historyPanel,"history",true);
	
	
		ABHDC_hideEmptySatisfactionPanel("activity_log",this.satisfactionPanel);
		ABHDC_showPanelByFieldValue("activity_log.eq_id",this.equipmentPanel,'');
		
	},
	
	historyPanel_afterRefresh: function(){
		ABHDC_reloadHistoryPanel(this.historyPanel);
    }
});


/**
* Issue request<br />
* Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/helpdesk/RequestHandler.html#issueRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-issueRequest</a><br />
* Reloads select tab<br />
* Called by 'Issue' button
* @param {String} formName form submitted
*/
function onIssueRequest(){	
	//var record = gettingRecordsData(document.forms[formName]);                     
    
    var panel = View.panels.get("requestPanel");
    //var activityLogId = panel.getFieldValue("activity_log.activity_log_id");
    var record = ABHDC_getDataRecord2(panel);
    
	try {
		var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-issueRequest', record);
	}catch(e){
		Workflow.handleError(e);
	}

	if(result.code == 'executed'){
		//AFM.view.View.selectTabPage("select");
		helpDeskRequesUpdateController.mainTabs.selectTab("select");
	} else {
		Workflow.handleError(result);
	}
}

/**
* Stop request<br />
* Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/helpdesk/RequestHandler.html#stopRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-stopRequest</a><br />
* Reloads select tab<br />
* Called by 'Cancel' button
* @param {String} formName form submitted
*/
function onCancelRequest(formName){	
	
	var panel = View.panels.get("requestPanel");
    var record = ABHDC_getDataRecord2(panel);
    
	try {
		var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-cancelRequest', record);
	}catch(e){
		Workflow.handleError(e);
	}

	if(result.code == 'executed'){
		//AFM.view.View.selectTabPage("select");
		helpDeskRequesUpdateController.mainTabs.selectTab("select");
	} else {
		Workflow.handleError(result);
	}
}

/**
* Stop request<br />
* Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/helpdesk/RequestHandler.html#stopRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-stopRequest</a><br />
* Reloads select tab<br />
* Called by 'Stop' button
* @param {String} formName form submitted
*/
function onStopRequest(formName){	
	
	var panel = View.panels.get("requestPanel");
    var record = ABHDC_getDataRecord2(panel);
	
    try {
		var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-stopRequest', record);
	}catch(e){
		Workflow.handleError(e);
	}

	if(result.code == 'executed'){
		helpDeskRequesUpdateController.mainTabs.selectTab("select");
	} else {
		Workflow.handleError(result);
	}
}

/**
* Complete request<br />
* Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/helpdesk/RequestHandler.html#completeRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-completeRequest</a><br />
* Reloads select tab<br />
* Called by 'Complete' button
* @param {String} formName form submitted
*/
function onCompleteRequest(){

	var panel = View.panels.get("requestPanel");
    var record = ABHDC_getDataRecord2(panel);
    
    try {
		var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-completeRequest', record);
	}catch(e){
		Workflow.handleError(e);
	}

	if(result.code == 'executed'){
		helpDeskRequesUpdateController.mainTabs.selectTab("select");
	} else {
		Workflow.handleError(result);
	}
}