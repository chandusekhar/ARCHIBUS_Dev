var projWorkPackagesStatusesGridController = View.createController('projWorkPackagesStatusesGrid', {
	projWorkPackagesStatusesGrid_afterRefresh: function() {
		if (this.projWorkPackagesStatusesGrid.restriction) {
			var project_id = this.projWorkPackagesStatusesGrid.restriction['project.project_id'];
			if (project_id) this.projWorkPackagesStatusesGrid.appendTitle(project_id);
		}
	}
});

/****************************************************************
 * Project Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval('project.is_template = 0');
}