var projProjectsAnalysisController = View.createController('projProjectsAnalysis', {

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