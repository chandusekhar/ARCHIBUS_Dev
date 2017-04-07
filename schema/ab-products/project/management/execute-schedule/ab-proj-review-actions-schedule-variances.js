var projReviewActionsScheduleVarController = View.createController('projReviewActionsScheduleVar', {
	
	afterInitialDataFetch : function() {
		onCalcEndDatesForProject('');
	}
});


function selectProjectReport_onclick(obj) {
	var grid = View.panels.get('projReviewActionsScheduleVarDrilldownGrid');
	if (obj.restriction.clauses.length > 0) {
		grid.addParameter('project_work_pkg_restriction', "RTRIM(activity_log.project_id) ${sql.concat} ' - ' ${sql.concat} RTRIM(activity_log.work_pkg_id) = '" + obj.restriction.clauses[0].value + "'");
		grid.refresh();
		grid.appendTitle(obj.restriction.clauses[0].value);
	}
	else {
		grid.addParameter('project_work_pkg_restriction', '1=1');
		var restriction = getConsoleRestrictionForActions();
		grid.refresh(restriction);
	}
	grid.showInWindow({
	    width: 800,
	    height: 500
	});
}

/****************************************************************
 * Project Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval("project.is_template = 0");
}