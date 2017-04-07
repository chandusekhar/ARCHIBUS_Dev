/**
 * afterRefresh event for "grid_abMoGroupListCompleteEq_mo" panel - add to tab title the count of grid rows
 * @param {Object} gridPanel
 */
function grid_abMoGroupListCompleteEq_mo_afterRefresh(gridPanel){
	var tabsPanel = (View.panels.items[View.panels.items.length-1].tabs)?View.panels.items[View.panels.items.length-1]:View.getOpenerView().panels.items[View.getOpenerView().panels.items.length-1];
	if (tabsPanel.findTab("abMoGroupEditComplete_equipment") ){
		var tab = tabsPanel.findTab("abMoGroupEditComplete_equipment");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditReviewData_equipment") ){
		var tab = tabsPanel.findTab("abMoGroupEditReviewData_equipment");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditReviewVoice_equipment") ){
		var tab = tabsPanel.findTab("abMoGroupEditReviewVoice_equipment");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}
}

