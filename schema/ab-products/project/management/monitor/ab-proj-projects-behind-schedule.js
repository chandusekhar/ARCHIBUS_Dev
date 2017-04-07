var projProjectsBehindScheduleController = View.createController('projProjectsBehindSchedule', {

	afterViewLoad : function() {
		onCalcEndDatesForProject('');
	}
});

function selectProjectReport_onclick(obj) {
	if (obj.restriction.clauses.length < 1) return;
	View.panels.get('projProjectsBehindScheduleGrid').refresh(obj.restriction);
	View.panels.get('projProjectsBehindScheduleGrid').show(true);	
}

/****************************************************************
 * Project Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval('project.is_template = 0');
}
