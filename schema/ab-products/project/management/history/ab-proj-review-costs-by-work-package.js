var projReviewCostsWorkPkgController = View.createController('projReviewCostsWorkPkg', {
	
	projReviewCostsWorkPkgCrossTable_afterRefresh: function() {
		if (this.projReviewCostsWorkPkgCrossTable.restriction) {
			var project_id = this.projReviewCostsWorkPkgCrossTable.restriction['project.project_id'];
			if (project_id) this.projReviewCostsWorkPkgCrossTable.appendTitle(project_id);
		}
	}
});

/****************************************************************
 * Project Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval('project.is_template = 0');
}