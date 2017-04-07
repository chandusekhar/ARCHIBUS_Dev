var projProjectsOrgImpactController = View.createController('projProjectsOrgImpact', {

	afterViewLoad : function() {
		onCalcEndDatesForProject('');
	}
});

/****************************************************************
 * Project Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval('project.is_template = 0');
}
