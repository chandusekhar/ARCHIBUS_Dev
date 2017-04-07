var questionnaireActionResponsePopupController = View.createController('questionnaireActionResponsePopup', {

	quest : null,
	project_type : null,
	q_id : null,
	
	exPrgQuestionnaireActionResponsePopup_createForm_onNext : function() {
		if (this.exPrgQuestionnaireActionResponsePopup_createForm.save()) {
	    	this.project_type = this.exPrgQuestionnaireActionResponsePopup_createForm.getFieldValue('project.project_type');
			this.q_id = 'Project - ' + this.project_type;
			
			var restriction = new Ab.view.Restriction(this.exPrgQuestionnaireActionResponsePopup_createForm.getFieldValues());
			View.panels.get('exPrgQuestionnaireActionResponsePopup_tabs').selectTab('exPrgQuestionnaireActionResponsePopup_page2', restriction);
		}
	},
	    
    exPrgQuestionnaireActionResponsePopup_detailsForm_afterRefresh : function() {		
		this.quest = new Ab.questionnaire.Quest(this.q_id, 'exPrgQuestionnaireActionResponsePopup_detailsForm');
    },
    
    exPrgQuestionnaireActionResponsePopup_detailsForm_beforeSave : function() {
    	this.exPrgQuestionnaireActionResponsePopup_detailsForm.setFieldValue('project.status', 'Requested');
		return this.quest.beforeSaveQuestionnaire();
    }
});