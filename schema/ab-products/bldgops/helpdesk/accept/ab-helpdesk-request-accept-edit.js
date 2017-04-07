
var helpDeskRequestAcceptEditController = View.createController("helpDeskRequestAcceptEditController",{
	/**
	 * After view loads
	 */
	afterViewLoad : function() {
		//KB3044152 - Performance issue - use WFR to get workflow substitutes and avoid sub query 
		this.requestPanel.addParameter('emWorkflowSubstitutes', Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-getWorkflowSubstitutes','em_id').message);
	},
	

	requestPanel_afterRefresh: function (){
		this.doWorkForReviewTab();
	},		
	
	///////////////////////////////////////////////////////////////////////////
    // the below codes are used for review tab.
    ///////////////////////////////////////////////////////////////////////////
	doWorkForReviewTab: function(){
		
		var record = this.requestPanel.getRecord();
		
		this.locationPanel.setRecord(record);
		this.equipmentPanel.setRecord(record);
		this.descriptionPanel.setRecord(record);
		this.priorityPanel.setRecord(record);
		this.documentsPanel.setRecord(record);
		this.acceptancePanel.setRecord(record);
		
		this.locationPanel.show(true);
		this.equipmentPanel.show(true);
		this.descriptionPanel.show(true);
		this.priorityPanel.show(true);
		this.documentsPanel.show(true);
		this.acceptancePanel.show(true);
		
		var actType= this.descriptionPanel.getFieldValue("activity_log.activity_type");
		var activity_log_id = this.requestPanel.getFieldValue("activity_log.activity_log_id");
	
		
		ABHDC_checkHiddenFields(actType,this.equipmentPanel,this.locationPanel,this.documentsPanel,this.priorityPanel)
		ABHDC_showPriorityLevel("activity_log","activity_log_id","priority",this.priorityPanel,"activity_log.priority");
		ABHDC_getStepInformation('activity_log','activity_log_id',activity_log_id,this.historyPanel,"history",true);
		
		var quest = new Ab.questionnaire.Quest(actType, 'descriptionPanel', true);
		quest.showQuestions();
		
		
		ABHDC_hideEmptyDocumentPanel("activity_log",this.documentsPanel);
	},

	
    requestPanel_onAccept: function(){
    	this.acceptRequest();
    },
    
    requestPanel_onDecline: function(){
    	this.declineRequest();
    },
    
    acceptancePanel_onAccept2: function(){
    	this.acceptRequest();
    },
    
    acceptancePanel_onDecline2: function(){
    	this.declineRequest();
    },
	
	historyPanel_afterRefresh: function(){
		ABHDC_reloadHistoryPanel(this.historyPanel);
    },
    
	acceptRequest: function(){
	
		var record = ABHDC_getDataRecord2(this.requestPanel); 	    
		
		var comments = $("comments").value;
   		
	    try {
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-acceptRequest', record,comments);
		}catch(e){
			Workflow.handleError(e);
		}
		
		if(result.code == 'executed'){
			var tabs = View.getOpenerView().panels.get("helpDeskAcceptTabs"); 
		    if (tabs != null) {
				tabs.selectTab("select");
				$("comments").value = '';
		    }	
		}else{
			Workflow.handleError(result);
		}
	},
	
	declineRequest: function(){
		var record = ABHDC_getDataRecord2(this.requestPanel); 	    
		
		var comments = $("comments").value;
	    
	    try {
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-declineRequest', record,comments);
		}catch(e){
			Workflow.handleError(e);
		}
		
		if(result.code == 'executed'){
			var tabs = View.getOpenerView().panels.get("helpDeskAcceptTabs"); 
		    if(tabs != null){
	    	   	tabs.selectTab("select");
				$("comments").value = '';
			}
		}else{
			Workflow.handleError(result);
		}
	}
});