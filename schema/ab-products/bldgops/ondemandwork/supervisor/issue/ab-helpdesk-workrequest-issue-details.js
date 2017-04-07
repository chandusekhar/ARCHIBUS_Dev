var abHpdWrReqIssueDetailsController = View.createController("abHpdWrReqIssueDetailsController",{
	locArray:[],
	requestPanel_beforeRefresh: function(){
	},
	
	requestPanel_afterRefresh: function(){
 		var wrId = this.requestPanel.getFieldValue('wr.wr_id');
 	 	//var record = this.requestPanel.getRecord();
 	 	
 	 	var cfRestriction = new Ab.view.Restriction();
		cfRestriction.addClause("wrcf.wr_id", wrId, '=');
		this.cfPanel.refresh(cfRestriction);
		
		var partRestriction = new Ab.view.Restriction();
		partRestriction.addClause("wrpt.wr_id", wrId, '=');
		this.partPanel.refresh(partRestriction);
		
		var toolRestriction = new Ab.view.Restriction();
		toolRestriction.addClause("wrtl.wr_id", wrId, '=');
		this.toolPanel.refresh(toolRestriction);		
		
		var otherRestriction = new Ab.view.Restriction();
		otherRestriction.addClause("wr_other.wr_id", wrId, '=');
		this.otherPanel.refresh(otherRestriction);
  	
 	},
 	
 	locationPanel_afterRefresh: function(){
 		//KB3037458 - disable show floor plan button when fl_id is empty
        var flId = this.locationPanel.getFieldValue('wr.fl_id');
        if(flId){
        	this.locationPanel.actions.get('showFloorPlan').enable(true);
        }else{
        	this.locationPanel.actions.get('showFloorPlan').enable(false);
        }
 	}
});

 
function cancelWr(){
	var panel = View.panels.get("requestPanel");
	var wr_id = panel.getFieldValue("wr.wr_id");
	var result = {};
	try {
		 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-cancelWorkRequest',wr_id);
	} catch (e) {
		if (e.code == 'ruleFailed'){
			View.showMessage(e.message);
		}else{
		    Workflow.handleError(e);
		}
		return;
 	}
	if (result.code == 'executed'){
		var res = eval('('+result.jsonExpression+')');
		var openerView = View.getOpenerView();
		
		 	
		if(res.WOclosed){//if the work order is closed the system should go to the Select tab
			ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_workrequest_issue_update"] = true;
			openerView.parentTab.parentPanel.selectTab("select");
		} else {//if the work order is not closed, refresh the opener
			var woId = panel.getFieldValue("wr.wo_id");
		
			var restriction = new Ab.view.Restriction();
			restriction.addClause("wo.wo_id",woId,"=");
			
			openerView.parentTab.parentPanel.findTab("issue").restriction = restriction;
			openerView.parentTab.refresh(restriction);
		}
		 
		openerView.closeDialog();
	} else {
		Workflow.handleError(result);
	}
}