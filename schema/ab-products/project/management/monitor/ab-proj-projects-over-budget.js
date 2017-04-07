var projProjectsOverBudgetController = View.createController('projProjectsOverBudget', {

	afterViewLoad : function() {
		onCalcEndDatesForProject('');
	},
	
	projProjectsOverBudgetGrid_afterRefresh: function() {
		if (this.projProjectsOverBudgetGrid.restriction) {
			var project_id = this.projProjectsOverBudgetGrid.restriction['project.project_id'];
			if (project_id) this.projProjectsOverBudgetGrid.appendTitle(project_id);
		}
	}
});

/****************************************************************
 * Project Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval('project.is_template = 0');
}