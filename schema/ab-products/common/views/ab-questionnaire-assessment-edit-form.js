var questionnaireAssessmentEditFormController = View.createController('questionnaireAssessmentEditFormController', {
    
    quest : null,
    q_id : '',
    
    afterInitialDataFetch: function() {	
		var tabPanel = View.getOpenerView().panels.get('questionnaireAssessmentEdit_tabs');
	    var restriction = tabPanel.findTab('questionnaireAssessmentEdit_questionsPage').restriction;
		this.q_id = restriction['questionnaire.questionnaire_id'];
		
		this.quest = new Ab.questionnaire.Quest(this.q_id, 'questionnaireAssessmentEdit_sampleForm');
		
		this.questionnaireAssessmentEdit_sampleForm.appendTitle(this.q_id);
    }
});