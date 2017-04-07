var projFcpmCpsRptDtlController = View.createController('projFcpmCpsRptDtl', {
    
    quest : null,
    
    projFcpmCpsRptDtl_form_afterRefresh : function() {			
		var project_type = this.projFcpmCpsRptDtl_form.getFieldValue('project.project_type');
		var q_id = 'Project - ' + project_type;
		this.quest = new Ab.questionnaire.Quest(q_id, 'projFcpmCpsRptDtl_form', true);
    },
    
    projFcpmCpsRptDtl_form_beforeSave : function() {
    	if (!this.quest.beforeSaveQuestionnaire()) return false; 
    	this.projFcpmCpsRptDtl_form.clearValidationResult();
    	return this.validateDateFields();
    },
    
    validateDateFields : function() {
    	var date_start = getDateObject(this.projFcpmCpsRptDtl_form.getFieldValue('project.date_start'));//note that getFieldValue returns date in ISO format
    	var date_end = getDateObject(this.projFcpmCpsRptDtl_form.getFieldValue('project.date_end'));
    	if (date_end < date_start) {
    		this.projFcpmCpsRptDtl_form.addInvalidField('project.date_end', getMessage('endBeforeStart'));
    		this.projFcpmCpsRptDtl_form.displayValidationResult('');
    		return false;
    	}
    	var date_commence_work = getDateObject(this.projFcpmCpsRptDtl_form.getFieldValue('project.date_commence_work'));//note that getFieldValue returns date in ISO format
    	var date_target_end = getDateObject(this.projFcpmCpsRptDtl_form.getFieldValue('project.date_target_end'));
    	if (date_target_end < date_commence_work) {
    		this.projFcpmCpsRptDtl_form.addInvalidField('project.date_target_end', getMessage('endBeforeStart'));
    		this.projFcpmCpsRptDtl_form.displayValidationResult('');
    		return false;
    	}
    	return true;    	
    }
});

function getDateObject(ISODate)
{
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0],tempArray[1]-1,tempArray[2]);
}
