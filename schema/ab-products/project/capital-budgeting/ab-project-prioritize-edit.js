var projectPrioritizeEditController = View.createController('projectPrioritizeEdit', {
	quest : null,
    
    projectPrioritizeEditForm_afterRefresh: function() {	
		var q_id = 'Project - '.toUpperCase() + this.projectPrioritizeEditForm.getFieldValue('project.project_type');	
		this.quest = new Ab.questionnaire.Quest(q_id, 'projectPrioritizeEditForm', true);
    }
});

/****************************************************************
 * Project Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval("project.status LIKE 'Requested%'");
}