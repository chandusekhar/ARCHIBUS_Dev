var questionnaireProjectEditController = View.createController('questionnaireProjectEdit', {
	
	questionnaireProjectEdit_questionnaireEditForm_beforeSave : function() {
		var prefix = 'COMMISSIONING -';
		
		var questionaireId = this.questionnaireProjectEdit_questionnaireEditForm.getFieldValue('questionnaire.questionnaire_id');
		questionaireId = questionaireId.trim();
		if (questionaireId == prefix) {
			this.questionnaireProjectEdit_questionnaireEditForm.addInvalidField('questionnaire.questionnaire_id', getMessage('emptyQuestionnaireId'));
			return false;
		}
		if (questionaireId.indexOf(prefix) != 0) {
			this.questionnaireProjectEdit_questionnaireEditForm.setFieldValue('questionnaire.questionnaire_id', prefix + ' ' + questionaireId);
		}
	},
    
    questionnaireProjectEdit_questionEditForm_afterRefresh : function() {
    	formatTypeListener();
    },
    
    questionnaireProjectEdit_questionEditForm_beforeSave : function() {
    	var form = this.questionnaireProjectEdit_questionEditForm;
    	var format_type = form.getFieldValue('questions.format_type');
    	if (format_type == 'Enum')	
    	{
    		if (form.getFieldValue('questions.action_response') != "" && form.getFieldValue('questions.activity_type') == "")
    		{ 
    			// an action response is desired but action is not given an activity type
    			form.addInvalidField('questions.activity_type', getMessage('emptyActivityTypeFieldError'));
    			return false;
    		}
    	}
    },
    
    questionnaireProjectEdit_questionsGrid_onViewSampleForm : function() {
    	var r = this.questionnaireProjectEdit_questionsGrid.restriction;
    	var records = this.questionnaireProjectEdit_questionsDs.getRecords(r);
    	if (records.length > 0) {
    		View.openDialog('ab-questionnaire-project-edit-form.axvw', null, true);
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
	var form = View.panels.get('questionnaireProjectEdit_questionEditForm');
	var format_type = form.getFieldValue('questions.format_type');
	if (format_type == 'Free') 
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
	else if (format_type == 'Date') {
		form.showField('questions.freeform_width', false);
		form.showField('questions.enum_list', false);
		form.showField('questions.action_response', false);
		form.showField('questions.activity_type', false);
		form.showField('questions.lookup_table', false);
		form.showField('questions.lookup_field', false);
		form.fields.get('questions.lookup_table').fieldDef.required = false;
		form.fields.get('questions.lookup_field').fieldDef.required = false;
	}
	else if (format_type == 'Enum')
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
	else if (format_type == 'Look')
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
	else if (format_type == 'Num' || format_type == 'Int')
	{
		form.showField('questions.freeform_width', false);
		form.showField('questions.enum_list', false);
		form.showField('questions.action_response', false);
		form.showField('questions.activity_type', false);
		form.showField('questions.lookup_table', false);
		form.showField('questions.lookup_field', false);
		form.fields.get('questions.lookup_table').fieldDef.required = false;
		form.fields.get('questions.lookup_field').fieldDef.required = false;
	}
}