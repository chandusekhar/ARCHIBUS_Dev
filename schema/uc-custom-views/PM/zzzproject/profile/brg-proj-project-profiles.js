var projProjectProfilesController = View.createController('projProjectProfiles', {
    
    quest : null,
		
    projProjectProfilesForm_afterRefresh : function() {			
			var project_type = this.projProjectProfilesForm.getFieldValue('project.project_type');
			var q_id = 'Project - ' + project_type;
			this.quest = new Ab.questionnaire.Quest(q_id, 'projProjectProfilesForm');
			
			// show the "Complete" button if status = "Issued-In Process" and only for specific roles.
			var status = this.projProjectProfilesForm.getFieldValue('project.status');
			var projCompGroup = View.user.isMemberOfGroup('PROJCOMP');
			var projCompAdminGroup = View.user.isMemberOfGroup('PROJCOMP-ADMIN');
			var role = View.user.role;
			
			if ((projCompGroup || projCompAdminGroup) && status == "Issued-In Process") {
				this.projProjectProfilesForm.actions.get('btnCompleteProj').button.setText(getMessage("btnCompNVText"));
				this.projProjectProfilesForm.actions.get('btnCompleteProj').show(true);
			}
			else if (projCompAdminGroup && status == "Completed-Not Ver") {
				this.projProjectProfilesForm.actions.get('btnCompleteProj').button.setText(getMessage("btnCompVerText"));
				this.projProjectProfilesForm.actions.get('btnCompleteProj').show(true);		
			}
			else {
				this.projProjectProfilesForm.actions.get('btnCompleteProj').button.setText("-");
				this.projProjectProfilesForm.actions.get('btnCompleteProj').show(false);
			}
    },
    
    projProjectProfilesForm_beforeSave : function() {
    	this.quest.beforeSaveQuestionnaire(); 
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
    },
	
	projProjectProfilesForm_onBtnCompleteProj: function() {
		var btnText = this.projProjectProfilesForm.actions.get('btnCompleteProj').button.text;
		if (btnText == getMessage("btnCompNVText"))
		{
			if (this.verifyComplete()) {
				// Set to Completed-Not Ver
				this.projProjectProfilesForm.setFieldValue("project.status", "Completed-Not Ver");
				if (this.projProjectProfilesForm.save()) {
					if (View.user.isMemberOfGroup('PROJCOMP-ADMIN')) {
						this.projProjectProfilesForm.actions.get('btnCompleteProj').button.setText(getMessage("btnCompVerText"));
					}
					else {
						this.projProjectProfilesForm.actions.get('btnCompleteProj').show(false);
					}
				}
			}
			else {
				View.showMessage("Please complete all Work Packages and/or review all Invoice Payments before completing the project.");
			}
		}
		else if (btnText == getMessage("btnCompVerText"))
		{
			// Verify Packages and invoice payments
			if (this.verifyComplete()) {
				
				// Set to Completed Verified.
				this.projProjectProfilesForm.setFieldValue("project.status", "Completed-Verified");
				if (this.projProjectProfilesForm.save()) {
					this.projProjectProfilesForm.show(false);
				}
			}
			else {
				View.showMessage("Please complete all Work Packages and/or review all Invoice Payments before completing the project.");
			}
		}
	},
	
	verifyComplete: function() {
		var complete = false;
		
		var projectId = this.projProjectProfilesForm.getFieldValue("project.project_id");
		
		var completeStatuses = "'Created-Withdrawn','Requested-Rejected','Approved-Cancelled','Issued-Stopped','Issued-Stopped','Completed-Not Ver','Completed-Verified','Closed'";
		
		
		var restriction = "project_id ="+BRG.Common.literalOrNull(projectId);
		restriction += " AND (EXISTS (SELECT TOP 1 1 FROM work_pkgs w WHERE w.project_id=project.project_id AND w.status NOT IN ({statuses}))";
		restriction += " OR EXISTS (SELECT TOP 1 1 FROM invoice_payment i WHERE i.project_id=project.project_id AND i.reviewed = 0))";
		
		restriction = restriction.replace("{statuses}", completeStatuses);
		
		// Verify Project Complete
		var record = BRG.Common.getDataRecords("project", ["project_id"], restriction)
		
		if (record.length == 0) {
			// everything is complete and/or reviewed.
			complete = true;
		}

		return complete;
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

/****************************************************************
 * On project select handler (the command showPanel doesn't pass in the
 * restriction.  This is the workaround).
 */
function onProjectSelect(row) {
	View.panels.get('projProjectProfilesForm').refresh("project_id='"+row['project.project_id'].replace(/'/g, "''")+"'");
}