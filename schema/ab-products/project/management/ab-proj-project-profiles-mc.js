var projProjectProfilesMcController = View.createController('projProjectProfilesMc', {
    
    quest : null,
    
    projProjectProfilesMcColumnReport_afterRefresh : function() {			
		var project_type = this.projProjectProfilesMcColumnReport.getFieldValue('project.project_type');
		var q_id = 'Project - ' + project_type;
		this.quest = new Ab.questionnaire.Quest(q_id, 'projProjectProfilesMcColumnReport', true);
    },
    
    projProjectProfilesMcForm_afterRefresh : function() {			
		var project_type = this.projProjectProfilesMcForm.getFieldValue('project.project_type');
		var q_id = 'Project - ' + project_type;
		this.quest = new Ab.questionnaire.Quest(q_id, 'projProjectProfilesMcForm');
		
		for (var i = 0; i < 6; i++) {
			this.projProjectProfilesMcForm.getFieldElement('project.status').options[i].setAttribute("disabled", "true");
		}
		var status = this.projProjectProfilesMcForm.getFieldValue('project.status');
		if (status == 'Approved' || status == 'Approved-In Design' || status == 'Approved-Cancelled' || status == 'Issued-In Process' || 
				status == 'Issued-On Hold' || status == 'Issued-Stopped' || status == 'Completed-Pending' || status == 'Completed-Not Ver' ||
				status == 'Completed-Verified' || status == 'Closed') {
			this.projProjectProfilesMcForm.enableField('project.status', true);
		}
		else this.projProjectProfilesMcForm.enableField('project.status', false);
    },
    
    projProjectProfilesMcForm_beforeSave : function() {
    	if (!this.quest.beforeSaveQuestionnaire()) return false; 
    	return this.validateDateFields();
    },
    
    projProjectProfilesMcForm_onSave : function() {
    	if (!this.projProjectProfilesMcForm.save()) return;
    	this.projProjectProfilesMcColumnReport.refresh();
    	var project_name = this.projProjectProfilesMcForm.getFieldValue('project.project_name');
    	View.getOpenerView().controllers.get('projManageConsole').project_name = project_name;
    	View.getOpenerView().controllers.get('projManageConsole').setViewTitle();
    	View.closeThisDialog();
    },
    
    validateDateFields : function() {
    	var date_start = getDateObject(this.projProjectProfilesMcForm.getFieldValue('project.date_start'));//note that getFieldValue returns date in ISO format
    	var date_end = getDateObject(this.projProjectProfilesMcForm.getFieldValue('project.date_end'));
    	if (date_end < date_start) {
    		this.projProjectProfilesMcForm.addInvalidField('project.date_end', getMessage('endBeforeStart'));
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