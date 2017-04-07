var quest = null;
var currentUser = null;

function user_form_onload()
{
	var detailsPanel = AFM.view.View.getControl("", "detailsPanel");
	var objConsoleFrame = getFrameObject(window, "consoleFrameMC");
	if (objConsoleFrame != null) {
		var view_project_id = objConsoleFrame.mc_project_id;
		if (view_project_id != null) {
			var restriction = new AFM.view.Restriction();
        	restriction.addClause('project.project_id', view_project_id, '=');

			if(detailsPanel)
			{
				detailsPanel.refresh(restriction);
				detailsPanel.show(true);
				showQuestionFields();
			}
		}
	}

	currentUser = getUserInfo();
	var status;

	if (detailsPanel) {
		status = detailsPanel.getFieldValue("project.status");
	}

	var form = AFM.view.View.getControl('','detailsPanel');
	if (!(isMemberOfGroup(currentUser, 'PROJCOMP') || isMemberOfGroup(currentUser, 'PROJCOMP-ADMIN'))) {
		form.buttons[0].style.display = 'none';
		form.buttons[0].previousSibling.style.display = 'none';
	}
	else {
		if (status == 'Completed-Not Ver' && isMemberOfGroup(currentUser, 'PROJCOMP-ADMIN')) {
			form.buttons[0].value = 'Verify Complete';
		}
		else if ((status != "Issued-In Process" && status != "Approved") && !isMemberOfGroup(currentUser, 'PROJCOMP-ADMIN')) {
			form.buttons[0].style.display = 'none';
			form.buttons[0].previousSibling.style.display = 'none';
		}
	}

}

function showQuestionFields()
{
	var detailsPanel = AFM.view.View.getControl('viewFrame','detailsPanel');
	if (detailsPanel) {
		var project_type = detailsPanel.getFieldValue('project.project_type');
		var project_id = detailsPanel.getFieldValue('project.project_id');
		if (project_type && project_id)
		{
			// set the questionnaire_id
			var questionnaire_id = "Project - "+project_type;

			// set readOnly to true for reports
			var readOnly = false;

			quest = new AFM.questionnaire.Quest(questionnaire_id, readOnly, [['activity_log.project_id', project_id]]);
			quest.showQuestions();
//			detailsPanel.beforeSaveListener = 'savePanelQuestions';
		}
	}
}

function beforeSaveForm()
{
	var result = validateDateFields();
	if (result && quest != null) quest.saveQuestions();
	return result;
}

function validateDateFields() {

	var form = AFM.view.View.getControl('','detailsPanel');
	var date_start = getDateObject(form.getFieldValue('project.date_start'));//note that getFieldValue returns date in ISO format
	var date_end = getDateObject(form.getFieldValue('project.date_end'));
	if (date_end < date_start) {
		form.addInvalidField('project.date_end', getMessage('endBeforeStart'));
		return false;
	}
	return true;
}

function getDateObject(ISODate)
{
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0],tempArray[1]-1,tempArray[2]);
}

/*******
 * BRG: added verification for Complete.
 */
function onBtnCompleteProj()
{
	var form = AFM.view.View.getControl('','detailsPanel');
	var projectId = form.getFieldValue('project.project_id');
	var currentStatus = form.getFieldValue('project.status');

	if (currentStatus != "Completed-Not Ver")
	{
		if (verifyComplete(projectId)) {
			// Set to Completed-Not Ver
			form.setFieldValue("project.status", "Completed-Not Ver", "Completed-Not Ver");
			if (form.save()) {
				if (status != 'Completed-Not Ver' && isMemberOfGroup(currentUser, 'PROJCOMP-ADMIN')) {
					form.buttons[0].value = 'Verify Complete';
				}
				else {
					form.buttons[0].style.display = 'none';
					form.buttons[0].previousSibling.style.display = 'none';
				}
			}
		}
		else {
			alert("Please complete all Work Packages and/or review all Invoice Payments before completing the project.");
		}
	}
	else
	{
		// Verify Packages and invoice payments
		if (this.verifyComplete(projectId)) {

			// Set to Completed Verified.
			form.setFieldValue("project.status", "Completed-Verified", "Completed-Verified");
			if (form.save()) {
				form.buttons[0].style.display = 'none';
				form.buttons[1].style.display = 'none';
			}
		}
		else {
			alert("Please complete all Work Packages and/or review all Invoice Payments before completing the project.");
		}
	}
}

function verifyComplete(projectId) {
	var complete = false;

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


function getUserInfo() {
	var user = null;
    var result = AFM.workflow.Workflow.runRuleAndReturnResult('AbCommonResources-getUser', {});
    if (result.code == 'executed') {
        user = result.data;
    } else {
        handleError('Could not obtain UserInfo', result);
    }

	return user;
}

function isMemberOfGroup(user, group)
{
	var numOfGroups = user.groups.length;

	var isMember = false;
	for (var i=0; i < numOfGroups; i++) {
		var groupName = user.groups[i];

		if (groupName == '%') {
			isMember = true;
			break;
		} else if (groupName == group) {
			isMember = true;
			break;
		} else if (groupName.substring(groupName.length-1) == '%' && groupName.substring(0, groupName.length-2) == group.substring(0, groupName.length-2)) {
			isMember = true;
			break;
		}
	}

	return isMember;
}

function openPrintWindow()
{
	var form = AFM.view.View.getControl("", "detailsPanel");
	var project_id = form.getFieldValue('project.project_id');
    project_id = project_id.replace(/&/g,"%26");
    project_id = project_id.replace(/'/g,"%27");
	window.open('brg-proj-project-details-print.axvw?handler=com.archibus.config.ActionHandlerDrawing&project.project_id='+project_id, 'newWindow', 'width=800, height=600, resizable=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, copyhistory=no');
}

function openAcDialog()
{
	AFM.view.View.openDialog('brg-ac-input.axvw', null);
}