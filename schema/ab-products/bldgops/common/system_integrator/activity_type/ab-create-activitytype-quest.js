/**
 * @fileoverview Javascript functions for <a href='../../../../viewdoc/overview-summary.html#ab-create-activitytype-quest.axvw' target='main'>ab-create-activitytype-quest.axvw</a>
 */
var typeQuestController = View.createController("typeQuestController", {

    /**
     * Called when loading the form<br />
     * Create restriction for panel with questions and refresh this panel
     */
    form_questionnaire_afterRefresh: function(){
        if (valueExists(this.form_questionnaire.restriction)) {
            var quest = this.form_questionnaire.getFieldValue("questionnaire.questionnaire_id");
            this.refreshQuestionGrid(quest);
        }
    },
	
    refreshQuestionGrid: function(quest){
        var rest = new Ab.view.Restriction();
        rest.addClause("questions.questionnaire_id", quest, '=');
        this.panel_questions.refresh(rest);
    }
});

/**
 * Saves questionnaire based on current form data<br />
 * Calls WFR <a href='../../../../javadoc/com/archibus/eventhandler/helpdesk/QuestionnaireHandler.html#saveQuestionnaire(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-saveQuestionnaire</a><br />
 * Creates restriction for next tab and selects next tab<br />
 * Called by 'Next' button
 * @param {String} form current form
 */
function onSave(){
    var form_questionnaire = View.panels.get("form_questionnaire");
    if (form_questionnaire.getFieldValue("questionnaire.title") == "") {
        alert(getMessage("noTitle"));
        return;
    }
    var record = ABHDC_getDataRecord2(form_questionnaire);
    
	try {
		var result = Workflow.callMethod('AbBldgOpsHelpDesk-QuestionnaireService-saveQuestionnaire', record);
	}catch(e){
		Workflow.handleError(e);
	}
    
    if (result.code == 'executed') {
        View.getControl('', 'typeTabs').selectTab('select');
    }
    else {
        Workflow.handleError(result);
    }
}

/**
 * Open dialog to create new question
 */
function addQuestion(){
    var quest = View.panels.get("form_questionnaire").getFieldValue("questionnaire.questionnaire_id");
    
    var rest = new Ab.view.Restriction();
    rest.addClause("questions.questionnaire_id", quest, "=");
    rest.addClause("questions.quest_name", '', "=");
    View.openDialog("ab-activity-question.axvw", rest, true, 10, 10, 620, 640);
}


/**
 * Deletes selected questions from a questionnaire after user confirmation<br />
 * Calls WFR <a href='../../../../javadoc/com/archibus/eventhandler/helpdesk/QuestionnaireHandler.html#deleteQuestions(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-deleteQuestions</a><br />
 * Called by 'Delete' button
 * @param {String} form current form
 */
function onDeleteQuestions(){
    if (confirm(getMessage("confirmDelete"))) {
        var grid = View.panels.get('panel_questions');
        var records = grid.getPrimaryKeysForSelectedRows();
		
		try {
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-QuestionnaireService-deleteQuestions', records);
		}catch(e){
			Workflow.handleError(e);
		}
        if (result.code == 'executed') {
            grid.refresh();
        }
        else {
            Workflow.handleError(result);
        }
    }
}
