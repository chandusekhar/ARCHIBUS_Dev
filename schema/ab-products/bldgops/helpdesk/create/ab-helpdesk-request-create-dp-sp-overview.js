
var resultController = View.createController("helpDeskDocsController",{
	afterInitialDataFetch: function() {
		this.inherit();
	},
	requestPanel_afterRefresh: function(){
		
		var record = this.requestPanel.getRecord();
		
		this.locationPanel.setRecord(record);
		this.equipmentPanel.setRecord(record);
		this.problemPanel.setRecord(record);
		this.documentsPanel.setRecord(record);
		
		this.locationPanel.show(true);
		this.equipmentPanel.show(true);
		this.problemPanel.show(true);
		this.documentsPanel.show(true);
		
		
		var act_type = this.problemPanel.getFieldValue("activity_log.activity_type");
		ABHDC_checkHiddenFields(act_type,this.equipmentPanel,this.locationPanel,this.documentsPanel,this.priorityPanel);
		
		ABHDC_hideEmptyDocumentPanel("activity_log",this.documentsPanel);
		
		var quest = new Ab.questionnaire.Quest(this.problemPanel.getFieldValue("activity_log.activity_type"), 'problemPanel', true);
		quest.showQuestions();
		var activity_log_id=this.requestPanel.getFieldValue("activity_log.activity_log_id");
		ABHDC_showPriorityLevel("activity_log","activity_log_id","priority",this.problemPanel,"activity_log.priority");
		ABHDC_getStepInformation("activity_log","activity_log_id",this.requestPanel.getFieldValue("activity_log.activity_log_id"),this.historyPanel,"history",true);
	
		ABHDC_getTabsSharedParameters()["activity_log_id"] = 0;	
		ABHDC_getTabsSharedParameters()["questionnaire"] = null; 
		ABHDC_getTabsSharedParameters()["documents"] = null;
		ABHDC_getTabsSharedParameters()["locatie"] = null;
		ABHDC_getTabsSharedParameters()["equipment"] = null;
		ABHDC_getTabsSharedParameters()["required"] = null;
		ABHDC_getTabsSharedParameters()["prob_type"] = null;
		
		var dvId = View.user.employee.organization.divisionId;
		var dpId = View.user.employee.organization.departmentId;
		this.rmpctPanel.refresh("activity_log_id="+activity_log_id);
		
	},
	
	historyPanel_afterRefresh: function(){
		ABHDC_reloadHistoryPanel(this.historyPanel);
    }
});


function createNew(){
	ABHDC_getTabsSharedParameters()["activity_log_id"] = 0;
	ABHDC_getTabsSharedParameters()["activity_type"] = null;
	//refresh the parent url.
	window.parent.location.href = window.parent.location.href;
}
