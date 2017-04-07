var helpDeskRequestReviewViewController = View.createController("helpDeskRequestReviewViewController",{

	requestPanel_beforeRefresh: function(){
		var tabs = View.getOpenerView().panels.get("helpDeskRequestReviewTabs");
		tabs.workflow="enforced";
		tabs.enableTab("select",false);
	},
	
	requestPanel_afterRefresh: function(){ 
		this.prepareViewTab();
    	var tabs = View.getOpenerView().panels.get("helpDeskRequestReviewTabs");
		tabs.workflow="free";
		tabs.enableTab("select",true);
    },	
	
	prepareViewTab: function(){
		
	 	var activityLogId = this.requestPanel.getFieldValue("activity_log_hactivity_log.activity_log_id");
		var record = this.requestPanel.getRecord();
		
		this.locationPanel.setRecord(record);
		this.equipmentPanel.setRecord(record);
		this.descriptionPanel.setRecord(record);
		this.priorityPanel.setRecord(record);
		this.costsPanel.setRecord(record);
		this.satisfactionPanel.setRecord(record);
		
		
		this.locationPanel.show(true);
		this.equipmentPanel.show(true);
		this.descriptionPanel.show(true);
		this.priorityPanel.show(true);
		this.costsPanel.show(true);
		this.satisfactionPanel.show(true);
		this.historyPanel.show(true);
		
		
	 
		var actType= this.descriptionPanel.getFieldValue("activity_log_hactivity_log.activity_type");
		ABHDC_checkHiddenFields(actType,this.equipmentPanel,this.locationPanel,this.documentPanel,this.priorityPanel);
		
 
		ABHDC_showPriorityLevel("activity_log_hactivity_log","activity_log_id","priority",this.priorityPanel,"activity_log_hactivity_log.priority");

 
		var quest = new Ab.questionnaire.Quest(actType, "descriptionPanel", true, "activity_log_hactivity_log");
		quest.showQuestions();
		
 
		var activity_log_id = this.requestPanel.getFieldValue("activity_log_hactivity_log.activity_log_id");
		
		ABHDC_getStepInformation("activity_log_hactivity_log","activity_log_id",activity_log_id,this.historyPanel,"history",true);
		

		ABHDC_showPanelByFieldValue("activity_log_hactivity_log.eq_id",this.equipmentPanel,'');
		ABHDC_hideEmptyConstsPanel("activity_log_hactivity_log",this.costsPanel);
		ABHDC_hideEmptySatisfactionPanel("activity_log_hactivity_log",this.satisfactionPanel);
	},
	
	historyPanel_afterRefresh: function(){
		ABHDC_reloadHistoryPanel(this.historyPanel);
    }
});