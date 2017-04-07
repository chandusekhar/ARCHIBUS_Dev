var projProjectStatusUpdateController = View.createController('projProjectStatusUpdate', {
    
    quest : null,
    
    projProjectStatusUpdateForm_afterRefresh : function() {			
		var project_type = this.projProjectStatusUpdateForm.getFieldValue('project.project_type');
		var q_id = 'Project - ' + project_type;
		this.quest = new Ab.questionnaire.Quest(q_id, 'projProjectStatusUpdateForm');
		
		for (var i = 0; i < 6; i++) {
			this.projProjectStatusUpdateForm.getFieldElement('project.status').options[i].setAttribute("disabled", "true");
		}
		var status = this.projProjectStatusUpdateForm.getFieldValue('project.status');
		if (status == 'Approved' || status == 'Approved-In Design' || status == 'Approved-Cancelled' || status == 'Issued-In Process' || 
				status == 'Issued-On Hold' || status == 'Issued-Stopped' || status == 'Completed-Pending' || status == 'Completed-Not Ver' ||
				status == 'Completed-Verified' || status == 'Closed') {
			this.projProjectStatusUpdateForm.enableField('project.status', true);
		}
		else this.projProjectStatusUpdateForm.enableField('project.status', false);
    },
    
    projProjectStatusUpdateForm_beforeSave : function() {
    	if (!this.quest.beforeSaveQuestionnaire()) return false; 
    	return this.validateDateFields();
    },
    
    projProjectStatusUpdateForm_onCloseProject : function() {
    	var date = new Date();
    	var currentDate = FormattingDate(date.getDate(), date.getMonth() + 1, date.getFullYear(), 'YYYY-MM-DD');
    	this.projProjectStatusUpdateForm.setFieldValue('project.status', 'Closed');
    	this.projProjectStatusUpdateForm.setFieldValue('project.date_closed', currentDate);
    	this.projProjectStatusUpdateForm.save();
    	this.selectProjectReport.refresh();
    	this.projProjectStatusUpdateForm.refresh();
    },
    
    validateDateFields : function() {
    	var date_start = getDateObject(this.projProjectStatusUpdateForm.getFieldValue('project.date_start'));//note that getFieldValue returns date in ISO format
    	var date_end = getDateObject(this.projProjectStatusUpdateForm.getFieldValue('project.date_end'));
    	if (date_end < date_start) {
    		this.projProjectStatusUpdateForm.addInvalidField('project.date_end', getMessage('endBeforeStart'));
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
	projectIdSelval('');
}