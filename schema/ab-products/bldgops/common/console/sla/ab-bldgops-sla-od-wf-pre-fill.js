/**
 * Controller for workflow pre-fill.
 */
View.createController('workflowPreFill', {

	/**
	 * Response Parameter.
	 */
	responseParameter : null,

	/**
	 * Template Name.
	 */
	templateName : null,
	

	/**
	 * Maps DOM events to event listeners.
	 */
	events : {
		/**
		 * Event handler for click checkbox 'Use this workflow with different Dispatch'.
		 * 
		 * @param event
		 */
		"click #useDifferentDispatch" : function(event) {
			if(event.target.checked){
				
				Ext.fly('dispatchDiv').setDisplayed(true);
				
			}else{
				
				Ext.fly('dispatchDiv').setDisplayed(false);
				
			}
		},
		
		/**
		 * Event handler for click dispatch radio .
		 * 
		 * @param event
		 */
		"click input[name='dispatchRadio']" : function(event) {
			SLA_onChagneDispatchForm(this.dispatchForm,event)
		},
		
		/**
		 * Event handler for click action 'Add dispatch step'.
		 * 
		 * @param event
		 */
		"click #addDispatchStep" : function(event) {
			this.addDispatchStep();
		}

	},
	
	/**
	 * Constructor.
	 */
	afterCreate : function() {
		this.on('app:operation:express:sla:updateOptionalSteps', this.saveDispatchStep);
	},
	

	/**
	 * After view loaded, move standard field to customized element position.
	 */
	afterViewLoad : function() {
		SLA_moveFormField('dispatchForm', 'helpdesk_sla_response.work_team_id', 'workTeamCode');
		SLA_moveFormField('dispatchForm', 'helpdesk_sla_response.supervisor', 'supervisorCode');
		var isSelectTemplateValue = View.getOpenerView().isSelectTemplateValue;
		if(isSelectTemplateValue == false){
			var layout=View.getLayoutManager('nestedLayout_1');
			layout.collapseRegion('east');
		}
		
		SLA_getAllSlaSteps();
	},
	
	/**
	 * Hide dispatch form by default.
	 */
	afterInitialDataFetch : function() {
		this.dispatchForm.show(false);
	},

	/**
	 * Apply the selected pre-fill.
	 */
	workflowPreFillList_onSave : function() {
		if (this.responseParameter) {
			
			var controler = this;
			//get pararent pre-fill controller
			var parentWindowController = View.getOpenerView().preFillParentController;
			var isSelectTemplateValue = View.getOpenerView().isSelectTemplateValue;

			if (parentWindowController && isSelectTemplateValue) {
				
				var isOverWrite = confirm(getMessage("confirmOverWrite"));
				if (isOverWrite) {
					
					// set different dispatch
					var useDifferentDispatch = Ext.fly('useDifferentDispatch').dom.checked;
					if (useDifferentDispatch) {

						controler.responseParameter.workTeam = this.dispatchForm.getFieldValue('helpdesk_sla_response.work_team_id');
						controler.responseParameter.supervisor = this.dispatchForm.getFieldValue('helpdesk_sla_response.supervisor');
						
					}

					// call callback function in parent pre-fill contoller
					parentWindowController.afterPreFillWorkFlowTemplate(controler.responseParameter);
					
				}else{
					return;
				}
			}
			
			//for case: select value for work_summay field in filter and quick edit form
			var slaTemplateForm = View.getOpenerView().slaTemplateForm;
			var slaTemplateFieldId = View.getOpenerView().slaTemplateFieldId;
			if (slaTemplateForm && slaTemplateFieldId) {
				
				slaTemplateForm.setFieldValue(slaTemplateFieldId, controler.templateName, null, false);
				
			}

			//close current pop up
			View.closeThisDialog();
		} else {
			View.alert(getMessage('noTemplateSelected'))
		}
	},

	/**
	 * Show selected template in summary panel.
	 */
	workflowPreFillList_onShowTemplate : function(row) {
		this.templateName = row.getFieldValue('helpdesk_sla_response.workflow_name');
		this.responseParameter = this.getResponsParameterFromTemplate(this.templateName);

		Ext.fly('workflowSummary').update('');
		var workflowContent = SLA_getWorkflowContentForTemplate(this.responseParameter);
		View.templates.get('workflowSummaryTemplate').render(workflowContent, '#workflowSummary');
		jQuery('#workflowStep_closed').siblings().remove();

		var dashWorkflowContent = SLA_getDashWorkflowContentForTemplate(this.responseParameter);
		View.templates.get('dashWorkflowSummaryTemplate').render(dashWorkflowContent, '#workflowSummary');
		
		var workRequestsOnly = View.activityParameters['AbBldgOpsOnDemandWork-WorkRequestsOnly'];
		if(workRequestsOnly == '1'){
			jQuery('#workflowStep_aa').parent().hide();
		}
		
		var isSelectTemplateValue = View.getOpenerView().isSelectTemplateValue;
		if(isSelectTemplateValue == false){
			//do nothing
		}else{
			//show dispatch form
			this.dispatchForm.show(true);
			SLA_onChagneDispatchForm(this.dispatchForm);
			
			//hide Assign request to a dispatcher option if auto issue
			if(this.responseParameter.autoIssue || (workRequestsOnly == '0' && this.responseParameter.autoCreateWo) ){
				Ext.fly("dispatchToDispatcher").parent().setDisplayed(false);
				Ext.fly("addDispatchStep").parent().setDisplayed(false);
			}else{
				Ext.fly("dispatchToDispatcher").parent().setDisplayed(true);
				Ext.fly("addDispatchStep").parent().setDisplayed(true);
			}
		}
	},

	/**
	 * Show selected template in summary panel.
	 */
	getResponsParameterFromTemplate : function(templateName) {
		var responseParameter = new Ab.operation.express.sla.ResponseParameters();
		responseParameter.loadFromTemplate(templateName, 'workflow');
		return responseParameter;
	},
	

	/**
	 * Add dispatch step
	 */
	addDispatchStep : function() {
		var dispatchToDispatcher = Ext.fly('dispatchToDispatcher').dom.checked;
		var workflowSteps = this.responseParameter.workflowSteps;

		if (dispatchToDispatcher) {
			var workRequestsOnly = View.activityParameters['AbBldgOpsOnDemandWork-WorkRequestsOnly'];
			if (workRequestsOnly == '1') {
				// open edit step dialog to add new step
				this.trigger('app:operation:express:sla:addStep', 'AA', 'dispatch');
			}else{
				// open edit step dialog to add new step
				this.trigger('app:operation:express:sla:addStep', 'A', 'dispatch');
			}
			
		}
	},

	/**
	 * Save dispatch step
	 */
	saveDispatchStep : function(step) {
		if(valueExists(step)){
			var responseParameter = this.responseParameter;
			var workflowSteps = responseParameter.workflowSteps;

			// check if existing a dispatch step already
			var existing = false;
			for ( var i = 0; i < workflowSteps.length; i++) {
				var workflowStep = workflowSteps[i];
				if (workflowStep.basicStatus == 'A' && workflowStep.stepType == 'dispatch') {
					// update the existing dispatch step
					step.index = workflowStep.index;
					workflowStep = step;
					existing = true;
					break;
				}
			}

			// If not existing a dispatch step, add new step to the array
			if (!existing) {
				step.index = responseParameter.workflowSteps.length;
				responseParameter.workflowSteps.push(step);
			}
			
			//clear work team and supervisor
			responseParameter.workTeam = '';
			responseParameter.supervisor = '';
		} 
	}

});
