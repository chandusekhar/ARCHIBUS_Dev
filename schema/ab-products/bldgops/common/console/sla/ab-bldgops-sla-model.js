Ab.namespace('operation.express.sla');

/**
 * Service Level Agreements.
 */
Ab.operation.express.sla.ServiceLevelAgreements = Base.extend({
	/**
	 * Request parameters.
	 */
	requestParameters : null,

	/**
	 * Response parameters.
	 */
	responseParameters : null,

	/**
	 * Constructor.
	 */
	constructor : function() {
		this.requestParameters = new Ab.operation.express.sla.RequestParameters();
		this.responseParameters = [];
	},

	/**
	 * Load Service Level Agreements from grouping code.
	 * 
	 * @param grouping
	 *            grouping code
	 */
	loadByGrouping : function(grouping) {
		// set request parameters
		this.setRequestParametersByGrouping(grouping);
		// set response parameters
		this.setResponseParametersByGrouping(grouping);
		// set workflow steps
		this.setWorkflowStepsByGrouping(grouping);
	},

	/**
	 * Set request parameters from grouping code.
	 * 
	 * @param grouping
	 *            grouping code
	 */
	setRequestParametersByGrouping : function(grouping) {
		// create Request parameter object
		this.requestParameters = new Ab.operation.express.sla.RequestParameters();

		// call WFR AbBldgOpsHelpDesk-SLAService-getRequestParametersByGrouping
		// to get request parameters
		try {
			var ruleName = 'AbBldgOpsHelpDesk-SLAService-getRequestParametersByGrouping';
			var record = Workflow.callMethod(ruleName, parseInt(grouping)).dataSet;
			this.requestParameters.setValuesFromRecord(record);
		} catch (e) {
			Workflow.handleError(e);
		}
	},

	/**
	 * Set response parameters from grouping code.
	 * 
	 * @param grouping
	 *            grouping code
	 */
	setResponseParametersByGrouping : function(grouping) {
		this.responseParameters = [];

		// call WFR AbBldgOpsHelpDesk-SLAService-getResponseParametersByGrouping
		// to get response parameters
		try {
			var ruleName = 'AbBldgOpsHelpDesk-SLAService-getResponseParametersByGrouping';
			var records = Workflow.callMethod(ruleName, parseInt(grouping)).dataSet.records;
			for ( var i = 0; i < records.length; i++) {
				var responseParameter = new Ab.operation.express.sla.ResponseParameters();
				responseParameter.setValuesFromRecord(records[i]);
				this.responseParameters.push(responseParameter);
			}

		} catch (e) {
			Workflow.handleError(e);
		}
	},

	/**
	 * Set workflow steps from grouping code.
	 * 
	 * @param grouping
	 *            grouping code
	 */
	setWorkflowStepsByGrouping : function(grouping) {
		if (this.responseParameters.length > 0) {

			// call WFR AbBldgOpsHelpDesk-SLAService-getWorkflowStepsByGrouping
			// to get workflow steps
			try {
				var ruleName = 'AbBldgOpsHelpDesk-SLAService-getWorkflowStepsByGrouping';
				var records = Workflow.callMethod(ruleName, parseInt(grouping)).dataSet.records;
				for ( var i = 0; i < this.responseParameters.length; i++) {
					this.responseParameters[i].setWorkflowStepsFromRecords(records);
				}

			} catch (e) {
				Workflow.handleError(e);
			}
		}
	}

});

/**
 * Service Level Agreements Request parameters.
 */
Ab.operation.express.sla.RequestParameters = Base.extend({
	/**
	 * Grouping code.
	 */
	grouping : 0,

	/**
	 * Site Id.
	 */
	siteId : '',

	/**
	 * Building id.
	 */
	blId : '',

	/**
	 * Floor id.
	 */
	flId : '',

	/**
	 * Room id.
	 */
	rmId : '',

	/**
	 * Requestor.
	 */
	requestor : '',

	/**
	 * Employee standard.
	 */
	emStd : '',

	/**
	 * Division id.
	 */
	dvId : '',

	/**
	 * Department id.
	 */
	dpId : '',

	/**
	 * Problem Type.
	 */
	probType : '',

	/**
	 * Equipment Standard.
	 */
	eqStd : '',

	/**
	 * Equipment id.
	 */
	eqId : '',
	
	/**
	 * PMP id.
	 */
	pmpId : '',

	/**
	 * Default priority.
	 */
	defaultPriority : 1,

	/**
	 * Constructor.
	 */
	constructor : function() {

	},

	/**
	 * Set values from data record.
	 * 
	 * @param record
	 *            data record from WFR dataSet
	 */
	setValuesFromRecord : function(record) {
		this.grouping = record.getValue('helpdesk_sla_request.grouping');
		this.siteId = record.getValue('helpdesk_sla_request.site_id');
		this.blId = record.getValue('helpdesk_sla_request.bl_id');
		this.flId = record.getValue('helpdesk_sla_request.fl_id');
		this.rmId = record.getValue('helpdesk_sla_request.rm_id');
		this.requestor = record.getValue('helpdesk_sla_request.requestor');
		this.emStd = record.getValue('helpdesk_sla_request.em_std');
		this.dvId = record.getValue('helpdesk_sla_request.dv_id');
		this.dpId = record.getValue('helpdesk_sla_request.dp_id');
		this.probType = record.getValue('helpdesk_sla_request.prob_type');
		this.eqStd = record.getValue('helpdesk_sla_request.eq_std');
		this.eqId = record.getValue('helpdesk_sla_request.eq_id');
		this.pmpId = record.getValue('helpdesk_sla_request.pmp_id');
		this.defaultPriority = record.getValue('helpdesk_sla_request.default_priority');
	}

});

/**
 * Service Level Agreements Response parameters.
 */
Ab.operation.express.sla.ResponseParameters = Base.extend({

	/**
	 * Priority Level.
	 */
	priorityLevel : '1',

	/**
	 * Priority Level label.
	 */
	priorityLevelLabel : '',

	/**
	 * Auto approve work request true|false.
	 */
	autoApprove : true,
	
	/**
	 * Auto create work order true|false.
	 */
	autoCreateWo : true,

	/**
	 * Auto issue work request true|false.
	 */
	autoIssue : false,
	
	/**
	 * Auto schedule work request true|false.
	 */
	autoSchedule : true,
	
	/**
	 * Auto dispatch work request true|false.
	 */
	autoDispatch : true,

	/**
	 * Supervisor.
	 */
	supervisor : '',

	/**
	 * Work Team.
	 */
	workTeam : '',

	/**
	 * Dispatcher.
	 */
	dispatcher : '',

	/**
	 * Craftsperson code.
	 */
	cfId : '',
	
	/**
	 * Craftsperson Role.
	 */
	cfRole : '',

	/**
	 * Duration hours.
	 */
	duration : 0,

	/**
	 * Notify requestor.
	 */
	notifyRequestor : false,

	/**
	 * Notify Supervisor.
	 */
	notifySupervisor : false,

	/**
	 * Notify Craftsperson.
	 */
	notifyCraftsperson : false,

	/**
	 * Service Window days.
	 */
	servWindoDays : '0,1,1,1,1,1,0',

	/**
	 * Service Window Start neutral value.
	 */
	servWindowStart : '09:00.00.000',

	/**
	 * Service Window End neutral value.
	 */
	servWindowEnd : '17:00.00.000',

	/**
	 * Allow Work on holiday.
	 */
	allowWorkOnHoliday : false,

	/**
	 * Service Desk manager.
	 */
	manager : '',

	/**
	 * Service Contract code.
	 */
	contractId : '',

	/**
	 * Time to response.
	 */
	timeToRespond : 0,

	/**
	 * Interval to Respond.
	 */
	intervalToRespond : 'd',

	/**
	 * Time to Complete.
	 */
	timeToComplete : 0,

	/**
	 * Interval to Complete.
	 */
	intervalToComplete : 'd',

	/**
	 * Workflow Steps.
	 */
	workflowSteps : [],

	/**
	 * Workflow name.
	 */
	workflowName : '',

	/**
	 * Workflow template?
	 */
	workflowTemplate : 0,

	/**
	 * Service name.
	 */
	serviceName : '',

	/**
	 * Service template?
	 */
	serviceTemplate : 0,

	/**
	 * Schedule Immediately?
	 */
	scheduleimmediately : false,
	
	/**
	 * Enforce new workflow?
	 */
	enforceNewWorkflow : false,
	
	/**
	 * Constructor.
	 */
	constructor : function() {
		this.workflowSteps = [];
		this.servWindowStart = View.activityParameters["AbBldgOpsHelpDesk-ServiceWindowStart"];
		this.servWindowEnd = View.activityParameters["AbBldgOpsHelpDesk-ServiceWindowEnd"];
		
	},

	/**
	 * Load from template.
	 * 
	 * @param templateName
	 *            template name
	 */
	loadFromTemplate : function(templateName, type) {
		var ruleName = 'AbBldgOpsHelpDesk-SLAService-getResponseParametersByTemplate';
		var records = Workflow.callMethod(ruleName, templateName, type).dataSet.records;
		if (records.length > 0) {
			this.setValuesFromRecord(records[0]);
			ruleName = 'AbBldgOpsHelpDesk-SLAService-getWorkflowStepsByTemplate';
			records = Workflow.callMethod(ruleName, templateName, type).dataSet.records;
			this.setWorkflowStepsFromRecords(records);
		}
	},

	/**
	 * Set values from data record.
	 * 
	 * @param record
	 *            data record from WFR dataSet
	 */
	setValuesFromRecord : function(record) {
		this.priorityLevel = record.getValue('helpdesk_sla_response.priority');
		this.priorityLevelLabel = record.getValue('helpdesk_sla_response.priority_label');
		this.autoApprove = record.getValue('helpdesk_sla_response.autoapprove') == 1 ? true : false;
		this.autoCreateWo = record.getValue('helpdesk_sla_response.autocreate_wo') == 1 ? true : false;
		this.autoIssue = record.getValue('helpdesk_sla_response.autoissue') == 1 ? true : false;
		this.autoSchedule = record.getValue('helpdesk_sla_response.autoschedule') == 1 ? true : false;
		this.autoDispatch = record.getValue('helpdesk_sla_response.autodispatch') == 1 ? true : false;
		this.supervisor = record.getValue('helpdesk_sla_response.supervisor');
		this.workTeam = record.getValue('helpdesk_sla_response.work_team_id');
		this.dispatcher = record.getValue('helpdesk_sla_response.dispatcher');
		this.cfId = record.getValue('helpdesk_sla_response.cf_id');
		this.cfRole = record.getValue('helpdesk_sla_response.cf_role');
		this.duration = record.getValue('helpdesk_sla_response.default_duration');
		if (!valueExistsNotEmpty(this.duration)) {
			this.duration = 0;
		}
		this.notifyRequestor = record.getValue('helpdesk_sla_response.notify_requestor') == 1 ? true : false;
		this.notifySupervisor = record.getValue('helpdesk_sla_response.notify_service_provider') == 1 ? true : false;
		this.notifyCraftsperson = record.getValue('helpdesk_sla_response.notify_craftsperson') == 1 ? true : false;

		this.servWindoDays = record.getValue('helpdesk_sla_response.serv_window_days');
		this.servWindowStart = record.getValue('helpdesk_sla_response.serv_window_start');
		this.servWindowEnd = record.getValue('helpdesk_sla_response.serv_window_end');
		this.allowWorkOnHoliday = record.getValue('helpdesk_sla_response.allow_work_on_holidays') == 1 ? true : false;
		this.manager = record.getValue('helpdesk_sla_response.manager');
		this.contractId = record.getValue('helpdesk_sla_response.servcont_id');
		this.timeToRespond = record.getValue('helpdesk_sla_response.time_to_respond');
		if (!valueExistsNotEmpty(this.timeToRespond)) {
			this.timeToRespond = 0;
		}
		this.intervalToRespond = record.getValue('helpdesk_sla_response.interval_to_respond');
		this.timeToComplete = record.getValue('helpdesk_sla_response.time_to_complete');
		if (!valueExistsNotEmpty(this.timeToComplete)) {
			this.timeToComplete = 0;
		}
		this.intervalToComplete = record.getValue('helpdesk_sla_response.interval_to_complete');

		this.workflowName = record.getValue('helpdesk_sla_response.workflow_name');
		this.workflowTemplate = record.getValue('helpdesk_sla_response.workflow_template');
		this.serviceName = record.getValue('helpdesk_sla_response.service_name');
		this.serviceTemplate = record.getValue('helpdesk_sla_response.service_template');
		this.scheduleimmediately = record.getValue('helpdesk_sla_response.schedule_immediately') == 1 ? true : false;
		this.enforceNewWorkflow = record.getValue('helpdesk_sla_response.enforce_new_workflow') == 1 ? true : false;
	},

	/**
	 * Set workflow steps from data records.
	 * 
	 * @param records
	 *            workflow data records from WFR dataSet
	 */
	setWorkflowStepsFromRecords : function(records) {

		this.workflowSteps = [];

		var index = 0;
		for ( var i = 0; i < records.length; i++) {
			var record = records[i];
			if (record.getValue('helpdesk_sla_steps.priority') == this.priorityLevel) {
				var workflowStep = new Ab.operation.express.sla.WorkflowStep();
				workflowStep.setValuesFromRecord(record);
				workflowStep.index = index;
				this.workflowSteps.push(workflowStep);
				index++;
			}
		}
	},

	/**
	 * Copy workflow values from given response parameter.
	 * 
	 * @param responseParameter
	 *            The given response parameter
	 */
	copyWorkflowParameters : function(responseParameter) {
		this.autoApprove = responseParameter.autoApprove;
		this.autoIssue = responseParameter.autoIssue;
		this.supervisor = responseParameter.supervisor;
		this.workTeam = responseParameter.workTeam;
		this.dispatcher = responseParameter.dispatcher;
		this.cfId = responseParameter.cfId;
		this.cfRole = responseParameter.cfRole;
		this.duration = responseParameter.duration;
		this.notifyRequestor = responseParameter.notifyRequestor;
		this.notifySupervisor = responseParameter.notifySupervisor;
		this.notifyCraftsperson = responseParameter.notifyCraftsperson;
		this.scheduleimmediately = responseParameter.scheduleimmediately;
		this.enforceNewWorkflow = responseParameter.enforceNewWorkflow;
		this.workflowSteps = responseParameter.workflowSteps;
	},

	/**
	 * Copy service values from given response parameter.
	 * 
	 * @param responseParameter
	 *            The given response parameter
	 */
	copyServiceParameters : function(responseParameter) {
		this.servWindoDays = responseParameter.servWindoDays;
		this.servWindowStart = responseParameter.servWindowStart;
		this.servWindowEnd = responseParameter.servWindowEnd;
		this.allowWorkOnHoliday = responseParameter.allowWorkOnHoliday;
		this.manager = responseParameter.manager;
		this.contractId = responseParameter.contractId;
		this.timeToRespond = responseParameter.timeToRespond;
		this.intervalToRespond = responseParameter.intervalToRespond;
		this.timeToComplete = responseParameter.timeToComplete;
		this.intervalToComplete = responseParameter.intervalToComplete;
	}

});

/**
 * Service Level Agreements Workflow Step.
 */
Ab.operation.express.sla.WorkflowStep = Base.extend({

	/**
	 * index of the steps array.
	 */
	index : null,

	/**
	 * Basic status.
	 */
	basicStatus : '',

	/**
	 * Step Name.
	 */
	stepName : '',

	/**
	 * Step Type.
	 */
	stepType : '',

	/**
	 * Step order.
	 */
	stepOrder : 1,

	/**
	 * Employee code.
	 */
	emId : '',

	/**
	 * Service Desk Role name.
	 */
	roleId : '',

	/**
	 * AFM Role name.
	 */
	afmRole : '',

	/**
	 * Craftsperson.
	 */
	cfId : '',

	/**
	 * vendor code.
	 */
	vnId : '',

	/**
	 * Nofity response.
	 */
	notifyResponse : true,

	/**
	 * Multiple Required or not.
	 */
	multipleRequired : false,

	/**
	 * Sql condition.
	 */
	sqlCondition : '',

	/**
	 * Is first one on the same status group.
	 */
	isFirstInGroup : false,

	/**
	 * Is last one on the same status group.
	 */
	isLastInGroup : false,

	/**
	 * Constructor.
	 */
	constructor : function() {
	},

	/**
	 * Set values from data record.
	 * 
	 * @param record
	 *            data record from WFR dataSet
	 */
	setValuesFromRecord : function(record) {
		this.basicStatus = record.getValue('helpdesk_sla_steps.status');
		this.stepName = record.getValue('helpdesk_sla_steps.step');
		this.stepType = record.getValue('helpdesk_sla_steps.step_type');
		this.emId = record.getValue('helpdesk_sla_steps.em_id');
		this.roleId = record.getValue('helpdesk_sla_steps.role');
		this.afmRole = record.getValue('helpdesk_sla_steps.role_name');
		this.cfId = record.getValue('helpdesk_sla_steps.cf_id');
		this.vnId = record.getValue('helpdesk_sla_steps.vn_id');
		this.notifyResponse = record.getValue('helpdesk_sla_steps.notify_responsible') == '1' ? true : false;
		this.multipleRequired = record.getValue('helpdesk_sla_steps.multiple_required') == '1' ? true : false;
		this.sqlCondition = record.getValue('helpdesk_sla_steps.condition');
		this.stepOrder = record.getValue('helpdesk_sla_steps.step_order');
	},

	/**
	 * Convert to description.
	 */
	toString : function() {
		var txt = '';
		var byMessage = '';
		//KB3043327 - change the display of Notification steps in the SLA Summary			
		if(this.stepType == 'notification'){
			txt = getMessage('Notify');
		}else{
			txt = SLA_getStepLocalizedName(this.basicStatus, this.stepType, this.stepName);
			byMessage = getMessage("by");
		}
		
		if (this.emId || this.vnId || this.cfId || this.roleId || this.afmRole) {
			txt += " " + byMessage+ " " + this.emId + this.vnId + this.cfId + this.roleId + this.afmRole;
		}

		if (this.sqlCondition) {
			txt += " " + getMessage("when") + " " + this.sqlCondition;
		}

		if (this.multipleRequired) {
			txt += ", " + getMessage("multipleRequired");
		}
		
		if(this.stepType == 'notification' && this.stepName !='Notification'){
			txt += ' ('+ SLA_getStepLocalizedName(this.basicStatus, this.stepType, this.stepName) + ')';
		}
		
		return txt;
	}
});