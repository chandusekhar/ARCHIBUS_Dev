var projReviewActionsScheduleVarController = View.createController('projReviewActionsScheduleVar', {
	
	afterInitialDataFetch : function() {
		var project_id = View.getOpenerView().controllers.get('projManageConsole').project_id;
		onCalcEndDatesForProject(project_id);
	},
	
	selectProjectReport_afterRefresh : function() {
		var project_id = View.getOpenerView().controllers.get('projManageConsole').project_id;
		onCalcEndDatesForProject(project_id);	
	}
});
