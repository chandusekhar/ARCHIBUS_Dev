/**
 * afterRefresh event for "grid_abMoGroupListCompleteRm_mo" panel - add to tab title the count of grid rows
 * @param {Object} gridPanel
 */
function grid_abMoGroupListCompleteRm_mo_afterRefresh(gridPanel){
	var tabsPanel = (View.panels.items[View.panels.items.length-1].tabs)?View.panels.items[View.panels.items.length-1]:View.getOpenerView().panels.items[View.getOpenerView().panels.items.length-1];
	if (tabsPanel.findTab("abMoGroupEditComplete_room") ){
		var tab = tabsPanel.findTab("abMoGroupEditComplete_room");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditReviewData_room") ){
		var tab = tabsPanel.findTab("abMoGroupEditReviewData_room");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditReviewVoice_room") ){
		var tab = tabsPanel.findTab("abMoGroupEditReviewVoice_room");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}
}

