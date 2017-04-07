/**
 * afterRefresh event for "abMoGroupListMoEq_list" panel - add to tab title the count of grid rows
 * @param {Object} gridPanel
 */
function abMoGroupListMoEq_list_afterRefresh(gridPanel){
	var tabsPanel = (View.panels.items[View.panels.items.length-1].tabs)?View.panels.items[View.panels.items.length-1]:View.getOpenerView().panels.items[View.getOpenerView().panels.items.length-1];
	if (tabsPanel.findTab("abGrMoApp_moeq") ){
		var tab = tabsPanel.findTab("abGrMoApp_moeq");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditComplete_moeq") ){
		var tab = tabsPanel.findTab("abMoGroupEditComplete_moeq");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditIssue_moeq") ){
		var tab = tabsPanel.findTab("abMoGroupEditIssue_moeq");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditReviewData_moeq") ){
		var tab = tabsPanel.findTab("abMoGroupEditReviewData_moeq");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditReviewVoice_moeq") ){
		var tab = tabsPanel.findTab("abMoGroupEditReviewVoice_moeq");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditReview_moeq") ){
		var tab = tabsPanel.findTab("abMoGroupEditReview_moeq");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoGroupEditRoute_moeq") ){
		var tab = tabsPanel.findTab("abMoGroupEditRoute_moeq");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abExamMyMoPr_moeq") ){
		var tab = tabsPanel.findTab("abExamMyMoPr_moeq");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abGroupMoveExamine_moeq") ){
		var tab = tabsPanel.findTab("abGroupMoveExamine_moeq");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("abMoveCalendar_moeq") ){
		var tab = tabsPanel.findTab("abMoveCalendar_moeq");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}else if (tabsPanel.findTab("moeq") ){
		var tab = tabsPanel.findTab("moeq");
		tab.setTitle(tab.getTitle().split(" (")[0] + " (" + gridPanel.gridRows.length + ")");
	}
}