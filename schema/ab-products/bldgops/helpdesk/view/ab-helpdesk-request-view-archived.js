
var abHelpdeskRequestViewArchivedController = View.createController("abHelpdeskRequestViewArchivedController",{

	requestPanel_afterRefresh: function(){
		this.refreshPanel();
		this.doPrepareWorks();
		//View.log("-->000****","info");
	},
	
	refreshPanel: function(){

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
	},
	/**
	* Called when loading the form
	* <div class='detailHead'>Pseudo-code:</div>
	*	<ol>
	* 		<li>Show button for Satisfaction survey if request status is 'Completed'</li>
	* 		<li>Show button to Cancel the request if request status is 'Requested'</li>
	* 		<li>Show questionnaire answers</li>
	* 		<li>Show request fields according the request type</li>
	* 		<li>Show workflow step history</li>
	* 		<li>Show priority label</li>
	* 		<li>Hide documents, costs, satisfaction and/or equipment panels if empty</li>
	* 	</ol>
	*/
	doPrepareWorks: function(){
		var activityLogId = this.requestPanel.getFieldValue("hactivity_log.activity_log_id");
		var status = this.descriptionPanel.getFieldValue("hactivity_log.status");
		var quest = this.descriptionPanel.getFieldValue("hactivity_log.act_quest");
		var act_type = this.descriptionPanel.getFieldValue("hactivity_log.activity_type");
		
		this.descriptionPanel.setFieldValue("activity_log.act_quest", quest);		

		var quest = new Ab.questionnaire.Quest(act_type, 'descriptionPanel', true);
		quest.showQuestions();

		ABHDC_checkHiddenFields(act_type,this.equipmentPanel,this.locationPanel,this.documentsPanel,this.priorityPanel);
		ABHDC_getStepInformation('hactivity_log','activity_log_id',activityLogId,this.historyPanel,"history",true);

		ABHDC_showPriorityLevel('hactivity_log','activity_log_id','priority',this.priorityPanel,'hactivity_log.priority');
		ABHDC_hideEmptyDocumentPanel('hactivity_log',this.documentsPanel);
		ABHDC_hideEmptyConstsPanel('hactivity_log',this.costsPanel);

		ABHDC_hideEmptySatisfactionPanel('hactivity_log',this.satisfactionPanel);
		ABHDC_showPanelByFieldValue('hactivity_log.eq_id',this.equipmentPanel,'');
	},
	
	historyPanel_afterRefresh: function(){
		ABHDC_reloadHistoryPanel(this.historyPanel);
    }
});

/**
* Opens window with workorder or work request for current action item<br />
* Called by 'Show Related On Demand Work' button<br />
* Opened dialog depends on whether a work request or a work order is linked to the action item (i.e. wr_id or wo_id given)
*/
function showOnDemand(){
	var panel = View.panels.get("requestPanel");
	
	if(panel.getFieldValue("hactivity_log.wr_id") == '' && panel.getFieldValue("hactivity_log.wo_id") == ''){
		alert("No workorder or work request for this request");
	} else {	
		if(panel.getFieldValue("hactivity_log.wr_id") != ''){	
			var restriction = new Ab.view.Restriction();
			restriction.addClause("hwr.wr_id",parseInt(panel.getFieldValue("hactivity_log.wr_id")),'=');
			Ab.view.View.openDialog("ab-helpdesk-request-ondemand-hwr.axvw",restriction, false);			
		} else if(panel.getFieldValue("hactivity_log.wo_id") != '') {
			var restriction = new Ab.view.Restriction();
			restriction.addClause("hwo.wo_id",panel.getFieldValue("hactivity_log.wo_id"),'=');
			AFM.view.View.openDialog("ab-helpdesk-request-ondemand-hwo.axvw",restriction, false);
		}
	}
}

