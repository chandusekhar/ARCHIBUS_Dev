/**
 * afterRefresh event for "rmmo_list" panel - add to tab title the count of grid rows
 * @param {Object} gridPanel
 */
function rmmo_list_afterRefresh(gridPanel){
	var tabsPanel = (View.panels.items[View.panels.items.length-1].tabs)?View.panels.items[View.panels.items.length-1]:View.getOpenerView().panels.items[View.getOpenerView().panels.items.length-1];
	if (tabsPanel.findTab("room") ){
		var tab = tabsPanel.findTab("room");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditIssue_room") ){
		var tab = tabsPanel.findTab("abMoGroupEditIssue_room");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditReview_room") ){
		var tab = tabsPanel.findTab("abMoGroupEditReview_room");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditRoute_room") ){
		var tab = tabsPanel.findTab("abMoGroupEditRoute_room");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	} 
}