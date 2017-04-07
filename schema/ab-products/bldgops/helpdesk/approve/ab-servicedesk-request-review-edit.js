

var helpdeskRequestApproveEditController = View.createController("helpdeskRequestApproveEditController",{
	
	quest: null,
	
	afterViewLoad: function(){
		//KB3044152 - Performance issue - use WFR to get workflow substitutes and avoid sub query 
		this.requestPanel.addParameter('emWorkflowSubstitutes', Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-getWorkflowSubstitutes','em_id').message);
	},
	
	afterInitialDataFetch: function(){
	},
	
	requestPanel_beforeRefresh: function(){
    },
	
	requestPanel_afterRefresh: function(){ 
	 	this.loadData();
    },	
    
    loadData: function(){
    	var activity_log_id = this.requestPanel.getFieldValue("activity_log.activity_log_id");
		var record = this.requestPanel.getRecord();
		
		if(record.values["activity_log.act_quest"] != null
	    	&& record.values["activity_log.act_quest"] != ''){
	    	record.values["activity_log.act_quest"] = convert2validXMLValue(record.values["activity_log.act_quest"]);
	    }
		
		//KB3023543 
		var restriction = new Ab.view.Restriction();
		restriction.addClause("activity_log.activity_log_id", activity_log_id, "="); 
		this.documentPanel.refresh(restriction); 
		 
		this.locationPanel.setRecord(record);
		this.equipmentPanel.setRecord(record);
		this.descriptionPanel.setRecord(record);
		
		this.myApprovalPanel.setRecord(record);
	 	
	 	this.locationPanel.show(true);
		this.equipmentPanel.show(true);
		this.descriptionPanel.show(true);
		this.priorityPanel.show(true);
		this.documentPanel.show(true);
		this.myApprovalPanel.show(true);
	 	
	
		var actType = this.descriptionPanel.getFieldValue("activity_log.activity_type");
		
   		ABHDC_checkHiddenFields(actType,this.equipmentPanel,this.locationPanel,this.documentPanel,this.descriptionPanel);
   		
   		
   		
   		this.quest = new Ab.questionnaire.Quest(actType, 'descriptionPanel');
		this.quest.showQuestions();
		
		ABHDC_getStepInformation("activity_log","activity_log_id",activity_log_id,this.historyPanel,"history",true);
   		
		SLA_clearPriorities("descriptionPanel","priorities");
		checkSLA("descriptionPanel");
		

		SLA_setPriority("requestPanel","descriptionPanel",this.descriptionPanel.getFieldValue("activity_log.proprity"),"priorities");

		ABHDRAC_handleApprovalFields("activity_log",this.myApprovalPanel,this.descriptionPanel);
		
		//fix KB3028086, remvoe the approve comments of the last request after load a new request(Guo 2011/04/11)
		$("comments").value = '';
   	},
    
   
    
   	requestPanel_onApprove:function(){
   		this.quest.beforeSaveQuestionnaire();
   		//ABHDRAC_approveRequest(this.requestPanel);
   		ABHDRAC_reviewRequest(this.requestPanel);
	},
	
	requestPanel_onReject:function(){
		ABHDRAC_rejectRequest(this.requestPanel);
	},
	
	requestPanel_onForward:function(){
		this.quest.beforeSaveQuestionnaire();
		ABHDRAC_forwardApproval(this.myApprovalPanel,this.requestPanel);
	},
	
	myApprovalPanel_onApprove:function(){
		this.quest.beforeSaveQuestionnaire();
		//ABHDRAC_approveRequest(this.requestPanel);
		ABHDRAC_reviewRequest(this.requestPanel);
	},
	
	myApprovalPanel_onReject:function(){
		ABHDRAC_rejectRequest(this.requestPanel);
	},
	
	myApprovalPanel_onForward:function(){
		this.quest.beforeSaveQuestionnaire();
		ABHDRAC_forwardApproval(this.myApprovalPanel,this.requestPanel);
	},

	historyPanel_afterRefresh: function(){
		ABHDC_reloadHistoryPanel(this.historyPanel);
    }
});


function onChangeProbtype(fieldName,selectedValue,previousValue){
	$(fieldName).value = selectedValue;
	
	var panel = View.panels.get("descriptionPanel");
	panel.setFieldValue("activity_log.prob_type",selectedValue);
	checkSLA('descriptionPanel');
	
	return true;
}

//KB3023542 
function adjustDocumentsPanel(){
	var documentPanel = View.panels.get("documentPanel");
	var historyPanel = View.panels.get("historyPanel");
	var myApprovalPanel = View.panels.get("myApprovalPanel");
	
	documentPanel.show(false);
	historyPanel.show(false);
	myApprovalPanel.show(false);
	
	documentPanel.show(true);
	historyPanel.show(true);
	myApprovalPanel.show(true);
}

function selectEquipment(){
	//alert(toJSON(restriction));
	View.selectValue(
		'locationPanel', 
		getMessage('equipment'),
		['activity_log.eq_id','activity_log.bl_id','activity_log.fl_id','activity_log.rm_id'],
		'eq',
		['eq.eq_id','eq.bl_id','eq.fl_id','eq.rm_id'],
		['eq.eq_id','eq.eq_std','eq.bl_id','eq.fl_id','eq.rm_id'],
		null,
		onEquipmentChangeField,
		true,
		true);
}	

function onEquipmentChangeField(fieldName,selectedValue,previousValue){
	if(fieldName == 'activity_log.eq_id'){
		var panel = View.panels.get("equipmentPanel");
		panel.setFieldValue(fieldName,selectedValue);
	}else{
		var panel = View.panels.get("locationPanel");
		if (panel.getFieldValue(fieldName) != selectedValue ) {
			panel.setFieldValue(fieldName,selectedValue);
		}
	}
	checkSLA('descriptionPanel');
	return true;
}

function checkSLA(panelId){
	SLA_showSLAParameters(panelId,false);
}