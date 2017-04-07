var questionnaireSampleFormController = View.createController('questionnaireSampleForm', {
    
    quest : null,
    q_id : '',
    
    afterInitialDataFetch: function() {
		this.exPrgQuestionnaireWizard_sampleForm.enableField(getMessage('questField'), false);
		
		// obtain questionnaire id from opener view
		var tabPanel = View.getOpenerView().panels.get('exPrgQuestionnaireWizard_tabs');
	    var restriction = tabPanel.findTab('exPrgQuestionnaireWizard_questionsPage').restriction;
		this.q_id = restriction['questionnaire.questionnaire_id'];
		
		this.quest = new Ab.questionnaire.Quest(this.q_id, 'exPrgQuestionnaireWizard_sampleForm');
    },
    
    exPrgQuestionnaireWizard_sampleForm_beforeSave : function() {
    	// beforeSaveQuestionnaire() places questionnaire answers in virtual XML field
    	this.quest.beforeSaveQuestionnaire();
    	
    	// example -- do not save
    	return false;
    }
});