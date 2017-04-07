/**
 * afterRefresh event for "grid_abMoGroupListAction_ac" panel - add to tab title the count of grid rows
 * @param {Object} gridPanel
 */
function grid_abMoGroupListAction_ac_afterRefresh(gridPanel){
	var tabsPanel = (View.panels.items[View.panels.items.length-1].tabs)?View.panels.items[View.panels.items.length-1]:View.getOpenerView().panels.items[View.getOpenerView().panels.items.length-1];
	if (tabsPanel.findTab("abMoGroupEditIssue_action") ){
		var tab = tabsPanel.findTab("abMoGroupEditIssue_action");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditReview_action") ){
		var tab = tabsPanel.findTab("abMoGroupEditReview_action");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditRoute_action") ){
		var tab = tabsPanel.findTab("abMoGroupEditRoute_action");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}
}
