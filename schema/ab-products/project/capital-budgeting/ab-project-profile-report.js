var projectProfileController = View.createController('projectProfile', {
    
    quest : null,
    
    projectProfileColumnReport_afterRefresh : function() {			
		var project_type = this.projectProfileColumnReport.getFieldValue('project.project_type');
		var q_id = 'Project - '.toUpperCase() + project_type;
		this.quest = new Ab.questionnaire.Quest(q_id, 'projectProfileColumnReport', true);
    }
});

/****************************************************************
 * Project Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval('project.is_template = 0');
}