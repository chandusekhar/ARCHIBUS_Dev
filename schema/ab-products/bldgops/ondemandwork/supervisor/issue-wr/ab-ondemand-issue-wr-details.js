var abOndemandIssueWrDetailsController = View.createController("abOndemandIssueWrDetailsController",{
	locArray:[],
	afterInitialDataFetch: function() {
		//Guo added 2010-09-10 to fox KB3023963 and KB3028371
		//abHdWoPrintCommonControllert is defined in js file ab-helpdesk-workorder-print-common.js
		abHdWoPrintCommonControllert.createMenuOfPrintButton(this, 'printWO');
	},
	
	requestPanel_beforeRefresh: function(){
	},
	
	requestPanel_afterRefresh: function(){
 		var wrId = this.requestPanel.getFieldValue('wr.wr_id');
 	 	var record = this.requestPanel.getRecord();
 	 	
 	 	this.locationPanel.setRecord(record);
 	 	this.estimationPanel.setRecord(record);
 	 	
 	 	this.locationPanel.show(true);
 	 	this.estimationPanel.show(true);
 	 	
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
		
		//KB3037458 - disable show floor plan button when fl_id is empty
        var flId = this.locationPanel.getFieldValue('wr.fl_id');
        if(flId){
        	this.locationPanel.actions.get('showFloorPlan').enable(true);
        }else{
        	this.locationPanel.actions.get('showFloorPlan').enable(false);
        }
  	},
	  
	//Guo added 2010-09-10 to fox KB3023963 and KB3028371
	//ER 11/2/11: updated for wr_id restriction
	getPrintRestriction: function(){
	  var restriction = null;
	  
	  var wrId = this.requestPanel.getFieldValue('wr.wr_id');
	  if (wrId) {
	      restriction = ' wr_id =' + wrId;
	  }
	  
	  return restriction;
	}
});


function issueWO(){
	if(confirm(getMessage("confirmMessage"))){
		var wo_id = $("wr.wo_id").value;	
		var result = {};
		try {
			 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-issueWorkorder', wo_id);
	    } catch (e) {
	       if (e.code == 'ruleFailed') {
              View.showMessage(e.message);
           }else{
              Workflow.handleError(e);
           }
           return;
 	    }
		if (result.code == 'executed'){
			ABHDC_getTabsSharedParameters()["refresh_from_ab_ondemand_issue_wr_update"] = true;
			View.parentTab.loadView();
		} else {
			Workflow.handleError(result);
		}
	}
}

/**
 * Print Work order<br />
 * Opens dialog to export pdf from current workorder
 * @param {String} form current form
 * @param {String} strSerialized
 */


function cancelWr(){
	var wr_id = $("wr.wr_id").value;
	var result = {};
	try {
		 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-cancelWorkRequest',wr_id);
	} catch (e){
		if (e.code == 'ruleFailed'){
			View.showMessage(e.message);
		}else{
		    Workflow.handleError(e);
		}
		return; 	 
	}
	if (result.code == 'executed'){
		ABHDC_getTabsSharedParameters()["refresh_from_ab_ondemand_issue_wr_update"] = true;
		View.parentTab.parentPanel.selectTab("select");
	} else {
		Workflow.handleError(result);
	}
}