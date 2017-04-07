/**
 * afterRefresh event for "assetmo_list" panel - add to tab title the count of grid rows
 * @param {Object} gridPanel
 */
function assetmo_list_afterRefresh(gridPanel){
	var tabsPanel = (View.panels.items[View.panels.items.length-1].tabs)?View.panels.items[View.panels.items.length-1]:View.getOpenerView().panels.items[View.getOpenerView().panels.items.length-1];
	if (tabsPanel.findTab("asset") ){
		var tab = tabsPanel.findTab("asset");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditIssue_asset") ){
		var tab = tabsPanel.findTab("abMoGroupEditIssue_asset");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditReview_asset") ){
		var tab = tabsPanel.findTab("abMoGroupEditReview_asset");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditRoute_asset") ){
		var tab = tabsPanel.findTab("abMoGroupEditRoute_asset");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}
}