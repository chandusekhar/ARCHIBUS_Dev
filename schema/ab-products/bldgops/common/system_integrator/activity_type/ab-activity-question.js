/**
 * @fileoverview Javascript function for <a href='../../../../viewdoc/overview-summary.html#ab-activity-question.axvw' target='main'>ab-activity-question.axvw</a>
 */
var typeEditController = View.createController("typeEditController", {

    /**
     * Called when loading the form<br />
     * Copy questionnaire id and request type from opening window
     */
    panelQuestion_afterRefresh: function(){
            this.panelQuestion.setFieldValue("questions.activity_type",this.panelQuestion.getFieldValue("questions.questionnaire_id")) ;
    }
});


/**
 * Saves a new question for a questionnaire, after checking the form:
 * <ul>
 * 	<li>With format type 'Free', a freeform width should be given</li>
 * 	<li>With format type 'Look' (lookup), a lookup table and field should be given</li>
 * 	<li>With format type 'Enum', an enumeration should be given</li>
 * </ul>
 * Calls WFR <a href='../../../../javadoc/com/archibus/eventhandler/helpdesk/QuestionnaireHandler.html#saveQuestion(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-saveQuestion</a>
 * @param {String} formName form submitted
 */
function onSave(){
    var panel = View.panels.get('panelQuestion');
    if (panel.getFieldValue("questions.format_type") == 'Free' &&
    panel.getFieldValue("questions.freeform_width") == '') {
        alert(getMessage('errFree'));
        return;
    }
    
    if (panel.getFieldValue("questions.format_type") == 'Look' &&
    (panel.getFieldValue("questions.lookup_table") == '' ||
    panel.getFieldValue("questions.lookup_field") == '')) {
        alert(getMessage('errLook'));
        return;
    }
    
    if (panel.getFieldValue("questions.format_type").value == 'Enum' &&
    panel.getFieldValue("questions.enum_list").value == '') {
        alert(getMessage('errEnum'));
        return;
    }
    
    var record = ABHDC_getDataRecord2(panel);
	
	try {
		var result = Workflow.callMethod('AbBldgOpsHelpDesk-QuestionnaireService-saveQuestion', record);
	}catch(e){
		Workflow.handleError(e);
	}
	if (result.code == 'executed') {
        var wrcode = panel.getFieldValue("questions.questionnaire_id");
        View.getOpenerView().controllers.get('typeQuestController').refreshQuestionGrid(wrcode);
    }
    else {
        Workflow.handleError(result);
    }
}

