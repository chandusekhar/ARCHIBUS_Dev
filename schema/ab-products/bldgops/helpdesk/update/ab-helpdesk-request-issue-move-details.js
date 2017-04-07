
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
		
		this.locationPanel.show(true);
		this.equipmentPanel.show(true);
		this.descriptionPanel.show(true);
		this.priorityPanel.show(true);
		this.documentsPanel.show(true);
		this.historyPanel.show(true);
		this.satisfactionPanel.show(true);
		
		this.prepareWork();
	},
	requestPanel_onNext: function(){
		
		  var activityLogIdValue = this.requestPanel.getFieldValue("activity_log.activity_log_id");
		    var restriction = new Ab.view.Restriction();
		    restriction.addClause("activity_log.activity_log_id", activityLogIdValue);
		    var tabs =  View.getControlsByType(parent, 'tabs')[0];
		    var status=this.descriptionPanel.getFieldValue("activity_log.status");
		    tabs.activityLogIdValue=activityLogIdValue;
			var date_start = getQuestionnaireFieldValue("date_start");
			var date_end = getQuestionnaireFieldValue("date_end");
			//if currently is approve, save these two date for further use
	        tabs.date_start=date_start;
	        tabs.date_end=date_end;
	        tabs.status=status;
	        tabs.issue=true;
	        View.getOpenerView().tabs=tabs;
	      //add parameter to decide next tab is for Edit and Approve
		    if("SERVICE DESK - GROUP MOVE"==tabs.activityTypeValue){
		    	tabs.funcType = "group_move_approve";
		    	tabs.findTab("groupMoveAssignment").isContentLoaded=false;
		    	tabs.selectTab("groupMoveAssignment", restriction, false, false, false);
		    	
		    }else if("SERVICE DESK - INDIVIDUAL MOVE"==tabs.activityTypeValue){
		    	tabs.funcType = "individual_move_approve";
		    	tabs.move_date=date_start;
		    	tabs.findTab("indvMoveEditApprove").isContentLoaded=false;
		    	tabs.selectTab("indvMoveEditApprove", restriction, false, false, false);
		    }
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
 * private method
 * @param fieldName
 * @returns
 */
function getQuestionnaireFieldValue(fieldName){
	var activityTypeValue = helpDeskRequesUpdateController.descriptionPanel.getFieldValue("activity_log.activity_type");
    var tabs =  View.getControlsByType(parent, 'tabs')[0];
    tabs.activityTypeValue = activityTypeValue;
//	activityTypeValue="SERVICE DESK - GROUP MOVE";
	var restriction = new Ab.view.Restriction();
	restriction.addClause('questionnaire.questionnaire_id', activityTypeValue);
	restriction.addClause('questions.is_active', 1);
	var ds = View.dataSources.get('exPrgQuestionnaire_questionsDs');
	var questionRecords = ds.getRecords(restriction);
	for(var i=0;i<questionRecords.length;i++){
		var quest_name = questionRecords[i].getValue("questions.quest_name");
		if(fieldName==quest_name){
			var questionRecord = questionRecords[i];
			var recordType = questionRecord.getValue('questions.format_type');
			var value = $('descriptionPanel_question' + i + '.answer_field').value;
			if (recordType == 'Date') {
				return dateFormatQues(getDateWithISOFormat(value));
			}else{
				return value;
			}
		}
	}
	return null;
}
/**
 * private method, return date format mm/dd/yyyy 
 * @param dateStr
 * @returns
 */
function dateFormatQues(dateStr){
	if(dateStr!=null&&dateStr!='')
	return dateStr.split("-")[1]+"/"+dateStr.split("-")[2]+"/"+dateStr.split("-")[0];
	else 
	  return "";
}