/**
 * afterRefresh event for "hiremo_list" panel - add to tab title the count of grid rows
 * @param {Object} gridPanel
 */
function hiremo_list_afterRefresh(gridPanel){
	var tabsPanel = (View.panels.items[View.panels.items.length-1].tabs)?View.panels.items[View.panels.items.length-1]:View.getOpenerView().panels.items[View.getOpenerView().panels.items.length-1];
	if (tabsPanel.findTab("newhire") ){
		var tab = tabsPanel.findTab("newhire");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditIssue_new_hire") ){
		var tab = tabsPanel.findTab("abMoGroupEditIssue_new_hire");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditReview_new_hire") ){
		var tab = tabsPanel.findTab("abMoGroupEditReview_new_hire");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditRoute_new_hire") ){
		var tab = tabsPanel.findTab("abMoGroupEditRoute_new_hire");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	} 
}