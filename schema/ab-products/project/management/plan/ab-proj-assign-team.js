var projAssignTeamController = View.createController('projAssignTeam', {
	project_id : '',
	
	selectProjectReport_onSelectProjectId : function(row) {
		this.project_id = row.record['project.project_id.key'];
		var restriction = new Ab.view.Restriction();
		restriction.addClause('project.project_id', this.project_id);
		this.projAssignTeamGrid.refresh(restriction);
		this.projAssignTeamGrid.show(true);
		this.projAssignTeamGrid.appendTitle(this.project_id);
	}
});

/****************************************************************
 * Project Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval("");
}