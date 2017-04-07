

// On Issuing a Group Move

function onIssueGroupMove() {
	var form = View.panels.items[0];
	var project_id = form.getFieldValue('project.project_id');
	var requestor = form.getFieldValue('project.requestor');
	var dv_id = form.getFieldValue('project.dv_id');
	var dp_id = form.getFieldValue('project.dp_id');

	
	try {
		Workflow.callMethod('AbMoveManagement-MoveService-issueGroupMove',project_id, requestor);
		// hide the Issue button and change the project status to
		// Issued-In Process
		form.enableButton('issueButton', false);
		/*
		 * 04/15/2010 IOAN KB 3027046
		 */
		setStatusAddingOption(form, form.fields.get('project.status'), "Issued-In Process");
		
	} 
	catch (e) {
		Workflow.handleError(e);
	}
}

//remove rmpct record when it's status was cancel.

function onSynchronizeRmpctRecords() {
	//kb 3033875 add call 'updateAssociatedServiceRequestStatus' logic syc assignment.
	var form = View.panels.get("form_abMoGroupEditIssue_pr");
	var project_id = form.getFieldValue('project.project_id');
	var project_status = form.getFieldValue('project.status');
	if("Approved-Cancelled"==project_status){
		try {
//			Workflow.callMethod('AbMoveManagement-MoveService-updateAssociatedServiceRequestStatus', 'project', project_id);
			Workflow.callMethod('AbMoveManagement-MoveService-onProcessDeleteRmpctRecord', 'project', project_id);
		} catch (e) {
			Workflow.handleError(e);
			return false;
		}
	}
}
