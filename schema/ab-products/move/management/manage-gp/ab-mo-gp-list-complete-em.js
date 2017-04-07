/**
 * afterRefresh event for "grid_abMoGroupListCompleteEm_pr" panel - add to tab title the count of grid rows
 * @param {Object} gridPanel
 */
function grid_abMoGroupListCompleteEm_pr_afterRefresh(gridPanel){
	var tabsPanel = (View.panels.items[View.panels.items.length-1].tabs)?View.panels.items[View.panels.items.length-1]:View.getOpenerView().panels.items[View.getOpenerView().panels.items.length-1];
	if (tabsPanel.findTab("abMoGroupEditComplete_employee") ){
		var tab = tabsPanel.findTab("abMoGroupEditComplete_employee");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditReviewData_employee") ){
		var tab = tabsPanel.findTab("abMoGroupEditReviewData_employee");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditReviewVoice_employee") ){
		var tab = tabsPanel.findTab("abMoGroupEditReviewVoice_employee");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}
}


function deleteRequestedSpaceTransaction(grid_id){
	var objGrid = View.panels.get(grid_id);
	var selectedRows = objGrid.getPrimaryKeysForSelectedRows();
	if(selectedRows.length == 0){
		View.showMessage(getMessage('msg_edtm_no_selection'));
		return;
	}
	var moIdList= ""+ selectedRows[0]['mo.mo_id'];
	for(var i=1; i<selectedRows.length; i++){
		moIdList =moIdList +"," + selectedRows[i]['mo.mo_id'];
	}
	try {
		Workflow.callMethod('AbMoveManagement-MoveService-deleteRequestedSpaceTransactions', moIdList);
	} catch (e) {
		Workflow.handleError(e);
		return false;
	}
}
