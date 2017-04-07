var abOndemandWoArchiveController = View.createController("abOndemandWoArchiveController",{
	
	afterInitialDataFetch: function() {
	},
	
	woOrderPanel_beforeRefresh: function(){
	},
	
	woOrderPanel_afterRefresh: function(){
		var woId = this.woOrderPanel.getFieldValue("wo.wo_id");
		var restriction = {"wr.wo_id":woId};
		this.wrPanel.refresh(restriction);
	},
	
	woOrderPanel_onCloseWorkOrder: function(){
		var wo_id = this.woOrderPanel.getFieldValue("wo.wo_id");
		
		// the work order is closed and archived
		try {
			var result = Workflow.callMethod("AbBldgOpsOnDemandWork-WorkRequestService-closeWorkOrder", wo_id);
		}catch(e){
			Workflow.handleError(e);
		}
		
		if(result.code == 'executed'){
			ABHDC_getTabsSharedParameters()["refresh_from_ab_ondemand-archive-select"] = true;
			View.parentTab.parentPanel.selectTab('select');
		} else {
			Workflow.handleError(result);
		}
	}
});