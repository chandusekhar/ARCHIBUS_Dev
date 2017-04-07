/**
 * Call workflow CalculateInventoryUsage for calculate part inventory
 */
function calculateInventoryUsage(){
	// kb 3042748 add Status bars and confirmation messages 
    var grid = View.panels.get('detailsPanel');
    View.openProgressBar(View.getLocalizedString(this.z_PROGRESS_MESSAGE));  
		try {
			Workflow.callMethod('AbBldgOpsBackgroundData-calculateWorkResourceValues-CalculateInventoryUsageForMPSL');
			View.closeProgressBar();
    		View.alert(getMessage('calculateAlertMessage'));
			grid.refresh();
		}catch(e){
			Workflow.handleError(e);
			View.closeProgressBar();
			return;
		}
}
