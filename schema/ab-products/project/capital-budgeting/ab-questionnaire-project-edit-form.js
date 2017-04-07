var questionnaireProjectEditFormController = View.createController('questionnaireProjectEditForm', {
    
    quest : null,
    q_id : '',
    
    afterInitialDataFetch: function() {	
		var tabPanel = View.getOpenerView().panels.get('questionnaireProjectEdit_tabs');
	    var restriction = tabPanel.findTab('questionnaireProjectEdit_questionsPage').restriction;
		this.q_id = restriction['questionnaire.questionnaire_id'];
		
		this.quest = new Ab.questionnaire.Quest(this.q_id, 'questionnaireProjectEdit_sampleForm');
		
		this.questionnaireProjectEdit_sampleForm.appendTitle(this.q_id);
    }
});