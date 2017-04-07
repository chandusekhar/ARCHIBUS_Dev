var questionnaireWizardController = View.createController('questionnaireWizard', {
    
    format_type : 'Free',
    
    exPrgQuestionnaireWizard_questionEditForm_afterRefresh : function() {
    	formatTypeListener();
    },
    
    exPrgQuestionnaireWizard_questionEditForm_beforeSave : function() {
    	var form = this.exPrgQuestionnaireWizard_questionEditForm;
    	if (this.format_type == 'Enum')	
    	{
    		if (form.getFieldValue('questions.action_response') != "" && form.getFieldValue('questions.activity_type') == "")
    		{ 
    			// an action response is desired but action is not given an activity type
    			form.addInvalidField('questions.activity_type', getMessage('emptyActivityTypeFieldError'));
    			return false;
    		}
    	}
    },
    
    exPrgQuestionnaireWizard_questionsGrid_onViewSampleForm : function() {
    	var r = this.exPrgQuestionnaireWizard_questionsGrid.restriction;
    	var records = this.exPrgQuestionnaireWizard_questionsDs.getRecords(r);
    	if (records.length > 0) {
    	var table_name = records[0].getValue('questionnaire.table_name');
    	if (table_name == 'project') View.openDialog('ab-ex-prg-questionnaire-wizard-form-project.axvw',null,true);
    	else if (table_name == 'mo') View.openDialog('ab-ex-prg-questionnaire-wizard-form-mo.axvw',null,true);
    	else if (table_name == 'activity_log') View.openDialog('ab-ex-prg-questionnaire-wizard-form-action.axvw',null,true);
    	} else {
    		View.showMessage(getMessage('addQuestion'));
    		return;
    	}
    }
});    

// Hide fields depending upon whether the user has selected format type Free form, Enumerated, or Lookup
// Since certain fields are only relevant for a specific format type
function formatTypeListener()
{
	var ctrl = View.controllers.get('questionnaireWizard');
	var form = ctrl.exPrgQuestionnaireWizard_questionEditForm;
	ctrl.format_type = form.getFieldValue('questions.format_type');
	if (ctrl.format_type == 'Free') 
	{
		form.showField('questions.freeform_width', true);
		form.showField('questions.enum_list', false);
		form.showField('questions.action_response', false);
		form.showField('questions.activity_type', false);
		form.showField('questions.lookup_table', false);
		form.showField('questions.lookup_field', false);
		form.fields.get('questions.lookup_table').fieldDef.required = false;
		form.fields.get('questions.lookup_field').fieldDef.required = false;
	}
	else if (ctrl.format_type == 'Date') {
		form.showField('questions.freeform_width', false);
		form.showField('questions.enum_list', false);
		form.showField('questions.action_response', false);
		form.showField('questions.activity_type', false);
		form.showField('questions.lookup_table', false);
		form.showField('questions.lookup_field', false);
		form.fields.get('questions.lookup_table').fieldDef.required = false;
		form.fields.get('questions.lookup_field').fieldDef.required = false;
	}
	else if (ctrl.format_type == 'Enum')
	{
		form.showField('questions.freeform_width', false);
		form.showField('questions.enum_list', true);
		form.showField('questions.action_response', true);
		form.showField('questions.activity_type', true);
		form.showField('questions.lookup_table', false);
		form.showField('questions.lookup_field', false);
		form.fields.get('questions.lookup_table').fieldDef.required = false;
		form.fields.get('questions.lookup_field').fieldDef.required = false;
	}
	else if (ctrl.format_type == 'Look')
	{
		form.showField('questions.freeform_width', false);
		form.showField('questions.enum_list', false);
		form.showField('questions.action_response', false);
		form.showField('questions.activity_type', false);
		form.showField('questions.lookup_table', true);
		form.showField('questions.lookup_field', true);
		form.fields.get('questions.lookup_table').fieldDef.required = true;
		form.fields.get('questions.lookup_field').fieldDef.required = true;
	}
}
