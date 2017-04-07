/**
 * Controller of Showing Summary.
 * 
 */
View.createController('summary', {
	/**
	 * Selected SLA object.
	 */
	selectedSLA : null,

	/**
	 * Current priority level.
	 */
	curentPriorityLevel : null,

	/**
	 * Maps DOM events to event listeners.
	 */
	events : {
		'click .priorityLevelRadio' : function(event) {
			this.trigger('app:operation:express:sla:switchSummaryPriorityLevelRadio', event.target.value);
			this.trigger('app:operation:express:sla:afterShowSlaSummary');
		}
	},

	/**
	 * Constructor.
	 */
	afterCreate : function() {
		this.on('app:operation:express:sla:showSlaSummary', this.showSummary);
		this.on('app:operation:express:sla:switchSummaryPriorityLevelRadio', this.switchSummaryPriorityLevelRadio);
	},
	
	/**
	 * Load all sla steps.
	 */
	afterViewLoad : function() {
		SLA_getAllSlaSteps();
	},
	
	/**
	 * Create Grouping.
	 */
	summaryForm_onCreateGrouping : function() {
		this.summaryForm.closeWindow();
		this.trigger('app:operation:express:sla:createGroupings', this.summaryForm.parentSlaRow);
	},

	/**
	 * Shows some (fake) summary information in the Summary footer.
	 */
	showSummary : function(selectedSLA) {
		// store the sla object to controller
		this.selectedSLA = selectedSLA;

		// show reqeust parameters
		this.showRequestParameters();

		// show the first priority level in workflow tab and service parameters tab
		this.showPriorityLevel(1);

		// invoke callback after showing sla summary
		this.trigger('app:operation:express:sla:afterShowSlaSummary');
	},

	/**
	 * Switch summary priority level radio button.
	 */
	switchSummaryPriorityLevelRadio : function(level) {
		if (this.curentPriorityLevel != level) {
			this.showPriorityLevel(level);
		}
	},

	/**
	 * Show request parameters
	 */
	showRequestParameters : function() {
		var requestParameters = this.selectedSLA.requestParameters;
		var form = this.requestParametersReport;
		this.setFieldValue(form, 'helpdesk_sla_request.prob_type', requestParameters.probType);
		this.setFieldValue(form, 'helpdesk_sla_request.site_id', requestParameters.siteId);
		this.setFieldValue(form, 'helpdesk_sla_request.bl_id', requestParameters.blId);
		this.setFieldValue(form, 'helpdesk_sla_request.fl_id', requestParameters.flId);
		this.setFieldValue(form, 'helpdesk_sla_request.rm_id', requestParameters.rmId);
		this.setFieldValue(form, 'helpdesk_sla_request.requestor', requestParameters.requestor);
		this.setFieldValue(form, 'helpdesk_sla_request.em_std', requestParameters.emStd);
		this.setFieldValue(form, 'helpdesk_sla_request.dv_id', requestParameters.dvId);
		this.setFieldValue(form, 'helpdesk_sla_request.dp_id', requestParameters.dpId);
		this.setFieldValue(form, 'helpdesk_sla_request.eq_std', requestParameters.eqStd);
		this.setFieldValue(form, 'helpdesk_sla_request.eq_id', requestParameters.eqId);
		this.setFieldValue(form, 'helpdesk_sla_request.pmp_id', requestParameters.pmpId);

		this.showPriorityLevelsOptionField();
		form.showAt('requestParametersSummary');
		
		//remove mouse over and mouse out event to avoid font change when hover the text
		jQuery('td[id^=requestParametersReport_][id$=_fieldCell]').addClass('hovered');
		jQuery('td[id^=requestParametersReport_][id$=_fieldCell]').each(function(){
			this.onmouseover = null;
			this.onmouseout = null;
		});
	},

	/**
	 * Show the selected priority level.
	 */
	showPriorityLevel : function(level) {
		// make sure the radio button is checked
		var radioEl = Ext.fly('priority_level_radio_' + level);
		if (radioEl) {
			Ext.fly('priority_level_radio_' + level).dom.checked = true;
		}

		// store current priority level
		this.curentPriorityLevel = level;

		// clear priory level in the interface before showing new information
		this.clearPriorityLevel();

		// get the response parameter of given priority level
		var responseParameter = this.getResponseParameterByLevel(level);
		if (responseParameter) {
			if('PREVENTIVE MAINT' != this.selectedSLA.requestParameters.probType){
				
				// show workflow steps
				this.showWorflowSteps(responseParameter);
				
			}else{
				
				// show PM parameters
				this.showPmParameters(responseParameter);
				
			}

			// show service parameters
			this.showServiceParameters(responseParameter);
		}
	},

	/**
	 * Clear priory level in the interface.
	 */
	clearPriorityLevel : function(level) {
		Ext.fly('workflowSummary').update('');
		Ext.fly('serviceParametersSummary').setDisplayed(false);
		Ext.fly('workflowSummary_title').removeClass('exSummaryComplete');
		Ext.fly('serviceSummary_title').removeClass('exSummaryComplete');
	},

	/**
	 * Get response parameter by priority level.
	 */
	getResponseParameterByLevel : function(level) {
		var targetResponseParameter = null;
		_.each(this.selectedSLA.responseParameters, function(responseParameter, index) {
			if (responseParameter.priorityLevel == level) {
				targetResponseParameter = responseParameter;
			}
		});

		return targetResponseParameter;
	},

	/**
	 * Show workflow steps
	 */
	showWorflowSteps : function(responseParameter) {
		var workflowContent = SLA_getWorkflowContentForTemplate(responseParameter);
		View.templates.get('workflowSummaryTemplate').render(workflowContent, '#workflowSummary');
		Ext.fly('workflowSummary_title').addClass('exSummaryComplete');
		jQuery('#workflowStep_closed').siblings().remove();
		
		var dashWorkflowContent = SLA_getDashWorkflowContentForTemplate(responseParameter);
		View.templates.get('dashWorkflowSummaryTemplate').render(dashWorkflowContent, '#workflowSummary');
		// check application paramter WorkRequestsOnly to determin whether showing Assign to Work order status
		this.checkWorkRequestsOnly();
	},
	
	/**
	 * Show PM parameters
	 */
	showPmParameters : function(responseParameter) {
		var workflowContent = SLA_getPmParameterContent(responseParameter);
		View.templates.get('pmParameterSummaryTemplate').render(workflowContent, '#workflowSummary');
		Ext.fly('workflowSummary_title').addClass('exSummaryComplete');
	},

	/**
	 * Get workflow actions from response parameters.
	 */
	getWorkflowActions : function(responseParameter, status) {
		var actions = [];
		var workflowSteps = responseParameter.workflowSteps;
		_.each(workflowSteps, function(workflowStep, index) {
			if (workflowStep.basicStatus == status) {
				var action = {};
				action.id = status + "_" + index
				action.title = workflowStep.toString();
				actions.push(action);
			}
		});

		if (actions.length == 0) {
			actions.push({
				id : 'empty_' + status,
				title : '(No optional steps)'
			});
		}

		return actions;
	},

	/**
	 * Show service parameters
	 */
	showServiceParameters : function(responseParameter) {
		Ext.fly('serviceParametersSummary').setDisplayed(true);
		Ext.fly('serviceSummary_title').addClass('exSummaryComplete');

		var form = this.serviceParametersReport;
		this.setFieldValue(form, 'helpdesk_sla_response.servcont_id', responseParameter.contractId);
		this.setFieldValue(form, 'helpdesk_sla_response.manager', responseParameter.manager);

		if (responseParameter.servWindowStart) {
			form.showField('serviceWindow', true);
			Ext.fly('serviceParametersReport_serviceWindow').update(SLA_formatTimeFieldValue(responseParameter.servWindowStart) + '-' + SLA_formatTimeFieldValue(responseParameter.servWindowEnd)+'<br/>'
					+SLA_getServiceDays(responseParameter)+'<br/>'+(responseParameter.allowWorkOnHoliday?getMessage('allowWorkOnHoliday'):getMessage('noHoliday')));
		} else {
			form.showField('serviceWindow', false);
		}

		if (responseParameter.timeToRespond) {
			form.showField('timeToResponse', true);			
			Ext.fly('serviceParametersReport_timeToResponse').update(responseParameter.timeToRespond + ' ' + SLA_getIntervalDisplayedValue(responseParameter.intervalToRespond));
		} else {
			form.showField('timeToResponse', false);
		}

		if (responseParameter.timeToComplete) {
			form.showField('timeToComplete', true);		
			Ext.fly('serviceParametersReport_timeToComplete').update(responseParameter.timeToComplete + ' ' + SLA_getIntervalDisplayedValue(responseParameter.intervalToComplete));
		} else {
			form.showField('timeToComplete', false);
		}

		form.showAt('serviceParametersSummary');
		//remove mouse over and mouse out event to avoid font change when hover the text
		jQuery('td[id^=serviceParametersReport_][id$=_fieldCell]').addClass('hovered');
		jQuery('td[id^=serviceParametersReport_][id$=_fieldCell]').each(function(){
			this.onmouseover = null;
			this.onmouseout = null;
		});
	},

	/**
	 * Set field value and show or hide field base on field value.
	 */
	setFieldValue : function(form, fieldName, fieldValue) {
		if (valueExistsNotEmpty(fieldValue)) {
			// if field value not empty, show field and set the value in the interface
			form.showField(fieldName, true);
			fieldValue = fieldValue.replaceAll(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR, "<br/>");
			form.setFieldValue(fieldName, fieldValue);
		} else {
			// if field value empty, hide the field
			form.showField(fieldName, false);
		}
	},

	/**
	 * Show Priority levels option field in the request parameter tab.
	 */
	showPriorityLevelsOptionField : function() {
		if (this.selectedSLA.responseParameters.length > 1) {
			this.requestParametersReport.showElement(this.requestParametersReport.getFieldLabelElement('priorityLevels').parentNode, true);
			jQuery('#priority_levels_table').empty();
			var priorityLevelRows = [];
			for ( var i = 0; i < this.selectedSLA.responseParameters.length; i++) {
				var responseParameter = this.selectedSLA.responseParameters[i];
				priorityLevelRows.push({
					id : responseParameter.priorityLevel,
					label : responseParameter.priorityLevelLabel
				});
			}

			var clientChoosesPriorityMessage = getMessage('clientChoosesPriority');
			if (this.selectedSLA.requestParameters.defaultPriority > 0) {
				clientChoosesPriorityMessage = getMessage('clientNotChoosesPriority');
			}
			View.templates.get('priorityLevelRowTemplate').render({
				priorityLevels : priorityLevelRows,
				clientChoosesPriorityMessage : clientChoosesPriorityMessage
			}, '#priority_levels_table');

		} else {
			this.requestParametersReport.showElement(this.requestParametersReport.getFieldLabelElement('priorityLevels').parentNode, false);
		}
	},
	
	/**
	 * check application paramter WorkRequestsOnly to determin whether showing Assign to Work order status
	 */
	checkWorkRequestsOnly : function(checked) {
		var workRequestsOnly = View.activityParameters['AbBldgOpsOnDemandWork-WorkRequestsOnly'];
		if (workRequestsOnly == '1') {
			if(Ext.fly('workflowStep_aa')){
				Ext.fly('workflowStep_aa').parent().setDisplayed(false);
			}
		}
	}
});

String.prototype.replaceAll = function(search, replacement){
	var i = this.indexOf(search);
	var object = this;
	
	while (i > -1){
		object = object.replace(search, replacement); 
		i = object.indexOf(search);
	}
	return object;
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