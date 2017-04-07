/**
 * Get and show the values showing in the select options the parameters is used in like as following: 'SELECT valueField as value, textField as text From tableName Where where'
 * 
 * @param {string}
 *            tableName
 * @param {string}
 *            valueField
 * @param {string}
 *            textField
 * @param {string}
 *            selectElement
 * @param {string}
 *            where
 */
function SLA_populateSelectList(tableName, valueField, textField, selectElement, where) {

	var pwhere = valueExists(where) ? where : "";
	try {
		var result = Workflow.callMethod("AbBldgOpsHelpDesk-CommonService-getSelectList", tableName, valueField, textField, pwhere);
	} catch (e) {
		Workflow.handleError(e);
	}

	if (result.code == 'executed') {
		var res = eval('(' + result.jsonExpression + ')');
		var items = res.items;
		var selectElement = document.getElementById(selectElement);

		// get "-select" localized string
		var selectTitle = '';
		if (getMessage('selectTitle') != "")
			selectTitle = getMessage('selectTitle');

		var option = new Option(selectTitle, "");
		selectElement.options[0] = option;

		var j = 1;
		for (i = 0; i < items.length; i++) {
			if (items[i].value != undefined) {
				if (items[i].text == undefined || items[i].text == 'undefined' || items[i].text == '') {
					items[i].text = 'N/A';
					items[i].value = 'N/A';
				}
				var option = new Option(items[i].text, items[i].value);
				selectElement.options[j] = option;
				j++;
			}
		}

	} else {
		Workflow.handleError(result);
	}
}

/**
 * Enable or disable field.
 * 
 * @param field
 * @param show
 */
function SLA_enableField(field, show) {
	$(field).style.readOnly = !show;

	if (!show) {
		$(field).value = "";
	}
}

/**
 * Enable or disable radio button.
 * 
 * @param buttonName
 * @param enabled
 */
function SLA_enableRadioButtons(buttonName, enabled) {
	var buttons = document.getElementsByName(buttonName);
	for (i = 0; i < buttons.length; i++) {
		if (enabled)
			buttons[i].removeAttribute("disabled");
		else
			buttons[i].disabled = true;
	}
}

/**
 * Get workflow content for template.
 * 
 * @param responseParameter
 */
function SLA_getWorkflowContentForTemplate(responseParameter) {
	var workflowContent = [];

	// get workflow content for status 'Requested'
	var requestedContent = SLA_getWorkflowContentForRequested(responseParameter);

	// get workflow content for status 'Approved'
	var approvedContent = SLA_getWorkflowContentForApproved(responseParameter);
	
	// get workflow content for status 'Assign to Work Order'
	var aaContent = {
		id : 'workflowStep_aa',
		title : getMessage('workflowStepAAStatusTitle'),
		actions : SLA_getOptionalStepsByStatus(responseParameter, 'AA')
	}

	// get workflow content for status 'Issued'
	var issuedContent = SLA_getWorkflowContentForIssued(responseParameter);

	// get workflow content for status 'Completed'
	var completedContent = {
		id : 'workflowStep_completed',
		title : getMessage('workflowStepCompleteStatusTitle'),
		actions : SLA_getOptionalStepsByStatus(responseParameter, 'Com')
	}

	// get workflow content for status 'Closed'
	var closedContent = {
		id : 'workflowStep_closed',
		title : getMessage('workflowStepCloseStatusTitle'),
		actions : []
	}

	workflowContent.push(requestedContent);
	workflowContent.push(approvedContent);
	workflowContent.push(aaContent);
	workflowContent.push(issuedContent);
	workflowContent.push(completedContent);
	workflowContent.push(closedContent);

	// To avoid arrow missing, add empty rows, when no steps defined,
	for ( var i = 0; i < workflowContent.length; i++) {
		if (workflowContent[i].actions.length == 0 && workflowContent[i].id != 'workflowStep_closed') {
			workflowContent[i].actions.push({
				id : 'empty_' + status,
				title : '\u200C'
			});
		}
	}

	return {
		workflowSteps : workflowContent
	}
}

/**
 * Get dash workflow content for template which include status Rejected, Stopped, Canceled, or On Hold.
 * 
 * @param responseParameter
 */
function SLA_getDashWorkflowContentForTemplate(responseParameter) {
	var workflowContent = [];

	// get workflow content for status 'Requested'
	var requestedContent = SLA_getWorkflowContentForRequested(responseParameter);

	// get workflow content for status 'Approved'
	var approvedContent = SLA_getWorkflowContentForApproved(responseParameter);
	
	// get workflow content for status 'On Hold for Parts'
	var hpContent = {
		id : 'workflowStep_hp',
		title : getMessage('workflowStepHPStatusTitle'),
		actions : SLA_getOptionalStepsByStatus(responseParameter, 'HP')
	}
	
	// get workflow content for status 'On Hold for Labor'
	var hlContent = {
		id : 'workflowStep_hl',
		title : getMessage('workflowStepHLStatusTitle'),
		actions : SLA_getOptionalStepsByStatus(responseParameter, 'HL')
	}
	
	// get workflow content for status 'On Hold for Access'
	var haContent = {
		id : 'workflowStep_ha',
		title : getMessage('workflowStepHAStatusTitle'),
		actions : SLA_getOptionalStepsByStatus(responseParameter, 'HA')
	}
	
	// get workflow content for status 'Stoped'
	var stopContent = {
		id : 'workflowStep_stop',
		title : getMessage('workflowStepStopStatusTitle'),
		actions : SLA_getOptionalStepsByStatus(responseParameter, 'S')
	}
	
	// get workflow content for status 'Cancelled'
	var canceledContent = {
		id : 'workflowStep_can',
		title : getMessage('workflowStepCanelledStatusTitle'),
		actions : SLA_getOptionalStepsByStatus(responseParameter, 'Can')
	}
	
	// get workflow content for status 'Reject'
	var rejectContent = {
		id : 'workflowStep_rej',
		title : getMessage('workflowStepRejStatusTitle'),
		actions : SLA_getOptionalStepsByStatus(responseParameter, 'Rej')
	}


	if(hpContent.actions.length > 0){
		workflowContent.push(hpContent);
	}
	if(hlContent.actions.length > 0){
		workflowContent.push(hlContent);
	}
	if(haContent.actions.length > 0){
		workflowContent.push(haContent);
	}
	if(stopContent.actions.length > 0){
		workflowContent.push(stopContent);
	}
	if(canceledContent.actions.length > 0){
		workflowContent.push(canceledContent);
	}
	if(rejectContent.actions.length > 0){
		workflowContent.push(rejectContent);
	}

	return {
		workflowSteps : workflowContent
	}
}

/**
 * Get workflow content for status Requested.
 * 
 * @param responseParameter
 */
function SLA_getWorkflowContentForRequested(responseParameter) {
	var actions = SLA_getOptionalStepsByStatus(responseParameter, 'R');
	// add auto approve to the content
	if (responseParameter.autoApprove) {
		actions.push({
			id : 'autoApprove',
			title : getMessage('autoApprove')
		});
	}
	
	// add notify requestor information to the content
	if (responseParameter.notifyRequestor) {
		actions.push({
			id : 'notifyRequestor',
			title : getMessage('notifyRequestor')
		});
	}

	// add optional steps to the content
	var requestedContent = {
		id : 'workflowStep_requested',
		title : getMessage('workflowStepRequestedStatusTitle'),
		actions : actions
	}

	return requestedContent;

}

/**
 * Get workflow content for status Approved.
 * 
 * @param responseParameter
 */
function SLA_getWorkflowContentForApproved(responseParameter) {
	//get application parameter value of WorkRequestsOnly
	var workRequestsOnly = View.activityParameters['AbBldgOpsOnDemandWork-WorkRequestsOnly'];
	
	var actions = [];
	// add dispatch information to the content
	if (responseParameter.workTeam) {
		actions.push({
			id : 'dispatchWorkTeam',
			title : getMessage('dispatchWorkTeam') + ' (' + responseParameter.workTeam + ')'
		});
	} else if (responseParameter.supervisor) {
		actions.push({
			id : 'dispatchSupervisor',
			title : getMessage('dispatchSupervisor') + ' (' + responseParameter.supervisor + ')'
		});
	} else if (responseParameter.dispatcher) {
		actions.push({
			id : 'dispatchDispatcher',
			title : getMessage('dispatchDispatcher') + ' (' + responseParameter.dispatcher + ')'
		});
	}
	
	// add auto create work order information to the content if WorkRequestsOnly = 0
	if (workRequestsOnly == '0' && responseParameter.autoCreateWo) {
		actions.push({
			id : 'autoCreateWo',
			title : getMessage('autoCreateWo')
		});
	}

	// add auto issue information to the content
	if (responseParameter.autoIssue) {
		actions.push({
			id : 'autoIssue',
			title : getMessage('autoIssue')
		});
	}

	// add notify supervisor information to the content
	if (responseParameter.notifySupervisor) {
		actions.push({
			id : 'notifySupservisor',
			title : getMessage('notifySupservisor')
		});
	}

	// add craftperson information to the content
	if (responseParameter.cfId) {
		actions.push({
			id : 'craftsperson',
			title : getMessage('craftsperson') + ': ' + responseParameter.cfId
		});
	}
	
	// add Schedule Immediately? to the content
	if (responseParameter.scheduleimmediately) {
		actions.push({
			id : 'scheduleimmediately',
			title : getMessage('scheduleimmediately')
		});
	}

	// add duration information to the content
	if (responseParameter.duration) {
		actions.push({
			id : 'defaultDuration',
			title : getMessage('defaultDuration') + ': ' + responseParameter.duration
		});
	}

	// add optional steps to the content
	var optionalSteps = [];
	
	//KB3041522 - when WorkRequestsOnly='1', get steps for status AA
	if (workRequestsOnly == '1') {
		optionalSteps = SLA_getOptionalStepsByStatus(responseParameter, 'AA')
	}else{
		optionalSteps = SLA_getOptionalStepsByStatus(responseParameter, 'A');
	}
	
	for ( var i = 0; i < optionalSteps.length; i++) {
		actions.push(optionalSteps[i]);
	}

	var approvedContent = {
		id : 'workflowStep_approved',
		title : getMessage('workflowStepApprovedStatusTitle'),
		actions : actions
	}

	return approvedContent;

}

/**
 * Get PM parameter content.
 * 
 * @param responseParameter
 */
function SLA_getPmParameterContent(responseParameter) {
	var actions = [];
	
	// add auto issue information to the content
	if (responseParameter.autoIssue) {
		actions.push({
			id : 'autoIssue',
			title : getMessage('autoIssue')
		});
	}

	// add notify supervisor information to the content
	if (responseParameter.notifySupervisor) {
		actions.push({
			id : 'notifySupservisor',
			title : getMessage('notifySupservisor')
		});
	}
	
	// add notify craftperson information to the content
	if (responseParameter.notifyCraftsperson) {
		actions.push({
			id : 'notifyCraftsperson',
			title : getMessage('notifyCraftsperson')
		});
	}

	// add craftperson information to the content
	if (responseParameter.cfId) {
		actions.push({
			id : 'craftsperson',
			title : getMessage('craftsperson') + ': ' + responseParameter.cfId
		});
	}

	// add duration information to the content
	if (responseParameter.duration) {
		actions.push({
			id : 'defaultDuration',
			title : getMessage('defaultDuration') + ': ' + responseParameter.duration
		});
	}

	// add dispatch information to the content
	if (responseParameter.workTeam) {
		actions.push({
			id : 'dispatchWorkTeam',
			title : getMessage('dispatchWorkTeam') + ' (' + responseParameter.workTeam + ')'
		});
	} else if (responseParameter.supervisor) {
		actions.push({
			id : 'dispatchSupervisor',
			title : getMessage('dispatchSupervisor') + ' (' + responseParameter.supervisor + ')'
		});
	} else if (responseParameter.dispatcher) {
		actions.push({
			id : 'dispatchDispatcher',
			title : getMessage('dispatchDispatcher') + ' (' + responseParameter.dispatcher + ')'
		});
	}

	var pmParameterCotent = {
		actions : actions
	}

	return pmParameterCotent;

}

/**
 * Get workflow content for status Issued.
 * 
 * @param responseParameter
 */
function SLA_getWorkflowContentForIssued(responseParameter) {
	var actions = [];

	// add notify craftperson information to the content
	if (responseParameter.notifyCraftsperson) {
		actions.push({
			id : 'notifyCraftsperson',
			title : getMessage('notifyCraftsperson')
		});
	}

	// add optional steps to the content
	var optionalSteps = SLA_getOptionalStepsByStatus(responseParameter, 'I');
	for ( var i = 0; i < optionalSteps.length; i++) {
		actions.push(optionalSteps[i]);
	}

	var issuedContent = {
		id : 'workflowStep_issued',
		title : getMessage('workflowStepIssuedStatusTitle'),
		actions : actions
	}

	return issuedContent;

}

/**
 * Get workflow steps by status.
 * 
 * @param responseParameter
 * @param status
 */
function SLA_getOptionalStepsByStatus(responseParameter, status) {
	var actions = [];
	var workflowSteps = responseParameter.workflowSteps;
	for ( var i = 0; i < workflowSteps.length; i++) {
		var workflowStep = workflowSteps[i];
		if (workflowStep.basicStatus == status) {
			var action = {};
			action.id = status + "_" + i
			action.title = workflowStep.toString();
			actions.push(action);
		}
	}

	return actions;
}

/**
 * Open template view by type.
 * 
 * @param type
 * @param formId
 * @param fieldId
 */
function SLA_selectSlaTemplate(type, formId, fieldId,isSelectTemplateValue) {
	var templateView = ''
	if (type == 'workflow') {
		templateView = 'ab-bldgops-sla-od-wf-pre-fill.axvw';
	} else if (type == 'service') {
		templateView = 'ab-bldgops-sla-srv-para-pre-fill.axvw';
	}

	if (templateView) {
		View.slaTemplateForm = View.panels.get(formId);
		View.slaTemplateFieldId = fieldId;
		if(valueExists(isSelectTemplateValue)){
			View.isSelectTemplateValue = isSelectTemplateValue;
		}else{
			View.isSelectTemplateValue = true;
		}
		
		//KB3040804 - select template base on problem type, Form PM SLA, only show PM template, for On Demand SLA, only show On Demand template 
		var restriction = null;
		if(formId == 'quickEditForm'){
			
			restriction = "EXISTS(SELECT 1 FROM helpdesk_sla_request WHERE (helpdesk_sla_request.prob_type is null or helpdesk_sla_request.prob_type != 'PREVENTIVE MAINT') " +
			"AND helpdesk_sla_request.activity_type = helpdesk_sla_response.activity_type AND helpdesk_sla_request.ordering_seq = helpdesk_sla_response.ordering_seq)";
			
			var probType = View.panels.get('quickEditForm').getFieldValue('helpdesk_sla_request.prob_type');
			if(probType == 'PREVENTIVE MAINT'){
				restriction = "EXISTS(SELECT 1 FROM helpdesk_sla_request WHERE helpdesk_sla_request.prob_type = 'PREVENTIVE MAINT' " +
				"AND helpdesk_sla_request.activity_type = helpdesk_sla_response.activity_type AND helpdesk_sla_request.ordering_seq = helpdesk_sla_response.ordering_seq)";
			}
		}
		
		View.openDialog(templateView, restriction, false, {
			title : getMessage('selectTemplate'),
			width : 1000,
			height : 600,
			closeButton : false
		});
	}
}

/**
 * Get auto name of workflow from response parameter.
 * 
 * @param responseParameter
 */
function SLA_getAutoWorkflowName(responseParameter) {
	var workflowName = '';
	// add approval information
	if (responseParameter.autoApprove) {
		workflowName += 'Auto-Approved';
	} else {
		var workflowSteps = responseParameter.workflowSteps;
		for ( var i = 0; i < workflowSteps.length; i++) {
			var approver = '';
			var workflowStep = workflowSteps[i];
			if (workflowStep.basicStatus == 'R' && (workflowStep.stepType == 'approval' || workflowStep.stepType == 'review')) {

				if (workflowStep.emId) {
					approver = workflowStep.emId;
				} else if (workflowStep.roleId) {
					approver = workflowStep.roleId;
				} else if (workflowStep.afmRole) {
					approver = workflowStep.afmRole;
				} else if (workflowStep.cfId) {
					approver = workflowStep.cfId;
				} else if (workflowStep.vnId) {
					approver = workflowStep.vnId;
				}
			}

			if (approver) {
				workflowName += 'Approved by ' + approver;
				break;
			}
		}
	}

	// add issue information
	if (responseParameter.autoIssue) {
		workflowName += '; Auto Issue';
	}

	// add dispatch information
	if (responseParameter.workTeam) {
		workflowName += '; Work Team ' + responseParameter.workTeam;
	} else if (responseParameter.supervisor) {
		workflowName += '; Supervisor ' + responseParameter.supervisor;
	} else if (responseParameter.dispatcher) {
		workflowName += '; Dispatcher ' + responseParameter.dispatcher;
	}

	return workflowName;
}

/**
 * Get auto name of service parameter from response parameter.
 * 
 * @param responseParameter
 */
function SLA_getAutoServiceName(responseParameter) {
	//get service window days
	var servWindoDays = SLA_getServiceDays(responseParameter);

	// get service window time
	var serviceWindowTime = SLA_formatTimeFieldValue(responseParameter.servWindowStart) + '-' + SLA_formatTimeFieldValue(responseParameter.servWindowEnd);

	// get time to complete
	var timeToComplete = '';
	if (responseParameter.timeToComplete) {
		timeToComplete = getMessage('Completein') + " " + responseParameter.timeToComplete + ' ' + SLA_getIntervalDisplayedValue(responseParameter.intervalToComplete);
	}

	// concat service window days, service window time and time to complete together as the service name
	var serviceName = servWindoDays + '; ' + serviceWindowTime + '; ' + timeToComplete;

	return serviceName;
}

/**
 * Move standard field to target element.
 * 
 * @param formId
 * @param fieldName
 * @param targetEl
 */
function SLA_getServiceDays(responseParameter) {
	// get service window days
	var days = responseParameter.servWindoDays.split(",", 7);
	var dayTitle = [ Ab.view.View.getLocalizedString(Calendar.MESSAGE_SUN), 
	                 Ab.view.View.getLocalizedString(Calendar.MESSAGE_MON), 
	                 Ab.view.View.getLocalizedString(Calendar.MESSAGE_TUE),
	                 Ab.view.View.getLocalizedString(Calendar.MESSAGE_WED),
	                 Ab.view.View.getLocalizedString(Calendar.MESSAGE_THUR),
	                 Ab.view.View.getLocalizedString(Calendar.MESSAGE_FRI),
	                 Ab.view.View.getLocalizedString(Calendar.MESSAGE_SAT)
	               ];
	var servWindoDays = '';

	// get service window days like Mon-Fri if consecutive,
	// If non-consecutive, list out those days individually and separated by commas
	var consecutive = false;
	for ( var i = 0; i < 7; i++) {
		if (days[i] == 1) {
			if (i > 0 && days[i - 1] == 1) {
				if (!consecutive) {
					servWindoDays += '-';
				}
				consecutive = true;

				if (i < 6 && days[i + 1] == 1) {

				} else {
					servWindoDays += dayTitle[i];
					consecutive = false;
					continue;
				}
			}

			if (!consecutive) {
				servWindoDays += ',' + dayTitle[i];
			}
		} else {
			consecutive = false;
		}
	}
	
	servWindoDays = servWindoDays.substring(1);
	
	return servWindoDays;
}

/**
 * Move standard field to target element.
 * 
 * @param formId
 * @param fieldName
 * @param targetEl
 */
function SLA_moveFormField(formId, fieldName, targetEl) {
	var fieldElement = Ext.get(formId + '_' + fieldName).parent();
	Ext.get(targetEl).appendChild(fieldElement);
}

/**
 * Format time field value from database and get the display value by local.
 * 
 * @param value
 */
function SLA_formatTimeFieldValue(value) {
	var ds = View.dataSources.get('slaResponseDS');
	value = ds.parseValue('helpdesk_sla_response.serv_window_start', value, false);
	return ds.formatValue('helpdesk_sla_response.serv_window_start', value, true);
}

/**
 * Get localized displayed value of field helpdesk_sla_response.interval_to_complete and helpdesk_sla_response.interval_to_respond.
 * 
 * @param value
 */
function SLA_getIntervalDisplayedValue(value) {
	var ds = View.dataSources.get('slaResponseDS');
	return ds.fieldDefs.get('helpdesk_sla_response.interval_to_complete').enumValues[value];
}

/**
 * Enable fields when switch option radios in the dispatch form.
 * 
 * @param form
 */
function SLA_onChagneDispatchForm(form,event) {
	var workTeamRadio = Ext.get('dispatchToWorkTeam').dom;
	var supervisorRadio = Ext.get('dispatchToSupervisor').dom;
	var dispatcherRadio = Ext.get('dispatchToDispatcher').dom;

	if (workTeamRadio.checked) {
		
		form.enableField('helpdesk_sla_response.work_team_id', true);
		form.enableField('helpdesk_sla_response.supervisor', false);
		form.setFieldValue('helpdesk_sla_response.supervisor', '');
		
	}

	if (supervisorRadio.checked) {
		
		form.enableField('helpdesk_sla_response.supervisor', true);
		form.enableField('helpdesk_sla_response.work_team_id', false);
		form.setFieldValue('helpdesk_sla_response.work_team_id', '');
		
	}

	if (dispatcherRadio.checked) {
		
		form.enableField('helpdesk_sla_response.supervisor', false);
		form.setFieldValue('helpdesk_sla_response.supervisor', '');

		form.enableField('helpdesk_sla_response.work_team_id', false);
		form.setFieldValue('helpdesk_sla_response.work_team_id', '');
		//KB3044055 - pop-up the Dispatch form when the user chooses to assign request to Dispatcher
		if(valueExists(event)){
			jQuery('#addDispatchStep').click();
		}
	}
}

/**
 * Enable fields when switch option radios in the dispatch form.
 * 
 * @param form
 */
function SLA_onChagneAssignToCfRadio(form,event) {
	var assignToCfRadio = Ext.get('assignToCf').dom;
	var assignToCfRoleRadio = Ext.get('assignToCfRole').dom;

	if (assignToCfRadio.checked) {
		
		form.enableField('helpdesk_sla_response.cf_id', true);
		form.enableField('helpdesk_sla_response.cf_role', false);
		form.setFieldValue('helpdesk_sla_response.cf_role', '');
		
	}

	if (assignToCfRoleRadio.checked) {
		
		form.enableField('helpdesk_sla_response.cf_role', true);
		form.enableField('helpdesk_sla_response.cf_id', false);
		form.setFieldValue('helpdesk_sla_response.cf_id', '');
		
	}

}


/**
 * Return to Console.
 */
function SLA_returnToConsole() {
	View.confirm(getMessage("confirmClose"), function(button) {
		if (button == 'yes') {
			try {
				View.closeThisDialog();
			} catch (e) {
				Workflow.handleError(e);
			}
		}
	});
}

var SLA_ALL_STEPS = [];

/**
 * Get all sla steps.
 */
function SLA_getAllSlaSteps() {
	var result = Workflow.callMethod("AbBldgOpsHelpDesk-StepService-getSteps");
	SLA_ALL_STEPS = eval('(' + result.jsonExpression + ')');
}

/**
 * Get all sla steps.
 */
function SLA_getStepLocalizedName(basicStatus,stepType,stepName) {
	var localizedStepName = stepName;
	for (i = 0; i < SLA_ALL_STEPS.length; i++) {
		if (SLA_ALL_STEPS[i].state == basicStatus) {
			var types = SLA_ALL_STEPS[i].types;
			for (j = 0; j < types.length; j++) {
				if (types[j].type.value == stepType) {
					var mySteps = types[j].steps;
					if (mySteps.length > 0) {
						for (k = 0; k < mySteps.length; k++) {
							if(mySteps[k].step == stepName){
								localizedStepName = mySteps[k].text;
								break;
							}
						}
					} 
				}
			}
		}
	}
	
	return localizedStepName;
}
