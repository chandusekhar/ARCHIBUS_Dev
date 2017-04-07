var projProjectsAnalysisController = View.createController('projProjectsAnalysis', {

	afterViewLoad : function() {
		onCalcEndDatesForProject('');
	}
});

/****************************************************************
 * Project Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval('brg_project_view.is_template = 0');
}