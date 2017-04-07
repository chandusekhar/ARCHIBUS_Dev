var projectRouteForApprovalController = View.createController('projectRouteForApproval', {
    
    quest : null,
    em_id : null,
    
    afterInitialDataFetch : function() {
		this.em_id = View.user.employee.id;
	},
    
    projectApproveProjectReport_afterRefresh : function() {			
		var project_type = this.projectApproveProjectReport.getFieldValue('project.project_type');
		var q_id = 'Project - ' + project_type;
		this.quest = new Ab.questionnaire.Quest(q_id, 'projectApproveProjectReport');
    },

    projectApproveMgrsForm_afterRefresh : function() {
    	var isApprMgr = false;    	

    	if (this.em_id == "")
    	{
    	    // display error message
            View.showMessage('error', getMessage('noMatchingEmail'));
    	}   
    	else {
    		if (this.em_id == this.projectApproveMgrsForm.getFieldValue('project.apprv_mgr1') && this.projectApproveMgrsForm.getFieldValue('project.apprv_mgr1_status') == 'NR')
    			isApprMgr = true; 
    		else if (this.em_id == this.projectApproveMgrsForm.getFieldValue('project.apprv_mgr2') && this.projectApproveMgrsForm.getFieldValue('project.apprv_mgr2_status') == 'NR') 
    			isApprMgr = true; 
    		else if (this.em_id == this.projectApproveMgrsForm.getFieldValue('project.apprv_mgr3') && this.projectApproveMgrsForm.getFieldValue('project.apprv_mgr3_status') == 'NR')
    			isApprMgr = true; 
    	}
    	if (!isApprMgr)
    	{
    		// hide Approve/Reject buttons
    		this.projectApproveMgrsForm.actions.get('approve').enable(false);
    		this.projectApproveMgrsForm.actions.get('reject').enable(false);
    	}	
    	else
    	{
    		// show Approve/Reject buttons
    		this.projectApproveMgrsForm.actions.get('approve').enable(true);
    		this.projectApproveMgrsForm.actions.get('reject').enable(true);		
    	}
    },
    
    projectApproveMgrsForm_onApprove : function() {
    	if (!confirm(getMessage('approveConfirm'))) return false;
    	if (this.projectApproveMgrsForm.save()) {
		}
		else {
			return false;
		}
    	var project_id = this.projectApproveMgrsForm.getFieldValue('project.project_id');
    	var apprv_mgr1 = this.projectApproveMgrsForm.getFieldValue('project.apprv_mgr1');
    	var apprv_mgr2 = this.projectApproveMgrsForm.getFieldValue('project.apprv_mgr2');
    	var apprv_mgr3 = this.projectApproveMgrsForm.getFieldValue('project.apprv_mgr3');
    	var parameters = {'project_id':project_id,'em_em_id':this.em_id,'apprv_mgr1':apprv_mgr1,'apprv_mgr2':apprv_mgr2,'apprv_mgr3':apprv_mgr3};
    	var result = Workflow.runRuleAndReturnResult('AbCapitalBudgeting-approveProject',parameters);
    	if (result.code == 'executed') {
			// send email to the the project manager.
			var sendTo = this.getEmailForEm(this.projectApproveMgrsForm.getFieldValue('project.proj_mgr'));
			
			if (sendTo != null) {
				var subject = getMessage('emailProjMgrSubject').replace("{0}",this.projectApproveMgrsForm.getFieldValue('project.int_num'));
				var emailBody = getMessage('emailProjMgrBody');
				emailBody = emailBody.replace("{0}",this.projectApproveMgrsForm.getFieldValue('project.int_num') + ' ('+project_id+')');
				uc_email(sendTo, 'afm@ucalgary.ca', subject, emailBody, 'standard.template');
			}

    		this.selectProjectReport.refresh(null);
    		this.projectApproveMgrsForm.refresh();
    		this.projectApproveProjectReport.refresh();
    		this.projectApproveMgrsForm.actions.get('approve').enable(false);
    		this.projectApproveMgrsForm.actions.get('reject').enable(false);
			
			/*
			// update status of project to issued
			var projRecord = new Ab.data.Record();
			projRecord.isNew = false;
			projRecord.values["project.project_id"] = project_id;
			projRecord.values["project.status"] = "Issued-In Process";
			// set the primary key
			projRecord.oldValues = new Object();
			projRecord.oldValues["project.project_id"] = project_id;
			// Save
			this.projectApproveDs0.saveRecord(projRecord);
			*/
			
			// Complete the associated WR
			this.completeWR();
			
			// Add Project Manager as Team Member
			this.addProjMgrToTeam();
      	} 
      	else 
      	{
        	View.showMessage('error', result.code + " :: " + result.message);
      	}
    },
    
    projectApproveMgrsForm_onReject : function() {
    	if (!confirm(getMessage('rejectConfirm'))) return false;
    	this.projectApproveMgrsForm.save();
    	var project_id = this.projectApproveMgrsForm.getFieldValue('project.project_id');
    	var apprv_mgr1 = this.projectApproveMgrsForm.getFieldValue('project.apprv_mgr1');
    	var apprv_mgr2 = this.projectApproveMgrsForm.getFieldValue('project.apprv_mgr2');
    	var apprv_mgr3 = this.projectApproveMgrsForm.getFieldValue('project.apprv_mgr3');
    	var parameters = {'project_id':project_id,'em_em_id':this.em_id,'apprv_mgr1':apprv_mgr1,'apprv_mgr2':apprv_mgr2,'apprv_mgr3':apprv_mgr3};
    	var result = Workflow.runRuleAndReturnResult('AbCapitalBudgeting-rejectProject',parameters);
    	if (result.code == 'executed') {
    		this.selectProjectReport.refresh(null);
    		this.projectApproveMgrsForm.refresh();
    		this.projectApproveProjectReport.refresh();
    		this.projectApproveMgrsForm.actions.get('approve').enable(false);
    		this.projectApproveMgrsForm.actions.get('reject').enable(false);
      	} 
      	else 
      	{
      		View.showMessage('error', result.code + " :: " + result.message);
      	}
    },
	
	addProjMgrToTeam: function()
	{
		// Add the Project Manager as a team member
		var projMgr = this.projectApproveMgrsForm.getFieldValue('project.proj_mgr');
		
		if (projMgr != "") {
			var projectTeamRecord = new Ab.data.Record();
			projectTeamRecord.isNew = true;
			projectTeamRecord.values["projteam.project_id"] = this.projectApproveMgrsForm.getFieldValue('project.project_id');
			projectTeamRecord.values["projteam.member_id"] = projMgr;
			projectTeamRecord.values["projteam.member_type"] = "Project Manager";
			//projectTeamRecord.oldValues = new Object();
			//projectTeamRecord.oldValues["project.project_id"] = projectId;
			this.projectTeamSaveDS.saveRecord(projectTeamRecord);
		}
	},
	
	completeWR: function()
	{
	
		// get the associated wr_id and cf_notes
		var projectId = this.projectApproveMgrsForm.getFieldValue('project.project_id');
		
		var wrDataValues = BRG.Common.getDataValues('wr', ['wr_id', 'cf_notes'], "project_id = "+BRG.Common.literalOrNull(projectId, true));
		
		if (wrDataValues == undefined) {
			//alert("no wr");
			return;
		}
		
		var wr_id = wrDataValues["wr.wr_id"];
		
		var old_cf_notes = wrDataValues["wr.cf_notes"];
		
		var new_cf_notes = this.appendComments(old_cf_notes, "Project ("+projectId+") has been issued.");
		

		try {
			var parameters = {
				'wr.wr_id':wr_id
			};

			// Run the issue WR workflow
			Workflow.call('AbBldgOpsOnDemandWork-issueWorkRequest', parameters);
			
			parameters = {
				tableName:'wr', 
				fieldName:'wr_id',
				'wr.wr_id':wr_id,
				fields: toJSON({"wr.wr_id":wr_id,"wr.cf_notes":new_cf_notes}),
				status: 'Com'
			};
			
			// Run the complete WR workflow
			Workflow.call('AbBldgOpsOnDemandWork-updateWorkRequestStatus', parameters);
		}
		catch (e) {
			Workflow.handleError(e);
		}
	},
	
	
	/**
	 * Helper function to append new Comments to old Comments.
	 */
	appendComments: function(oldComments, newComments)
	{
		var user_name = View.user.employee.id;
		var date = new Date();

		var commentsText = "UserName: {0}, Date: {1}, Comments: {2}.";
		commentsText = commentsText.replace('{0}', user_name);
		commentsText = commentsText.replace('{1}', date.toDateString().substring(4));
		commentsText = commentsText.replace('{2}', newComments);

		var oldCommentsText = oldComments;

		if (oldCommentsText != "")
		{
		oldCommentsText += "\n\n";
		}
		
		var retVal = oldCommentsText + commentsText;
		return retVal;
	},
	
	// ************************************************************************
	// Retrieves the email address of emId from the database.
	// ************************************************************************
	getEmailForEm: function(emId) {
		var email = null;
		var rest = "em_id = '"+emId.replace(/\'/g, "''")+"'";
		var record = BRG.Common.getDataValues("em", ["em_id", "email"], rest);
		if (record != null) {
			email = record["em.email"];
		}
		
		return email;
	}
});

/****************************************************************
 * Project Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval("project.status LIKE '%Routed%'");
}