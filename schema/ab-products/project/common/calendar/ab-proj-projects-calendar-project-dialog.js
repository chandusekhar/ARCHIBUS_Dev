var projProjectsCalendarProjectDialogController = View.createController('projProjectsCalendarProjectDialog', {
    
    quest : null,
    
    afterInitialDataFetch : function() {
		var q_id = 'Project - ' + this.projProjectsCalendarProjectDialogColumnReport.getFieldValue('project.project_type');
		this.quest = new Ab.questionnaire.Quest(q_id, 'projProjectsCalendarProjectDialogColumnReport', true);
    }
});