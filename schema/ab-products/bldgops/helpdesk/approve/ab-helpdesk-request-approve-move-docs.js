/**
 * @author: Song
 */

var helpdeskRequestApproveEditController = View.createController("helpdeskRequestApproveEditController",{
	
	afterViewLoad: function(){
	},
	
	afterInitialDataFetch: function(){
		var tabs = View.getControlsByType(parent, 'tabs')[0];
		this.documentsPanel.addParameter("activity_log_id",tabs.activityLogIdValue);
		this.documentsPanel.refresh();
	},
	/**
	 * event handler when 'Approve' button click
	 * call WFR 'approveMoveServiceRequest'
	 * if no exception throw, call sub-method  changeTab complete invoke.
	 */
	documentsPanel_onApprove: function(){
		var tabs = View.getControlsByType(parent, 'tabs')[0];
 		var groupMoveDetailTab = tabs.findTab('groupMoveDetailTab');
 		var orginalController = groupMoveDetailTab.getContentFrame().View.controllers.get('helpdeskRequestApproveEditController');
 		var objRecordAndComments = orginalController.getRecordAndComments();
		var activityLogIdValue = tabs.activityLogIdValue;
		var result;
		try {
	   		    result = Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceTransactionProcess-approveMove"
	   				,activityLogIdValue*1,objRecordAndComments,tabs.dateEnd,tabs.assignments);
	   		}catch(e){
	   			Workflow.handleError(e); 
	   			return false;
	   		}
     	 if(result)
     		 this.changeTab(activityLogIdValue,tabs,"select");
	},
	/**
	 * private method
	 */
    changeTab: function(activityLogIdValue,tabs,tabName){
    	var restriction = new Ab.view.Restriction();
	    restriction.addClause("activity_log.activity_log_id", activityLogIdValue);
	    tabs.selectTab(tabName, restriction, false, false, false);
    },
    /**
     * event handler when 'Reject' button click
     * 1.find the previous tab 'groupMoveDetailTab' and call original method 'requestPanel_onReject''
     * 2.call method 'rejectRmpct' remove original assigned employee.
     * 3.if no exception throw, call sub-method  changeTab complete invoke.
     */
    documentsPanel_onReject: function(){
    	var tabs = View.getControlsByType(parent, 'tabs')[0];
 		var groupMoveDetailTab = tabs.findTab('groupMoveDetailTab');
		var orginalController = groupMoveDetailTab.getContentFrame().View.controllers.get('helpdeskRequestApproveEditController');
		var objRecordAndComments = orginalController.getRecordAndComments();
		var activityLogIdValue = tabs.activityLogIdValue;
		var result;
		try {
	   		    result = Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceTransactionProcess-rejectAll"
	   		    	,objRecordAndComments.record,objRecordAndComments.comments,activityLogIdValue*1,tabs.originalAssignments);
	   		}catch(e){
	   			Workflow.handleError(e); 
	   			return false;
	   		}
     	 if(result)
     		 this.changeTab(activityLogIdValue,tabs,"select");
	}
});
