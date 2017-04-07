var questionnaireFormController = View.createController('questionnaireForm', {
    
    quest : null,

    exPrgQuestionnaireForm_form_afterRefresh : function() {
		this.exPrgQuestionnaireForm_form.enableField('project.project_quest', false);
		var project_type = this.exPrgQuestionnaireForm_form.getFieldValue('project.project_type');
		var q_id = 'Project - ' + project_type;
		this.quest = new Ab.questionnaire.Quest(q_id, 'exPrgQuestionnaireForm_form');
    },
    
    exPrgQuestionnaireForm_form_beforeSave : function() {
    	// beforeSaveQuestionnaire() adds questionnaire answers to virtual XML field
    	return this.quest.beforeSaveQuestionnaire();
    }
});
		
		
		
		
		
		
		
		