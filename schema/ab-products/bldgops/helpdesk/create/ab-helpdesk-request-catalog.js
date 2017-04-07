function showSpecifiedTabs() {
	var grid = View.panels.get('action_report');
	var requestType = grid.rows[grid.selectedRowIndex]['activitytype.activity_type'];
	var dynamicAssemblyTabsController = View.getOpenerView().controllers.get('dynamicAssemblyTabsController');
	dynamicAssemblyTabsController.showSpecifiedTabsByRequestType(requestType);
	return true;
}