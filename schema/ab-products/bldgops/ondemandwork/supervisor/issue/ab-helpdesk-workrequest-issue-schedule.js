var abHpdWrReqIssueScheduleController = View.createController("abHpdWrReqIssueScheduleController",{

	workOrderPanel_afterRefresh: function(){
 		var woId = this.workOrderPanel.getFieldValue('wo.wo_id');
 	 
		var woRestriction = new Ab.view.Restriction();
		woRestriction.addClause("wr.wo_id", woId, '=');
		
		this.requestReportGrid.refresh(woRestriction);
		this.partReportGrid.refresh(woRestriction);
		this.toolReportGrid.refresh(woRestriction);
		this.otherReportGrid.refresh(woRestriction);
	}
});