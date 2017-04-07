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

function selectProjectReport_onclick(obj) {
	var grid = View.panels.get('projReviewActionsScheduleVarDrilldownGrid');
	if (obj.restriction.clauses.length > 1) {
		grid.addParameter('project_work_pkg_restriction', "RTRIM(activity_log.project_id) ${sql.concat} ' - ' ${sql.concat} RTRIM(activity_log.work_pkg_id) = '" + obj.restriction.clauses[0].value + "'");
		grid.refresh();
	}
	else {
		grid.addParameter('project_work_pkg_restriction', '1=1');
		var restriction = View.panels.get('selectProjectReport').restriction;
		grid.refresh(restriction);
	}
	grid.showInWindow({
	    width: 800,
	    height: 500
	});
}
