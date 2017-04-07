var questionnaireAssessmentEditController = View.createController('questionnaireAssessmentEditController', {
	duplicateQ:{},
	
	questionnaireAssessmentEdit_questionnaireEditForm_beforeSave : function() {
		var prefix = 'ASSESSMENT -';
		var questionaireId = this.questionnaireAssessmentEdit_questionnaireEditForm.getFieldValue('questionnaire.questionnaire_id');
		questionaireId = questionaireId.trim();
		if (questionaireId == prefix) {
			this.questionnaireAssessmentEdit_questionnaireEditForm.addInvalidField('questionnaire.questionnaire_id', getMessage('emptyQuestionnaireId'));
			return false;
		}
		if (questionaireId.indexOf(prefix) != 0) {
			this.questionnaireAssessmentEdit_questionnaireEditForm.setFieldValue('questionnaire.questionnaire_id', prefix + ' ' + questionaireId);
		}
	},
    
    questionnaireAssessmentEdit_questionEditForm_afterRefresh : function() {
    	formatTypeListener();
    },
    
    questionnaireAssessmentEdit_questionEditForm_beforeSave : function() {
    	var form = this.questionnaireAssessmentEdit_questionEditForm;
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
    
    questionnaireAssessmentEdit_questionsGrid_onViewSampleForm : function() {
    	var r = this.questionnaireAssessmentEdit_questionsGrid.restriction;
    	var records = this.questionnaireAssessmentEdit_questionsDs.getRecords(r);
    	if (records.length > 0) {
    		View.openDialog('ab-questionnaire-assessment-edit-form.axvw', null, true);
    	} else {
    		View.showMessage(getMessage('addQuestion'));
    		return;
    	}
    },

    duplicateForm_afterRefresh:function(){
    	this.duplicateQ.oldQ = this.duplicateForm.getFieldValue("questionnaire.questionnaire_id");
    },

    duplicateForm_onSave:function(){
    	var newQ = this.duplicateForm.getFieldValue("questionnaire.questionnaire_id");
    	if (newQ===this.duplicateQ.oldQ){
    		View.showMessage(getMessage("duplicateQRec"));
    		return;
    	}
    	var rec = this.duplicateForm.getRecord();
    	rec.isNew = true;
    	rec = this.questionnaireAssessmentEdit_questionnaireDs.processOutboundRecord(rec);			
    	try {
	        var result = Workflow.callMethod('AbCapitalPlanningCA-BRGCapitalPM-addDuplicateQuestions',rec, this.duplicateQ.oldQ);
	        if (result.code == 'executed') {
	        	this.questionnaireAssessmentEdit_questionnairesGrid.refresh();
	        	View.closeThisDialog();
	        }
		} catch (e){
		Workflow.handleError(e);
		}
    }
});    

// Hide fields depending upon whether the user has selected format type Free form, Enumerated, or Lookup
// Since certain fields are only relevant for a specific format type
function formatTypeListener()
{
	var form = View.panels.get('questionnaireAssessmentEdit_questionEditForm');
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

function selectAssessmentTypeValue() {
	var title = getMessage('qIdSelValTitle');
	var restriction = "project_type NOT IN ('+arrProjectTypes+') AND \'Project - \'#Concat%%project_type NOT IN (SELECT questionnaire_id FROM questionnaire)";
	View.selectValue('questionnaireAssessmentEdit_questionnaireEditForm', title, 'questionnaire.questionnaire_id', 'projecttype', ['projecttype.project_type'], ['projecttype.project_type', 'projecttype.description'], restriction, afterSelectAssessmentTypeValue);
}

function afterSelectAssessmentTypeValue(fieldName, selectedValue, previousValue) {
	var form = View.panels.get('questionnaireAssessmentEdit_questionnaireEditForm');
	form.setFieldValue('questionnaire.questionnaire_id', 'ASSESSMENT - ' + selectedValue);
	View.closeThisDialog();
}

function openForDuplicate(){
	var restriction = new Ab.view.Restriction();
	restriction.addClause("questionnaire.questionnaire_id",arguments[0].restriction["questionnaire.questionnaire_id"], "=");
	View.openDialog('brg-questionnaire-assessment-duplicate.axvw', restriction, false, {
	    width: 700,
	    height: 300,
	    closeButton: false,
	    maximize: false,
	    afterViewLoad: function(dialogView) {
	        
	    },
	    callback: function(res) {
	        
	    }
	});
}

function duplicateRecords(){
	var ctrl = questionnaireAssessmentEditController;
	var form = View.panels.get("duplicateForm");
	var newQ = form.getFieldValue("questionnaire.questionnaire_id");
	if (newQ===ctrl.duplicateQ.oldQ){
		View.showMessage(getMessage("duplicateQRec"));
		return;
	}
	var rec = form.getRecord();
	rec.isNew = true;
	rec = View.dataSources.get("duplicateFormDS").processOutboundRecord(rec);			
	try {
        var result = Workflow.callMethod('AbCapitalPlanningCA-BRGCapitalPM-addDuplicateQuestions',rec, ctrl.duplicateQ.oldQ);
        if (result.code == 'executed') {
        	View.getOpenerView().panels.get("questionnaireAssessmentEdit_questionnairesGrid").refresh();
        	View.closeThisDialog();
        }
	} catch (e){
		Workflow.handleError(e);
	}
}