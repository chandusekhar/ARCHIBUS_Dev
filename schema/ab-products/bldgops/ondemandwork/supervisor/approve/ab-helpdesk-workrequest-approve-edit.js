

var abHpdWorkReqApproveEditController = View.createController("abHpdWorkReqApproveEditController",{
	
	/**
	 * After view loads
	 */
	afterViewLoad : function() {
		//KB3044152 - Performance issue - use WFR to get workflow substitutes and avoid sub query 
		this.requestPanel.addParameter('emWorkflowSubstitutes', Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-getWorkflowSubstitutes','em_id').message);
	},
	
	requestPanel_beforeRefresh: function(){
		$("comments").value = '';
	},
	
	requestPanel_afterRefresh: function(){
 		var record = this.requestPanel.getRecord();
				
		this.locationPanel.setRecord(record);
		this.equipmentPanel.setRecord(record);
		this.descriptionPanel.setRecord(record);
		this.estimationPanel.setRecord(record);
		this.documentsPanel.setRecord(record);
		this.myApprovalPanel.setRecord(record);
		
 
		this.locationPanel.show(true);
		this.equipmentPanel.show(true);
		this.descriptionPanel.show(true);
		this.estimationPanel.show(true);
		this.documentsPanel.show(true);
		this.historyPanel.show(true);
		this.myApprovalPanel.show(true);
		
 		ABODC_getStepInformation('wr','wr_id',this.requestPanel.getFieldValue("wr.wr_id"),this.historyPanel,"history",true);
		
		this.hideWRApprovalFields();
		//this.showWRApprovalFields();
		ABODC_hideEmptyDocumentPanel("wr",this.documentsPanel);
		ABODC_showPanelByFieldValue("wr.eq_id",this.equipmentPanel,'');
	},
	
	historyPanel_afterRefresh: function(){
		ABODC_reloadHistoryPanel(this.historyPanel);
    },
	/**
	 * Hide all form fields which may be required for some approval types
	 * <ul>
	 * 	<li>Account code</li>
	 * 	<li>Department code</li>
	 * 	<li>Division code</li>
	 * </ul>
	 */
	 hideWRApprovalFields: function(){
		var field = this.myApprovalPanel.getFieldElement('wr.ac_id');	
		field.parentNode.parentNode.style.display = "none"; 
	},

	/**
	 * Show form fields depending on approval type<br />
	 * Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/steps/StepHandler.html#getRequiredFieldsForStep(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-getRequiredFieldsForStep</a>
	 */
	showWRApprovalFields: function(){
		var approval_type = this.myApprovalPanel.getFieldValue("wr_step_waiting.step");
		var status = this.descriptionPanel.getFieldValue("wr.status");
		var result = {};
		try {	
			 result = Workflow.callMethod('AbBldgOpsHelpDesk-StepService-getRequiredFieldsForStep', approval_type,status);
		   } 
   		catch (e) {
		Workflow.handleError(e);
 		}
		if(result.code == 'executed'){
			var res = eval('('+result.jsonExpression+')');
			for(i=0;i<res.length;i++){
				var field = $('wr.'+res[i].field);
				field.parentNode.parentNode.style.display = '';
			}	
		} else {
			Workflow.handleError(result);	
		}
	}
	
	
});

/**
* Opens popup window with contract information for given equipment<br />
* Called by 'Show Contracts' button
*/
function onShowContracts(){
	var restriction = new Ab.view.Restriction();
	restriction.addClause("eq.eq_id",$("wr.eq_id").value,'=');
	View.openDialog("ab-helpdesk-request-equipment.axvw", restriction, false); 
}

/**
 * Opens popup with estimation for current request<br />
 * Called by 'Show Estimation' button
 */
function onShowEstimation(){
 	var rest = new Ab.view.Restriction();
	rest.addClause("wr.wr_id",$("wr.wr_id").value,"=");
	View.openDialog("ab-helpdesk-workrequest-estimation.axvw",rest,false);
}

/**
 * Opens popup with schedule for current request<br />
 * Called by 'Show Schedule' button
 */
function onShowSchedule(){
	var restriction = new Ab.view.Restriction();
	restriction.addClause("wr.wr_id",$("wr.wr_id").value,'=');
	
	View.openDialog("ab-helpdesk-workrequest-scheduling.axvw",restriction);
}

/**
 * Saves work request approval<br />
 * Called by 'Approve' button<br />
 * Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#approveWorkRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-approveWorkRequest</a>
 * @param {String} form current form
 */
function approveRequest(){
	
	var panel = View.panels.get("requestPanel");
	var record = ABODC_getDataRecord2(panel);
	
	var comments = document.getElementById("comments").value;
    var id = $("wr.wr_id").value;
    var result = {};
    try {  
		 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-approveWorkRequest', record,comments);
		} 
   		catch (e) {
		Workflow.handleError(e);
 		}
	if(result.code == 'executed'){
		ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_workrequest_approve_edit"] = true;
		var tabs = View.getOpenerView().panels.get("abHpdWorkReqApproveTabs");
		tabs.selectTab("select");
	} else {
		Workflow.handleError(result);
	}
}

/**
 * Save rejection for current request<br />
 * Called by 'Reject' button<br />
 * Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/ondemandwork/WorkRequestHandler.html#rejectWorkRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsOnDemandWork-rejectWorkRequest</a>
 * @param {String} form current form
 */
function rejectRequest(form){
	var panel = View.panels.get("requestPanel");
	var record = ABODC_getDataRecord2(panel);
	
	var comments = document.getElementById("comments").value;
    
    var result = {};
    try {
		 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-rejectWorkRequest', record,comments);
 		} 
   		catch (e) {
		Workflow.handleError(e);
 		}
	if(result.code == 'executed'){
		ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_workrequest_approve_edit"] = true;
		var tabs = View.getOpenerView().panels.get("abHpdWorkReqApproveTabs");
		tabs.selectTab("select");
	}else{
		Workflow.handleError(result);
	}
}

