/**
 * Functions from ab-mo-common.js for 2.0 views
 */

// Selects which move form to display based on the selected move type
// Also displays actions

function selectMoveAndActionTab(row)
{	
	var mo_type = row['mo.mo_type.raw'];

	if (mo_type == undefined) {
		mo_type = row['mo.mo_type'];
	}

	var restriction = row.grid.getPrimaryKeysForRow(row);
	
	var tabs = View.parentTab.parentPanel;

	switch (mo_type) 
	{
		case "Employee"  :
			tabs.showTab("page1");
			tabs.hideTab("page2");
			tabs.hideTab("page3");
			tabs.hideTab("page4");
			tabs.hideTab("page5");
			tabs.hideTab("page6");
			var tab = tabs.selectTab('page1', restriction);
			selectFirstVisibleTab(tab, "abMoEditReviewEmContainer_tabs", restriction);
			break;
		case "New Hire"  :
			tabs.showTab("page2");
			tabs.hideTab("page1");
			tabs.hideTab("page3");
			tabs.hideTab("page4");
			tabs.hideTab("page5");
			tabs.hideTab("page6");
			var tab = tabs.selectTab('page2',restriction);
			selectFirstVisibleTab(tab, "abMoEditReviewHireContainer_tabs", restriction);
			break;
		case "Leaving"   :
			tabs.showTab("page3");
			tabs.hideTab("page2");
			tabs.hideTab("page1");
			tabs.hideTab("page4");
			tabs.hideTab("page5");
			tabs.hideTab("page6");
			var tab = tabs.selectTab('page3',restriction);
			selectFirstVisibleTab(tab, "abMoEditReviewLeavingContainer_tabs", restriction);
			break;
		case "Equipment" :
			tabs.showTab("page4");
			tabs.hideTab("page2");
			tabs.hideTab("page3");
			tabs.hideTab("page1");
			tabs.hideTab("page5");
			tabs.hideTab("page6");
			var tab = tabs.selectTab('page4',restriction);
			selectFirstVisibleTab(tab, "abMoEditReviewEqContainer_tabs", restriction);
			break;
		case "Asset"     :
			tabs.showTab("page5");
			tabs.hideTab("page2");
			tabs.hideTab("page3");
			tabs.hideTab("page4");
			tabs.hideTab("page1");
			tabs.hideTab("page6");
			var tab = tabs.selectTab('page5',restriction);
			selectFirstVisibleTab(tab, "abMoEditReviewAssetContainer_tabs", restriction);
			break;
		case "Room"      :
			tabs.showTab("page6");
			tabs.hideTab("page2");
			tabs.hideTab("page3");
			tabs.hideTab("page4");
			tabs.hideTab("page5");
			tabs.hideTab("page1");
			var tab = tabs.selectTab('page6',restriction);
			selectFirstVisibleTab(tab, "abMoEditReviewRmContainer_tabs", restriction);
			break;
	}
}

function selectFirstVisibleTab(tab, tabsName, restriction){
	var contentFrame = tab.getContentFrame();
	if (contentFrame.View) {
		var tabs = contentFrame.View.panels.get(tabsName);
		tabs.setTabsRestriction(restriction);
		tabs.selectFirstVisibleTab();
	}
}

// Finds selected actions and passes them to the WFR to mark them as completed

function onCompleteSelectedActions () {
    var grid = View.panels.get("panel_abMoListCompleteAction");
    var rows = grid.getPrimaryKeysForSelectedRows();
	if (rows.length > 0) {
		var strIds = "";

		for (var i = 0; i < rows.length; i++) {
			var row = rows[i];
			if (strIds.length > 0)
				strIds += ",";
			strIds += row['activity_log.activity_log_id'];
		}
	    try {
	        Workflow.callMethod('AbMoveManagement-MoveService-completeSelectedActions', strIds);
	        grid.refresh();
	    } catch (e) {
	        Workflow.handleError(e);
	    }
	}
}

