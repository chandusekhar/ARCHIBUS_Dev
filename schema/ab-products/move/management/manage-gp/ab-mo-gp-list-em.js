/**
 * afterRefresh event for "emmo_list" panel - add to tab title the count of grid rows
 * @param {Object} gridPanel
 */
function emmo_list_afterRefresh(gridPanel){
	var tabsPanel = (View.panels.items[View.panels.items.length-1].tabs)?View.panels.items[View.panels.items.length-1]:View.getOpenerView().panels.items[View.getOpenerView().panels.items.length-1];
	if (tabsPanel.findTab("employee")) {
		var tab = tabsPanel.findTab("employee");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}
	else 
		if (tabsPanel.findTab("abMoGroupEditIssue_employee")) {
			var tab = tabsPanel.findTab("abMoGroupEditIssue_employee");
			tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
		}
		else 
			if (tabsPanel.findTab("abMoGroupEditReview_employee")) {
				var tab = tabsPanel.findTab("abMoGroupEditReview_employee");
				tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
			}
			else 
				if (tabsPanel.findTab("abMoGroupEditRoute_employee")) {
					var tab = tabsPanel.findTab("abMoGroupEditRoute_employee");
					tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
				}
	
}

/**
 *  Before delete selected move orders call WFR to delete their associated requested space transactions if there were
 *  Added by ZY for kb#3037865
 * @param {String} grid_id
 */
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
