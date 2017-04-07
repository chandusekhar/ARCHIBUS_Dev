var abHpdReqCloseController = View.createController("abHpdReqCloseController",{
	
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
		this.costsPanel.setRecord(record);
		this.satisfactionPanel.setRecord(record);
		
		
		this.locationPanel.show(true);
		this.equipmentPanel.show(true);
		this.descriptionPanel.show(true);
		this.priorityPanel.show(true);
		this.documentsPanel.show(true);
		this.costsPanel.show(true);
		this.satisfactionPanel.show(true);
		this.historyPanel.show(true);
		
	
		var activityLogId = this.requestPanel.getFieldValue("activity_log.activity_log_id");
		var actType = this.descriptionPanel.getFieldValue("activity_log.activity_type");
		var quest = new Ab.questionnaire.Quest(actType, 'descriptionPanel', true);
		quest.showQuestions();
		
		ABHDC_checkHiddenFields(actType,this.equipmentPanel,this.locationPanel,this.documentsPanel,this.priorityPanel);
		ABHDC_getStepInformation("activity_log","activity_log_id",activityLogId,this.historyPanel,"history",true);
		ABHDC_showPriorityLevel("activity_log","activity_log_id","priority",this.priorityPanel,"activity_log.priority");
		ABHDC_hideEmptyDocumentPanel("activity_log",this.documentsPanel);
		ABHDC_hideEmptyConstsPanel("activity_log",this.costsPanel);
		ABHDC_hideEmptySatisfactionPanel("activity_log",this.satisfactionPanel);
		ABHDC_showPanelByFieldValue("activity_log.eq_id",this.equipmentPanel,'');
		
	},
	
	requestPanel_onArchive: function(){
		if(confirm(getMessage("confirmArchive"))){
			var activity_log_id = this.requestPanel.getFieldValue("activity_log.activity_log_id");
			
			try {
				var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-archiveRequest', activity_log_id,{});
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
	
	historyPanel_afterRefresh: function(){
		ABHDC_reloadHistoryPanel(this.historyPanel);
    }
	
});