/**
 * @fileoverview Javascript functions for <a href='../../../viewdoc/overview-summary.html#ab-helpdesk-request-view.axvw' target='main'>ab-helpdesk-request-view.axvw</a>
 */
var lastStepCode;
var lastStepLogId;
var lastStepType;

var abHelpdeskRequestViewController = View.createController("abHelpdeskRequestViewController",{
	locArray:[],

	afterInitialDataFetch: function(){
		this.requestPanel_afterRefresh();
	},
	
	requestPanel_afterRefresh: function(){
		this.refreshPanel();
		this.doPrepareWorks();
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
		var activityLogId = this.requestPanel.getFieldValue("activity_log_hactivity_log.activity_log_id");
		var status = this.descriptionPanel.getFieldValue("activity_log_hactivity_log.status");
		var quest = this.descriptionPanel.getFieldValue("activity_log_hactivity_log.act_quest");
		var act_type = this.descriptionPanel.getFieldValue("activity_log_hactivity_log.activity_type");
		
		var quest = new Ab.questionnaire.Quest(act_type, 'descriptionPanel', true);
		quest.showQuestions();
		
		ABHDC_checkHiddenFields(act_type,this.equipmentPanel,this.locationPanel,this.documentsPanel,this.priorityPanel);
		
		var steps = ABHDC_getStepInformation('activity_log_hactivity_log','activity_log_id',activityLogId,this.historyPanel,"history",true);
		
		if(steps.length != null && steps.length > 0) {
			// get last pending step, this can be verification or satisfaction survey	 
			var lastStep = null; // it is in reverse order ????? 
			
			//KB3044273 -  get the correct step log id of current user
			for(var i=0;i<steps.length;i++){
	            if (steps[i].date_response == "" && steps[i].user_name == View.user.name ) {
	            	lastStep = steps[i];
	            	break;
	            }
	        }
			 		
			if (lastStep) {
				lastStepLogId = lastStep.step_log_id;
				lastStepType = lastStep.step_type;	
				lastStepCode = lastStep.step_code;	
			}
		}		
		ABHDC_showPriorityLevel('activity_log_hactivity_log','activity_log_id','priority',this.priorityPanel,'activity_log_hactivity_log.priority');
		ABHDC_hideEmptyDocumentPanel('activity_log_hactivity_log',this.documentsPanel);
		ABHDC_hideEmptyConstsPanel('activity_log_hactivity_log',this.costsPanel);
		ABHDC_hideEmptySatisfactionPanel('activity_log_hactivity_log',this.satisfactionPanel);
		ABHDC_showPanelByFieldValue('activity_log_hactivity_log.eq_id',this.equipmentPanel,'');
		
	},
	
	historyPanel_afterRefresh: function(){
		ABHDC_reloadHistoryPanel(this.historyPanel);
    },
    
    refreshTab: function(){
    	ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_request_view_cancelRequest"] = true;
    }
});

/**
* Opens new dialog for satisfaction survey for current request<br />
* Called by button 'Satisfaction Survey' which is only shown when the request status is 'Completed'
*/
function showSatisfactionSurveyForm(){
	if (lastStepType!=null&&lastStepType.match("survey")) {
		var panel = View.panels.get("requestPanel");
		var activity_log_id = panel.getFieldValue("activity_log_hactivity_log.activity_log_id");
	
		var restriction = new Ab.view.Restriction();
		restriction.addClause("activity_log_step_waiting.activity_log_id", activity_log_id, '=');
		restriction.addClause("activity_log_step_waiting.step_log_id", lastStepLogId, '='); 
		
		View.openDialog("ab-helpdesk-request-satisfaction.axvw", restriction, false); 
	} else {
		alert(getMessage("surveyNotAllowed"));
	}
}

/**
* Opens new dialog for satisfaction survey for current request<br />
* Called by button 'Satisfaction Survey' which is only shown when the request status is 'Completed'
*/
function showVerificationForm(){
	if (lastStepType!=null&&lastStepType.match("verification")) {
		var panel = View.panels.get("requestPanel");
		var activity_log_id = panel.getFieldValue("activity_log_hactivity_log.activity_log_id");
	
		var restriction = new Ab.view.Restriction();
		restriction.addClause("activity_log_step_waiting.activity_log_id", activity_log_id, '=');
		restriction.addClause("activity_log_step_waiting.step_log_id", lastStepLogId, '=');
		View.openDialog("ab-helpdesk-request-verification.axvw", restriction, false); 
		
	} else {
		alert(getMessage("verificationNotAllowed"));
	}

}

/**
* Opens window with workorder or work request for current action item<br />
* Called by 'Show Related On Demand Work' button<br />
* Opened dialog depends on whether a work request or a work order is linked to the action item (i.e. wr_id or wo_id given)
*/
function showOnDemand(){
	
	var panel = View.panels.get("requestPanel");
		
	if((panel.getFieldValue("activity_log_hactivity_log.wr_id")=='' || panel.getFieldValue("activity_log_hactivity_log.wr_id")== 0)
		 && (panel.getFieldValue("activity_log_hactivity_log.wo_id") == '' || panel.getFieldValue("activity_log_hactivity_log.wo_id") == 0)){
		alert("No workorder or work request for this request");
	} else {	
		if(panel.getFieldValue("activity_log_hactivity_log.wr_id")!='' && panel.getFieldValue("activity_log_hactivity_log.wr_id") != 0){	
			var restriction = new Ab.view.Restriction();
			restriction.addClause("wr.wr_id",parseInt(panel.getFieldValue("activity_log_hactivity_log.wr_id")),'=');
			View.openDialog("ab-helpdesk-request-ondemand-wr.axvw",restriction, false);			
		}else if(panel.getFieldValue("activity_log_hactivity_log.wo_id")!='' && panel.getFieldValue("activity_log_hactivity_log.wo_id")!=0) {
			var restriction = new Ab.view.Restriction();
			restriction.addClause("wo.wo_id",parseInt(panel.getFieldValue("activity_log_hactivity_log.wo_id")),'=');
			View.openDialog("ab-helpdesk-request-ondemand-wo.axvw",restriction, false);
		}
	}
}

/**
 * Cancel request before it has been approved<br />
 * This function is called by the 'Cancel' button which is only shown if the request status is 'Requested'<br />
 * Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/helpdesk/RequestHandler.html#deleteRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-deleteRequest</a> and returns to select tab
 * @param {String} form name of current form
 */
function cancelRequest(){
	if(confirm(getMessage("confirmCancel"))) {	
		var panel = View.panels.get("requestPanel");
		var activityRecord = ABHDC_getDataRecord2(panel); 
		/*   
		var parameters = {
			"fields" : record
		}
		*/
		var activityLogId=panel.getFieldValue("activity_log_hactivity_log.activity_log_id")
		var records=View.dataSources.get('rmpctDS').getRecords("rmpct.activity_log_id="+activityLogId);
		//KB3046859 - only call space WFR to cancel when rmpct records not empty	
		if (records.length > 0) {
			var assignmentArray=[];
			
			var date = '2012-12-12';//a test date when parameter 'assignmentArray' was empty.
			for(var i=0;i<records.length;i++){
				var record=records[i];
				var obj=new Object();
				obj['pct_id']=record.values["rmpct.pct_id"];
				obj['bl_id']=record.values["rmpct.bl_id"];
				obj['fl_id']=record.values["rmpct.fl_id"];
				obj['rm_id']=record.values["rmpct.rm_id"];
				obj['activity_log_id']=parseInt(activityLogId);
				obj['em_id']=record.values["rmpct.em_id"];
				obj['parent_pct_id']=record.values["rmpct.parent_pct_id"];
				obj['from_bl_id']=record.values["rmpct.from_bl_id"];
				obj['from_fl_id']=record.values["rmpct.from_fl_id"];
				obj['from_rm_id']=record.values["rmpct.from_rm_id"];
				obj['status']=record.values["rmpct.status"];
				obj['dv_id']=record.values["rmpct.dv_id"];
				obj['dp_id']=record.values["rmpct.dp_id"];
				obj['rm_cat']=record.values["rmpct.rm_cat"];
				obj['rm_type']=record.values["rmpct.rm_type"];
				obj['primary_rm']=record.values["rmpct.primary_rm"];
				obj['primary_em']=record.values["rmpct.primary_em"];
	    		
				if(i==0){
					date = record.values["rmpct.date_start"];
					var year = date.getFullYear();
				    var month = date.getMonth() + 1;
				    var day = date.getDate();
				    if(month<10)month="0"+month;
				    if(day<10)day="0"+day;
				    date= year+"-"+month+"-"+day;
				}
				assignmentArray.push(obj);
			}
			var result = null;
			try {
				 result = Workflow.callMethod('AbSpaceRoomInventoryBAR-SpaceTransactionProcess-deleteAll',
						parseInt(activityLogId),activityRecord,assignmentArray,date);
			}catch(e){
				Workflow.handleError(e);
			}
		}else{
			try {
				var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-deleteRequest', activityRecord);
			}catch(e){
				Workflow.handleError(e);
			}
		}
		
		if(result.code=='executed'){
			ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_request_view_cancelRequest"] = true;
			// KB 3023713 edit by weijie
			View.parentTab.parentPanel.selectTab('select');
		} else {
			Workflow.handleError(result);
		}
	}
}