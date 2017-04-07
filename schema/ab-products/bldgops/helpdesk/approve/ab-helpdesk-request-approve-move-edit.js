

var helpdeskRequestApproveEditController = View.createController("helpdeskRequestApproveEditController",{
	
	afterViewLoad: function(){
		//KB3044152 - Performance issue - use WFR to get workflow substitutes and avoid sub query 
		this.requestPanel.addParameter('emWorkflowSubstitutes', Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-getWorkflowSubstitutes','em_id').message);
	},
	
	afterInitialDataFetch: function(){
	},
	
	requestPanel_beforeRefresh: function(){
		this.locationPanel.show(false);
		this.equipmentPanel.show(false);
		this.descriptionPanel.show(false);
		this.documentPanel.show(false);
		this.myApprovalPanel.show(false);
		$("comments").value = '';
		
    },
	
	requestPanel_afterRefresh: function(){ 
	 	this.prepareWorks();
    },	
    
    prepareWorks: function(){
    	
    	var activity_log_id = this.requestPanel.getFieldValue("activity_log.activity_log_id");
		var record = this.requestPanel.getRecord();
		
		if(record.values["activity_log.act_quest"] != null
	    	&& record.values["activity_log.act_quest"] != ''){
	    	record.values["activity_log.act_quest"] = convert2validXMLValue(record.values["activity_log.act_quest"]);
	    }
		
		this.locationPanel.setRecord(record);
		this.equipmentPanel.setRecord(record);
		this.descriptionPanel.setRecord(record);
		this.documentPanel.setRecord(record);
	 	
	 	this.locationPanel.show(true);
		this.equipmentPanel.show(true);
		this.descriptionPanel.show(true);
		this.priorityPanel.show(true);
		this.documentPanel.show(true);

		this.myApprovalPanel.setRecord(record);
		this.myApprovalPanel.show(true);
//	 	
	 	var actType = this.descriptionPanel.getFieldValue("activity_log.activity_type");
		
   		ABHDC_checkHiddenFields(actType,this.equipmentPanel,this.locationPanel,this.documentPanel,this.descriptionPanel);
   		
   		var quest = new Ab.questionnaire.Quest(actType, 'descriptionPanel', true);
		quest.showQuestions();
		
		
		ABHDC_getStepInformation("activity_log","activity_log_id",activity_log_id,this.historyPanel,"history",true);
		
		ABHDC_hideEmptyDocumentPanel("activity_log",this.documentPanel);
		ABHDC_showPanelByFieldValue("activity_log.eq_id",this.equipmentPanel,'');
			
		//this.handleApprovalFields();
		ABHDRAC_handleApprovalFields("activity_log",this.myApprovalPanel,this.descriptionPanel);
		
		var commentsValue = this.myApprovalPanel.getFieldValue("activity_log_step_waiting.comments");
		if(commentsValue != ''){
			$("comments").value = commentsValue;
		}
		
		SLA_clearPriorities("descriptionPanel","priorities");
		checkSLA("descriptionPanel");
		SLA_setPriority("requestPanel","descriptionPanel",this.descriptionPanel.getFieldValue("activity_log.proprity"),"priorities");
		
		var radioButtons = document.getElementsByName("priorities");
		for (var i=0; i<radioButtons.length;i++){
			radioButtons[i].disabled = true;
		}
	},
	getRecordAndComments: function(){
		var record = ABHDC_getDataRecord2(this.requestPanel);     
		var comments = $("comments").value;
		return {"record":record,"comments":comments};
	},
 	requestPanel_onApprove:function(){
//		ABHDRAC_approveRequest(this.requestPanel);
		var record = ABHDC_getDataRecord2(this.requestPanel);     
		var comments = $("comments").value;
		try {
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-approveRequest', record,comments);
			return null;
		}catch(e){
			Workflow.handleError(e);
			return e;
		}
	},
	
	requestPanel_onReject:function(){
//		ABHDRAC_rejectRequest(this.requestPanel);
		var record = ABHDC_getDataRecord2(this.requestPanel);     
		var comments = $("comments").value;
		try {
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-rejectRequest', record,comments);
			return null;
		}catch(e){
			Workflow.handleError(e);
			return e;
		}
	},
	
	requestPanel_onForward:function(){
		ABHDRAC_forwardApproval(this.myApprovalPanel,this.requestPanel);
	},
	
	myApprovalPanel_onApprove:function(){
		ABHDRAC_approveRequest(this.requestPanel);
	},
	
	requestPanel_onNext:function(){
	    
		var activityTypeValue = helpdeskRequestApproveEditController.descriptionPanel.getFieldValue("activity_log.activity_type");
		var activityLogIdValue = this.requestPanel.getFieldValue("activity_log.activity_log_id");
	    var tabs =  View.getControlsByType(parent, 'tabs')[0];
	    tabs.activityTypeValue = activityTypeValue;
//  	alert(activityTypeValue);
	    tabs.activityLogIdValue=activityLogIdValue;
	    var date_start = getQuestionnaireFieldValue("date_start");
	    var date_end = getQuestionnaireFieldValue("date_end");
	    var move_date = getQuestionnaireFieldValue("date_start");
	    //if currently is approve, save these two date for further use
	    tabs.date_start=date_start;
	    tabs.date_end=date_end;
	    tabs.move_date=move_date;
	    var restriction = new Ab.view.Restriction();
	    restriction.addClause("activity_log.activity_log_id", activityLogIdValue);
        if(activityTypeValue=="SERVICE DESK - INDIVIDUAL MOVE"){
        	//add parameter to decide next tab is for Edit and Approve
        	tabs.funcType = "individual_move_approve";
        	tabs.selectTab("indvMoveEditApprove", restriction, false, false, false);
        }else if(activityTypeValue=="SERVICE DESK - GROUP MOVE"){
        	//add parameter to decide next tab is for Edit and Approve
        	tabs.funcType = "group_move_approve";
        	tabs.selectTab("groupMoveEditApprove", restriction, false, false, false);
        }
	},
	
	myApprovalPanel_onReject:function(){
		ABHDRAC_rejectRequest(this.requestPanel);
	},
	
	myApprovalPanel_onForward:function(){
		ABHDRAC_forwardApproval(this.myApprovalPanel,this.requestPanel);
	},
	
	historyPanel_afterRefresh: function(){
		ABHDC_reloadHistoryPanel(this.historyPanel);
    },

	myApprovalPanel_onACID: function(){
		// function(formId, 
		// title, 
		// targetFieldNames, 
		// selectTableName, 
		// selectFieldNames, 
		// visibleFieldNames, 
        // restriction,
        // actionListener, 
        //applyFilter, 
        //showIndex, 
        //workflowRuleId, width, height,
        // selectValueType, recordLimit, sortValues)
        
		View.selectValue('myApprovalPanel',
		 'Account Code', 
		 ['activity_log.ac_id'], 
		 'ac', 
		 ['ac.ac_id'],
		 ['ac.ac_id','ac.description','ac.hierarchy_ids'], 
		 null, 
		 null, 
		 true, 			//applyFilter, 
		 true);
		 //, 			//showIndex, 
		 //null	,  			//workflowRuleId,
		 //null 	,			//width
		 //null	,			//height
		 //'hierTree');
	}
});

function checkSLA(panelId){
	SLA_showSLAParameters(panelId,true);
}
/**
 * private method
 * @param fieldName
 * @returns
 */
function getQuestionnaireFieldValue(fieldName){
	var activityTypeValue = helpdeskRequestApproveEditController.descriptionPanel.getFieldValue("activity_log.activity_type");
    var tabs =  View.getControlsByType(parent, 'tabs')[0];
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