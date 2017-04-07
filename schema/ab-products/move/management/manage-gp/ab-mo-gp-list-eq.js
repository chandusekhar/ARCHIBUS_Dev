/**
 * afterRefresh event for "eqmo_list" panel - add to tab title the count of grid rows
 * @param {Object} gridPanel
 */
function eqmo_list_afterRefresh(gridPanel){
	var tabsPanel = (View.panels.items[View.panels.items.length-1].tabs)?View.panels.items[View.panels.items.length-1]:View.getOpenerView().panels.items[View.getOpenerView().panels.items.length-1];
	if (tabsPanel.findTab("equipment") ){
		var tab = tabsPanel.findTab("equipment");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditIssue_equipment") ){
		var tab = tabsPanel.findTab("abMoGroupEditIssue_equipment");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditReview_equipment") ){
		var tab = tabsPanel.findTab("abMoGroupEditReview_equipment");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditRoute_equipment") ){
		var tab = tabsPanel.findTab("abMoGroupEditRoute_equipment");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}
}