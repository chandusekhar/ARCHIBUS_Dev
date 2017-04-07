/**
 * @author Zhang Yi
 */
var abRiskMsdsDefDocumentController = View.createController('abRiskMsdsDefDocumentController', {

	/**
	 * judge whether the assignment is existed abRiskMsdsDefLocsAssignmentList.
	 */
	abRiskMsdsDefMsdsDocForm_onDownload : function() {
		var url = this.abRiskMsdsDefMsdsDocForm.getFieldValue("msds_data.url");
		var msdsId = this.abRiskMsdsDefMsdsDocForm.getFieldValue("msds_data.msds_id");
		var isNew=false;
		if(!this.abRiskMsdsDefMsdsDocForm.getFieldValue("msds_data.doc")){
			isNew = true;
		}
		if(msdsId && url){
			try {
				result = Workflow.callMethod('AbRiskMSDS-MsdsCommon-downloadMsds', msdsId,url,isNew);
				this.abRiskMsdsDefMsdsDocForm.refresh();
				//kb#3034822: fire commands of action 'Save' after download WFR executes successfully
				var command = this.abRiskMsdsDefMsdsDocForm.actions.get(0).command;
				command.handle();
			} 
			catch (e) {
				Workflow.handleError(e);
			}
		}
		else{
			View.showMessage(getMessage('emptyUrl'));
		}
	}
});
