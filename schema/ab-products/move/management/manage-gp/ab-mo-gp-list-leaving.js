/**
 * afterRefresh event for "leavingmo_list" panel - add to tab title the count of grid rows
 * @param {Object} gridPanel
 */
function leavingmo_list_afterRefresh(gridPanel){
	var tabsPanel = (View.panels.items[View.panels.items.length-1].tabs)?View.panels.items[View.panels.items.length-1]:View.getOpenerView().panels.items[View.getOpenerView().panels.items.length-1];
	if (tabsPanel.findTab("leaving") ){
		var tab = tabsPanel.findTab("leaving");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditIssue_employee_leaving") ){
		var tab = tabsPanel.findTab("abMoGroupEditIssue_employee_leaving");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditReview_employee_leaving") ){
		var tab = tabsPanel.findTab("abMoGroupEditReview_employee_leaving");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditRoute_employee_leaving") ){
		var tab = tabsPanel.findTab("abMoGroupEditRoute_employee_leaving");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	} 
}