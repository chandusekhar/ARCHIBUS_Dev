

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
		this.myApprovalPanel.setRecord(record);
	 	
	 	this.locationPanel.show(true);
		this.equipmentPanel.show(true);
		this.descriptionPanel.show(true);
		this.priorityPanel.show(true);
		this.documentPanel.show(true);
		this.myApprovalPanel.show(true);
	 	
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
    
 	requestPanel_onApprove:function(){
		ABHDRAC_approveRequest(this.requestPanel);
	},
	
	requestPanel_onReject:function(){
		ABHDRAC_rejectRequest(this.requestPanel);
	},
	
	requestPanel_onForward:function(){
		ABHDRAC_forwardApproval(this.myApprovalPanel,this.requestPanel);
	},
	
	myApprovalPanel_onApprove:function(){
		ABHDRAC_approveRequest(this.requestPanel);
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