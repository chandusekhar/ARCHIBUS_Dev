var projMilestoneStatusesController = View.createController('projMilestoneStatuses', {
	projMilestoneStatusesGrid_afterRefresh: function() {
		if (this.projMilestoneStatusesGrid.restriction) {
			var project_id = this.projMilestoneStatusesGrid.restriction['project.project_id'];
			if (project_id) this.projMilestoneStatusesGrid.appendTitle(project_id);
		}
	}
});

/****************************************************************
 * Project Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval('project.is_template = 0');
}