var abHpdWrReqIssueController = View.createController('abHpdWrReqIssueController', {
	
	afterInitialDataFetch: function() {
		//Guo added 2010-09-10 to fox KB3023963 and KB3028371
		//abHdWoPrintCommonControllert is defined in js file ab-helpdesk-workorder-print-common.js
		abHdWoPrintCommonControllert.createMenuOfPrintButton(this, 'printWO');
	},
 
	woPanel_afterRefresh: function() {
		var record = this.woPanel.getRecord();
		
		var woId = record.getValue('wo.wo_id');
		var wrRestriction = new Ab.view.Restriction();
		wrRestriction.addClause('wo.wo_id', woId, '=');

		this.requestReportGrid.refresh(wrRestriction);
		//this.requestReportGrid.show(true, true);
	},
	
	/**
	 * Fetch data for the report grid restricted by values from the console
	 */
	woPanel_onIssueWO: function () {
		var woId = this.woPanel.getFieldValue('wo.wo_id');
		var result = {};
		try {
			result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-issueWorkorder', woId);
		}catch (e) {
		  if (e.code == 'ruleFailed') {
              View.showMessage(e.message);
          }else{
              Workflow.handleError(e);
          }
           return;
 		}	
		if (result.code == 'executed'){
			ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_workrequest_issue_update"] = true;
			
			//Refresh the grid
			var wrRestriction = new Ab.view.Restriction();
			wrRestriction.addClause('wo.wo_id', woId, '=');
			this.requestReportGrid.refresh(wrRestriction);
		} else {
			Workflow.handleError(result);
		}
	},

	requestReportGrid_onCancelWrs: function(){
	
		var records = this.requestReportGrid.getPrimaryKeysForSelectedRows();
		if(records.length < 1){
			View.showMessage(getMessage("noRowSelected"));
			return;
		}
	
		for (var i = 0; i < records.length; i++) {
			var record = records[i];
			if (record['wr.status'] == 'Cancelled') {
				View.showMessage(getMessage("alreadyCancelled"));
				return;
			}
		}
		var result = {};
		try {
			 result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-cancelWorkRequests', records);
		}catch (e) {
			if (e.code == 'ruleFailed'){
				View.showMessage(e.message);
			}else{
			   Workflow.handleError(e);
			}
			return;
 		}
		if (result.code == 'executed'){
			var res = eval('('+result.jsonExpression+')');
			if(res.WOclosed){//if the work order is closed the system should go to the Select tab
				ABHDC_getTabsSharedParameters()["refresh_from_ab_helpdesk_workrequest_issue_update"] = true;
				View.parentTab.parentPanel.selectTab('select');
			} else {//if the work order is not closed, refresh the opener
				//just refresh the grid.
				var woId = this.woPanel.getFieldValue('wo.wo_id');
				var wrRestriction = new Ab.view.Restriction();
				wrRestriction.addClause('wo.wo_id', woId, '=');
				this.requestReportGrid.refresh(wrRestriction);
			}
		} else {
			Workflow.handleError(result);
		}
	},
	
    //Guo added 2010-09-10 to fox KB3023963 and KB3028371
    getPrintRestriction: function(){
        var restriction = null;
        
        var woId = this.woPanel.getFieldValue('wo.wo_id');
        if (woId) {
            restriction = ' wo_id =' + woId;
        }
        
        return restriction;
    }
});

 