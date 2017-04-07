function onCalculateInventoryUsage(){
	// kb 3042748 add Status bars and confirmation messages 
    var grid = View.panels.get('abBldgopsReportUnderstockedPtLevel1Grid');
    View.openProgressBar(View.getLocalizedString(this.z_PROGRESS_MESSAGE));  
		try {
			Workflow.callMethod('AbBldgOpsBackgroundData-calculateWorkResourceValues-CalculateInventoryUsage');
			View.closeProgressBar();
    		View.alert(getMessage('returnResult'));
			grid.refresh();
		}catch(e){
			Workflow.handleError(e);
			View.closeProgressBar();
			return;
		}
}