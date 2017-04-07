var projectViewController = View.createController('projectView', {

    quest : null,

    projectViewReport_afterRefresh : function() {
		var q_id = 'Project - ' + this.projectViewReport.getFieldValue('project.project_type');
		this.quest = new Ab.questionnaire.Quest(q_id, 'projectViewReport',true);
    }
});