var projectPrioritizeEditController = View.createController('projectPrioritizeEdit', {
	quest : null,

    projectPrioritizeEditForm_afterRefresh: function() {
		var q_id = 'Project - ' + this.projectPrioritizeEditForm.getFieldValue('project.project_type');
		this.quest = new Ab.questionnaire.Quest(q_id, 'projectPrioritizeEditForm', true);
    }
});

/****************************************************************
 * Project Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval("project.status LIKE 'Requested%'");
}

function onSelectProject(row) {
    var panel = View.panels.get("projectPrioritizeEditForm");
    var restriction = "project_id = '" + row["project.project_id"].replace(/'/g, "''") + "'";
    panel.refresh(restriction);
}