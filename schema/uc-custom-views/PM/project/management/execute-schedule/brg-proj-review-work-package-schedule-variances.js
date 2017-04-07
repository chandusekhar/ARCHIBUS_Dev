function selectProjectReport_onclick(obj) {
	var restriction = obj.restriction;
	if (obj.restriction.clauses.length == 0) restriction = getConsoleRestrictionForActions();
	var grid = View.panels.get('projReviewWorkPackageScheduleVarGrid');
	grid.refresh(restriction);
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