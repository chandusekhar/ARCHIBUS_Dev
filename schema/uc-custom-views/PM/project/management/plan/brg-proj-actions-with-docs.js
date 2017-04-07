var projActionsWithDocsController = View.createController('projActionsWithDocs', {
	project_id : '',
	
	selectProjectReport_onSelectProjectId : function(row) {
		this.project_id = row.record['project.project_id.key'];
		var restriction = new Ab.view.Restriction();
		restriction.addClause('project.project_id', this.project_id);
		this.projActionsWithDocsGrid.refresh(restriction);
		this.projActionsWithDocsGrid.show(true);
		this.projActionsWithDocsGrid.appendTitle(this.project_id);
	}
});

/****************************************************************
 * Project Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval("");
}				