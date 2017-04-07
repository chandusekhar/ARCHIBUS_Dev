var projProjectProfilesController = View.createController('projProjectProfiles', {
    
    quest : null,
    
    projProjectProfilesForm_afterRefresh : function() {			
		var project_type = this.projProjectProfilesForm.getFieldValue('project.project_type');
		var q_id = 'Project - ' + project_type;
		this.quest = new Ab.questionnaire.Quest(q_id, 'projProjectProfilesForm');
		
		for (var i = 0; i < 6; i++) {
			this.projProjectProfilesForm.getFieldElement('project.status').options[i].setAttribute("disabled", "true");
		}
		var status = this.projProjectProfilesForm.getFieldValue('project.status');
		if (status == 'Approved' || status == 'Approved-In Design' || status == 'Approved-Cancelled' || status == 'Issued-In Process' || 
				status == 'Issued-On Hold' || status == 'Issued-Stopped' || status == 'Completed-Pending' || status == 'Completed-Not Ver' ||
				status == 'Completed-Verified' || status == 'Closed') {
			this.projProjectProfilesForm.enableField('project.status', true);
		}
		else this.projProjectProfilesForm.enableField('project.status', false);
    },
    
    projProjectProfilesForm_beforeSave : function() {
    	if (!this.quest.beforeSaveQuestionnaire()) return false; 
    	return this.validateDateFields();
    },
    
    validateDateFields : function() {
    	var date_start = getDateObject(this.projProjectProfilesForm.getFieldValue('project.date_start'));//note that getFieldValue returns date in ISO format
    	var date_end = getDateObject(this.projProjectProfilesForm.getFieldValue('project.date_end'));
    	if (date_end < date_start) {
    		this.projProjectProfilesForm.addInvalidField('project.date_end', getMessage('endBeforeStart'));
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

/****************************************************************
 * Project Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval('project.is_template = 0');
}