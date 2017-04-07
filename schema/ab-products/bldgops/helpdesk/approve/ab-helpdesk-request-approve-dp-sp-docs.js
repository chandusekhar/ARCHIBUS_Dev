
var editAndApproveController = View.createController("editAndApproveController",
{	assignControllor:'',
	requestPanel_afterRefresh : function() {
		var mainTabs = View.parentTab.parentPanel;
		this.assignControllor=mainTabs.lastController;
		var record = this.requestPanel.getRecord();
		this.problemPanel.setRecord(record);
		this.problemPanel.show(true);
		this.documentsPanel.refresh(
				this.requestPanel.restriction, false);

		ABHDC_showPriorityLevel("activity_log",
				"activity_log_id", "priority",
				this.problemPanel, "activity_log.priority");
		
	},
	
	/**
	 * 	Approve assignments by call method that from ab-helpdesk-request-dp-sp-assign.axvw
	 */
	requestPanel_onApprove: function(){
		
	var mainTabs = View.parentTab.parentPanel;

		try {
			var result = Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceTransactionProcess-approveDepartmentSpace",mainTabs.approveActivityRecord,mainTabs.comments, mainTabs.requestDate,parseInt(mainTabs.activityLogId),mainTabs.newAssignment);

		}catch(e){
			if (e.code == 'ruleFailed'){
				View.showMessage(e.message);
			}else{
				Workflow.handleError(e);
			}
			return;
		}
	    	mainTabs.selectTab("select");
 		
	},
	/**
	 * 	Reject assignments by call method that from ab-helpdesk-request-dp-sp-assign.axvw
	 */
  /**
    * Reject department space assignment request.
    */
	requestPanel_onReject: function(){
		
		var mainTabs = View.parentTab.parentPanel;

		try {
			var result = Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceTransactionProcess-rejectAll",mainTabs.approveActivityRecord,mainTabs.comments,parseInt(mainTabs.activityLogId),mainTabs.originalAssignments);

		}catch(e){
			if (e.code == 'ruleFailed'){
				View.showMessage(e.message);
			}else{
				Workflow.handleError(e);
			}
			return;
		}
	    	mainTabs.selectTab("select");
	}
	
});
