
/**
 * afterRefresh event for "abMoGroupListMoTa_list" panel - add to tab title the count of grid rows
 * @param {Object} gridPanel
 */
function abMoGroupListMoTa_list_afterRefresh(gridPanel){
	var tabsPanel = (View.panels.items[View.panels.items.length-1].tabs)?View.panels.items[View.panels.items.length-1]:View.getOpenerView().panels.items[View.getOpenerView().panels.items.length-1];
	if (tabsPanel.findTab("abGrMoApp_mota") ){
		var tab = tabsPanel.findTab("abGrMoApp_mota");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditComplete_mota") ){
		var tab = tabsPanel.findTab("abMoGroupEditComplete_mota");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditIssue_mota") ){
		var tab = tabsPanel.findTab("abMoGroupEditIssue_mota");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditReviewData_mota") ){
		var tab = tabsPanel.findTab("abMoGroupEditReviewData_mota");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditReviewVoice_mota") ){
		var tab = tabsPanel.findTab("abMoGroupEditReviewVoice_mota");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditReview_mota") ){
		var tab = tabsPanel.findTab("abMoGroupEditReview_mota");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditRoute_mota") ){
		var tab = tabsPanel.findTab("abMoGroupEditRoute_mota");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abExamMyMoPr_mota") ){
		var tab = tabsPanel.findTab("abExamMyMoPr_mota");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abGroupMoveExamine_mota") ){
		var tab = tabsPanel.findTab("abGroupMoveExamine_mota");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoveCalendar_mota") ){
		var tab = tabsPanel.findTab("abMoveCalendar_mota");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("mota") ){
		var tab = tabsPanel.findTab("mota");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}
}