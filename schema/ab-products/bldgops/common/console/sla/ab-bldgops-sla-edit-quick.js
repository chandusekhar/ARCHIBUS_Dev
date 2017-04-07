/**
 * Controller for SLA quick edit form.
 */
View.createController('quikEdit', {

	/**
	 * The selection mode of this view. Possible values: addNew|edit|copy
	 */
	mode : null,
	
	/**
	 * The selected On Demand Workflow template 
	 */
	selectedOnDemandWorkflowTemplate : null,
	
	/**
	 * The selected Service template 
	 */
	selectedServiceTemplate : null,

	// ----------------------- Event handlers ----------------------------------
	
	/**
	 * Set preFillParentController after view initialized.
	 */
	afterInitialDataFetch : function() {
		
		//used for select template pop up to call callback function
		View.preFillParentController = this;
		
	},

	/**
	 * Add new SLA or Edit SLA or Copy SLA.
	 */
	quickEditForm_onSaveSLA : function() {
		// get sla object
		var sla = this.getSlaObject();
		if(this.validateForm(sla)){
			// start the save sla job
            var jobId = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-startSaveSLAJob', sla).message;
            // open the progress bar and wait until the job is complete
            View.openJobProgressBar(getMessage('savingSla'), jobId, null, function(status) {
            	View.panels.get('quickEditForm').closeWindow();
            	var slaList = View.panels.get('slaList');
				slaList.addParameter('targetPage',1);
				slaList.refresh();
            }, null);
		}
	},
	
	/**
	 * Validate form values.
	 */
	validateForm : function(sla) {
		if (this.mode == 'addNew') {
			if(this.selectedOnDemandWorkflowTemplate == null){
				View.showMessage(getMessage('noWorkflowTemplate'));
				return false;
			}
			
			if(this.selectedServiceTemplate == null){
				View.showMessage(getMessage('noServiceTemplate'));
				return false;
			}
			
		}
		var validate = true;

		try {
			// check valid foreign keys for request parameters
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-checkValidForeignKeysForRequestParameters', sla.requestParameters);

		} catch (e) {
			View.closeProgressBar();
			View.showMessage(e.message);
			validate = false;
		}

		return validate;
		
	},

	/**
	 * Edit Details SLA.
	 */
	quickEditForm_onEditDetails : function() {
		View.selectedSLA = this.getSlaObject();
		View.openDialog('ab-bldgops-sla-edit.axvw', null, false, {
			width : 1200,
			height : 900,
			closeButton : false
		});

		this.quickEditForm.closeWindow();
	},

	/**
	 * Get Ab.operation.express.sla.ServiceLevelAgreements object.
	 */
	getSlaObject : function() {
		var sla = new Ab.operation.express.sla.ServiceLevelAgreements();
		if (this.mode == 'edit' || this.mode == 'copy') {
			// load parameters from grouping code
			var grouping = this.quickEditForm.getFieldValue('helpdesk_sla_request.grouping');
			sla.loadByGrouping(grouping);
			// clear template setting for copy mode
			if (this.mode == 'copy') {
				for ( var i = 0; i < sla.responseParameters.length; i++) {
					sla.responseParameters[i].workflowTemplate = 0;
					sla.responseParameters[i].serviceTemplate = 0;
				}
			}
		} else {
			// for new sla, set default response parameter
			var responseParameter = new Ab.operation.express.sla.ResponseParameters();
			sla.responseParameters.push(responseParameter);
		}

		// for addNew or copy mode, set the grouping to 0 which mean new sla
		if (this.mode != 'edit') {
			sla.requestParameters.grouping = 0;
		}

		// set values from interface
		sla.requestParameters.probType = this.quickEditForm.getFieldValue('helpdesk_sla_request.prob_type');
		sla.requestParameters.siteId = this.quickEditForm.getFieldValue('helpdesk_sla_request.site_id');
		sla.requestParameters.blId = this.quickEditForm.getFieldValue('helpdesk_sla_request.bl_id');
		//clear flId and rmId if blId is empty to avoid error when copy sla
		if(!valueExistsNotEmpty(sla.requestParameters.blId)){
			sla.requestParameters.flId = '';
			sla.requestParameters.rmId = '';
		}

		// if workflow template is not null, then load parameter from template
		if (this.selectedOnDemandWorkflowTemplate) {
			sla.responseParameters[0].copyWorkflowParameters(this.selectedOnDemandWorkflowTemplate);
		}

		// if service template is not null, then load parameter from template
		if (this.selectedServiceTemplate) {
			sla.responseParameters[0].copyServiceParameters(this.selectedServiceTemplate);
		}
		
		if (sla.responseParameters[0].workflowTemplate == 0) {
			sla.responseParameters[0].workflowName = SLA_getAutoWorkflowName(sla.responseParameters[0]);
		}
		
		// set workflow summary
		if (sla.responseParameters[0].workflowTemplate == 0) {
			sla.responseParameters[0].workflowName = SLA_getAutoWorkflowName(sla.responseParameters[0]);
		}
		
		// set service summary
		if (sla.responseParameters[0].serviceTemplate == 0) {
			sla.responseParameters[0].serviceName = SLA_getAutoServiceName(sla.responseParameters[0]);
		}

		return sla;
	},
	
	/**
	 * After pre-fill the workflow parameters from template
	 */
	afterPreFillWorkFlowTemplate : function(responseParameter) {
		this.selectedOnDemandWorkflowTemplate = responseParameter;
	},
	
	/**
	 * After pre-fill the service parameters from template
	 */
	afterPreFillServiceTemplate : function(responseParameter) {
		this.selectedServiceTemplate = responseParameter;
	}
});
