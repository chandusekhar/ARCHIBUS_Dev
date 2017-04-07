/**
 * afterRefresh event for "grid_abMoGroupListCompleteLeaving_mo" panel - add to tab title the count of grid rows
 * @param {Object} gridPanel
 */
function grid_abMoGroupListCompleteLeaving_mo_afterRefresh(gridPanel){
	var tabsPanel = (View.panels.items[View.panels.items.length-1].tabs)?View.panels.items[View.panels.items.length-1]:View.getOpenerView().panels.items[View.getOpenerView().panels.items.length-1];
	if (tabsPanel.findTab("abMoGroupEditComplete_employee_leaving") ){
		var tab = tabsPanel.findTab("abMoGroupEditComplete_employee_leaving");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditReviewData_employee_leaving") ){
		var tab = tabsPanel.findTab("abMoGroupEditReviewData_employee_leaving");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditReviewVoice_employee_leaving") ){
		var tab = tabsPanel.findTab("abMoGroupEditReviewVoice_employee_leaving");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}
}

