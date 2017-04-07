var questionnaireReportController = View.createController('questionnaireReport', {
    
    quest : null,
    
    exPrgQuestionnaireReport_report_afterRefresh : function() {	
		var project_type = this.exPrgQuestionnaireReport_report.getFieldValue('project.project_type');
		var q_id = 'Project - ' + project_type;
		
		/* new Ab.questionnaire.Quest(qId, panelId, readOnly, table_name, showInactive) */
		this.quest = new Ab.questionnaire.Quest(q_id, 'exPrgQuestionnaireReport_report');
    }
});