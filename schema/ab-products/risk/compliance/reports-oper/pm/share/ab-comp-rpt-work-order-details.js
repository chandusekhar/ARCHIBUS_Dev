/**
 * Controller of the work request detail.
 */	
View.createController('woDetails', {
	afterInitialDataFetch : function(){
		this.abCompRptWrGrid.refresh("wrhwr.wo_id="+this.abCompWoColumnRpt.getRecord().getValue('wohwo.wo_id'));
		this.abCompRptWrGrid.show(true);
	}
});