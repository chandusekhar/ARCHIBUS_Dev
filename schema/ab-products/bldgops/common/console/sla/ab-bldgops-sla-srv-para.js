/**
 * Controller for Service Parameters tab.
 */
View.createController('serviceParametersTab', {
	/**
	 * Current priority level
	 */
	currentPriorityLevel : null,

	/**
	 * Maps DOM events to event listeners. Each event is defined using the following format:
	 */
	events : {
		/**
		 * Event handler for click priority tab.
		 * 
		 * @param event
		 */
		'click .priorityLevelTab' : function(event) {
			if (this.requestTabs.selectedTabName == 'serviceParametersTab') {
				this.loadPriorityLevel(event.target.id.replace('priority_level_tab_', ''));
			}
		},
		
		/**
		 * Event handler for see Service contact details.
		 * 
		 * @param event
		 */
		"click #seeServContDetails" : 'seeServiceContractDetails',

		/**
		 * Event handler for save service template.
		 * 
		 * @param event
		 */
		"click #saveServiceTemplate" : 'saveServiceTemplate',

		/**
		 * Event handler for find service pre-fill.
		 * 
		 * @param event
		 */
		"click #findServicePreFill" : 'findServicePreFill',

		/**
		 * Event handler for rename service template.
		 * 
		 * @param event
		 */
		"click #renameServiceTemplate" : 'saveServiceTemplate',

		/**
		 * Event handler for remove service template.
		 * 
		 * @param event
		 */
		"click #removeServiceTemplate" : 'removeServiceTemplate',
		
		/**
		 * Event handler for check 24 hours service checkbox option.
		 * 
		 * @param event
		 */
		"click #wholeDayOpen" :  function(event) {
			this.setWholeDayOpen(event.target.checked);
		}

	},

	/**
	 * After view loaded, move standard field to customized element position.
	 */
	afterViewLoad : function() {
		jQuery('#serviceParametersForm_helpdesk_sla_response\\.interval_to_respond_labelCell').remove();
		jQuery('#serviceParametersForm_helpdesk_sla_response\\.interval_to_complete_labelCell').remove();
		jQuery('#serviceParametersForm_seeServContDetails_button_labelCell').remove();
		jQuery('#serv_window_days').parent().css('text-align','right').attr('colspan',2).prev().remove();
		jQuery('#allowWorkOnHoliday').parent().css('text-align','right').attr('colspan',2).prev().remove();
		
		jQuery('#serviceParametersForm_helpdesk_sla_response\\.serv_window_start_fieldCell').each(function(){
			this.onmouseover = null;
			this.onmouseout = null;
		});
		jQuery('#serviceParametersForm_helpdesk_sla_response\\.serv_window_end_fieldCell').each(function(){
			this.onmouseover = null;
			this.onmouseout = null;
		});
		
		jQuery('#serviceParametersForm_helpdesk_sla_response\\.serv_window_start').change(function(){
			if(jQuery('#StoredserviceParametersForm_helpdesk_sla_response\\.serv_window_start').val() == jQuery('#StoredserviceParametersForm_helpdesk_sla_response\\.serv_window_end').val()){
				jQuery('#wholeDayOpen').get(0).checked = true;
			}else{
				jQuery('#wholeDayOpen').get(0).checked = false;
			}
		});
		jQuery('#serviceParametersForm_helpdesk_sla_response\\.serv_window_end').change(function(){
			if(jQuery('#StoredserviceParametersForm_helpdesk_sla_response\\.serv_window_start').val() == jQuery('#StoredserviceParametersForm_helpdesk_sla_response\\.serv_window_end').val()){
				jQuery('#wholeDayOpen').get(0).checked = true;
			}else{
				jQuery('#wholeDayOpen').get(0).checked = false;
			}
		});
		
	},

	/**
	 * After controller created.
	 */
	afterCreate : function() {
		this.on('app:operation:express:sla:loadSLA', this.loadServiceParameters);
		this.on('app:operation:express:sla:loadServicePriorityLevel', this.loadPriorityLevel);
		this.on('app:operation:express:sla:afterShowSlaSummary', this.refreshSlaSummary);
	},
	
	/**
	 * Return to Console.
	 */
	serviceFormTopActionBar_onReturnToConsole : function() {
		SLA_returnToConsole();
	},
	
	/**
	 * Return to Console.
	 */
	serviceActions_onReturnToConsole : function() {
		SLA_returnToConsole();
	},
	
	/**
	 * Select Previous tab.
	 */
	serviceFormTopActionBar_onGoPreviousTab : function() {
		this.goPreviousTab();
	},

	/**
	 * Select Previous tab.
	 */
	serviceActions_onGoPreviousTab : function() {
		this.goPreviousTab();
	},
	
	/**
	 * Save SLA.
	 */
	serviceFormTopActionBar_onSave : function() {
		this.saveSLA();
	},

	/**
	 * Save SLA.
	 */
	serviceActions_onSave : function() {
		this.saveSLA();
	},
	
	/**
	 * Select Previous tab.
	 */
	goPreviousTab : function() {
		// update sla service parameters from interface
		this.updateServiceParameters();
		
		// Load first priority to workflow tab
		this.trigger('app:operation:express:sla:loadWorkflowPriorityLevel', 1);
		
		// go to previous tab
		this.requestTabs.selectTab('workflowTab');

		// show summary panel with new data
		var selectedSLA = View.controllers.get('editDetailsWizard').selectedSLA;
		this.trigger('app:operation:express:sla:showSlaSummary', selectedSLA);

	},

	/**
	 * Save SLA.
	 */
	saveSLA : function() {
		
		// update sla service parameters from interface
		this.updateServiceParameters();
		
		//validate form before saving
		if(this.validateForm()){
			var selectedSLA = View.controllers.get('editDetailsWizard').selectedSLA;
			
			// start the save sla job
            var jobId = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-startSaveSLAJob', selectedSLA).message;
            // open the progress bar and wait until the job is complete
            View.openJobProgressBar(getMessage('savingSla'), jobId, null, function(status) {
            	var slaList = View.getOpenerView().panels.get('slaList');
				slaList.addParameter('targetPage',1);
				slaList.refresh();
				View.closeThisDialog();
            }, null);
		}
	},
	
	/**
	 * Validate form values.
	 */
	validateForm : function() {
		try {
			this.checkServiceWindow();
		} catch (e) {
			View.showMessage(e.message);
			View.closeProgressBar();
			return false;
		}
		
		//KB3041778 - add validation for field helpdesk_sla_response.time_to_respond and time_to_complete before save template and save
		if(!this.serviceParametersForm.validateField("helpdesk_sla_response.time_to_respond")){
			return false;
		}
		if(!this.serviceParametersForm.validateField("helpdesk_sla_response.time_to_complete")){
			return false;
		}
		
		var validate = true;
		var responseParameters = View.controllers.get('editDetailsWizard').selectedSLA.responseParameters
		
		for(var i=0;i<responseParameters.length;i++){
			try {
				if(!responseParameters[i].manager){
					throw {message:getMessage('noManager')};
				}
				// check valid foreign keys for request parameters
				var result = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-checkValidForeignKeysForResponseParameters', responseParameters[i]);

			} catch (e) {
				View.closeProgressBar();
				validate = false;
				// load the first priority level response parameter to the interface
				this.loadPriorityLevel(i+1);
				View.showMessage(e.message);
				break;
			}
		}

		return validate;
		
	},
	
	/**
	 * Check service window.
	 */
  checkServiceWindow : function() {
		
	 if (document
				.getElementById("StoredserviceParametersForm_helpdesk_sla_response.serv_window_start").value != ""
				&& document
						.getElementById("StoredserviceParametersForm_helpdesk_sla_response.serv_window_end").value != "") {
			var startTime = document
					.getElementById("StoredserviceParametersForm_helpdesk_sla_response.serv_window_start").value;
			var endTime = document
					.getElementById("StoredserviceParametersForm_helpdesk_sla_response.serv_window_end").value;
			
			var start = new Date(startTime)
			var end = new Date(endTime)
			if(DateMath.before(end,start) && !jQuery('#wholeDayOpen').get(0).checked){
				throw {message:getMessage('startWindowLessThanEndWindow')};
			}
			
		} else{
			throw {message:getMessage('serviceWindowNotNull')};
		}

	},

	/**
	 * Load service parameter from the selected sla.
	 */
	loadServiceParameters : function(selectedSLA) {
		//this.loadPriorityLevel(1);
	},

	/**
	 * Load given priority level
	 */
	loadPriorityLevel : function(level) {
		// updata current priority level values before load other priority level
		if (this.currentPriorityLevel && this.currentPriorityLevel != level) {
			this.updateServiceParameters();
		}

		// store current priority level
		this.currentPriorityLevel = level;

		// get response parameter of the selected priority level
		var responseParameter = this.getResponseParameterByLevel(level);
		if (responseParameter) {
			// show service parameter values
			this.showFieldValues(responseParameter);
			// update summary panel
			this.trigger('app:operation:express:sla:switchSummaryPriorityLevelRadio', level);
		}
		
		//set current priority selected in the tab
		this.trigger('app:operation:express:sla:setSelectedCssForPriorityLevel', level);
	},

	/**
	 * Get response parameter by priority level.
	 */
	getResponseParameterByLevel : function(level) {
		var targetResponseParameter = null;
		_.each(View.controllers.get('editDetailsWizard').selectedSLA.responseParameters, function(responseParameter, index) {
			if (responseParameter.priorityLevel == level) {
				targetResponseParameter = responseParameter;
			}
		});

		return targetResponseParameter;
	},

	/**
	 * Show field values
	 */
	showFieldValues : function(responseParameter) {
		// set service window start time and end time
		this.serviceParametersForm.record.setValue('helpdesk_sla_response.serv_window_start',this.slaResponseDS.parseValue('helpdesk_sla_response.serv_window_start', responseParameter.servWindowStart, false));
		this.serviceParametersForm.record.setValue('helpdesk_sla_response.serv_window_end',this.slaResponseDS.parseValue('helpdesk_sla_response.serv_window_end', responseParameter.servWindowEnd, false));
		this.serviceParametersForm.fields.get('helpdesk_sla_response.serv_window_start').syncToUI();
		this.serviceParametersForm.fields.get('helpdesk_sla_response.serv_window_end').syncToUI();
		if(responseParameter.servWindowStart == responseParameter.servWindowEnd){
			jQuery('#wholeDayOpen').get(0).checked = true;
		}else{
			jQuery('#wholeDayOpen').get(0).checked = false;
		}

		// set time to response and complete
		this.serviceParametersForm.setFieldValue('helpdesk_sla_response.time_to_respond', responseParameter.timeToRespond == 0 ? '':responseParameter.timeToRespond);
		this.serviceParametersForm.setFieldValue('helpdesk_sla_response.interval_to_respond', responseParameter.intervalToRespond);
		this.serviceParametersForm.setFieldValue('helpdesk_sla_response.time_to_complete', responseParameter.timeToComplete == 0 ? '':responseParameter.timeToComplete);
		this.serviceParametersForm.setFieldValue('helpdesk_sla_response.interval_to_complete', responseParameter.intervalToComplete);

		// set contractor and service desk manager
		this.serviceParametersForm.setFieldValue('helpdesk_sla_response.servcont_id', responseParameter.contractId);
		this.serviceParametersForm.setFieldValue('helpdesk_sla_response.manager', responseParameter.manager);

		// set service window days
		var days = responseParameter.servWindoDays.split(",", 7);
		for ( var i = 0; i < 7; i++) {
			if (days[i] == 1) {
				var check = $("days" + i);
				check.checked = true;
			}
		}

		// set all work on holiday
		Ext.fly('allowWorkOnHoliday').dom.checked = responseParameter.allowWorkOnHoliday == 1 ? true : false;

		// set service summary
		Ext.fly('serviceName').update(responseParameter.serviceName);

		// show template actions if current priority is defined as service template
		if (responseParameter.serviceTemplate == '1') {
			Ext.fly('selectServicePrefillBlock').setDisplayed(false);
			Ext.fly('saveServicePrefillBlock').setDisplayed(false);
			Ext.fly('serviceTemplateSummaryBlock').setDisplayed(true);
		} else {
			// if not template, showing pre-fll and save as template action
			Ext.fly('selectServicePrefillBlock').setDisplayed(true);
			Ext.fly('saveServicePrefillBlock').setDisplayed(true);
			Ext.fly('serviceTemplateSummaryBlock').setDisplayed(false);
		}
	},

	/**
	 * Update service parameter from the interface.
	 */
	updateServiceParameters : function() {
		var form = this.serviceParametersForm;
		var responseParameter = this.getResponseParameterByLevel(this.currentPriorityLevel);

		// get service window start time and end time
		responseParameter.servWindowStart = form.getFieldValue('helpdesk_sla_response.serv_window_start');
		responseParameter.servWindowEnd = form.getFieldValue('helpdesk_sla_response.serv_window_end');

		// get time to response and complete
		var timeToRespond = form.getFieldValue('helpdesk_sla_response.time_to_respond');
		responseParameter.timeToRespond = valueExistsNotEmpty(timeToRespond) ? timeToRespond : 0;
		responseParameter.intervalToRespond = form.getFieldValue('helpdesk_sla_response.interval_to_respond');
		var timeToComplete = form.getFieldValue('helpdesk_sla_response.time_to_complete');
		responseParameter.timeToComplete = valueExistsNotEmpty(timeToComplete) ? timeToComplete : 0;
		responseParameter.intervalToComplete = form.getFieldValue('helpdesk_sla_response.interval_to_complete');

		// get contractor and service desk manager
		responseParameter.contractId = form.getFieldValue('helpdesk_sla_response.servcont_id');
		responseParameter.manager = form.getFieldValue('helpdesk_sla_response.manager');

		// set service window days
		var servWindoDays = '';
		for ( var i = 0; i < 7; i++) {
			if ($("days" + i).checked) {
				servWindoDays += ',1'
			} else {
				servWindoDays += ',0'
			}
		}
		responseParameter.servWindoDays = servWindoDays.substring(1);

		// set allow work on holiday
		responseParameter.allowWorkOnHoliday = Ext.fly('allowWorkOnHoliday').dom.checked;

		// set service summary and template
		if (responseParameter.serviceTemplate == 0) {
			responseParameter.serviceName = SLA_getAutoServiceName(responseParameter);
		}
	},

	/**
	 * Show sla summary.
	 */
	refreshSlaSummary : function(selectedSLA) {
		if(this.requestTabs.selectedTabName == 'serviceParametersTab') {
			jQuery('#summaryForm3').empty();
			jQuery('#summaryForm').clone().appendTo('#summaryForm3');
		}
	},
	
	/**
	 * See Service Contract Details. KB3043512 - Add button for Service Contract Code Details
	 */
	seeServiceContractDetails : function() {
		var serviceContract = View.panels.get('serviceParametersForm').getFieldValue('helpdesk_sla_response.servcont_id');
		if(serviceContract){
			var rest = new Ab.view.Restriction();
			rest.addClause('servcont.servcont_id', serviceContract);
			View.openDialog("ab-helpdesk-servcont-details.axvw", rest, false, 10, 10, 600, 400);
		}
	},

	/**
	 * Save Service template
	 */
	saveServiceTemplate : function() {
		this.updateServiceParameters();
		if(this.validateForm()){
			View.currentResponseParameter = this.getResponseParameterByLevel(this.currentPriorityLevel);
			View.openDialog('ab-bldgops-sla-def-service-template.axvw', null, false, {
				width : 600,
				height : 400,
				closeButton : false
			});
		}
	},

	/**
	 * find service template
	 */
	findServicePreFill : function() {
		View.preFillParentController = this;
		View.isSelectTemplateValue = true;
		
		View.openDialog('ab-bldgops-sla-srv-para-pre-fill.axvw', null, false, {
			title : getMessage('prefillService'),
			width : 1000,
			height : 600,
			closeButton : false
		});

	},

	/**
	 * After pre-fill the service parameters from template
	 */
	afterPreFillServiceTemplate : function(responseParameter) {
		var currentResponseParameter = this.getResponseParameterByLevel(this.currentPriorityLevel);
		currentResponseParameter.copyServiceParameters(responseParameter);
		this.loadPriorityLevel(this.currentPriorityLevel)
	},

	/**
	 * remove service template
	 */
	removeServiceTemplate : function() {
		this.updateServiceParameters();
		var responseParameter = this.getResponseParameterByLevel(this.currentPriorityLevel);
		responseParameter.serviceTemplate = '0';
		this.showFieldValues(responseParameter);
	},
	
	/**
	 * Set whole day open
	 */
	setWholeDayOpen : function(checked) {
		if(checked){
			// set service window start time and end time
			if(jQuery('#StoredserviceParametersForm_helpdesk_sla_response\\.serv_window_start').val() == ''){
				this.serviceParametersForm.record.setValue('helpdesk_sla_response.serv_window_start',this.slaResponseDS.parseValue('helpdesk_sla_response.serv_window_start', "00:00.00.000", false));
				this.serviceParametersForm.record.setValue('helpdesk_sla_response.serv_window_end',this.slaResponseDS.parseValue('helpdesk_sla_response.serv_window_end', "00:00.00.000", false));
			}else{
				this.serviceParametersForm.record.setValue('helpdesk_sla_response.serv_window_end',this.slaResponseDS.parseValue('helpdesk_sla_response.serv_window_end',
						jQuery('#StoredserviceParametersForm_helpdesk_sla_response\\.serv_window_start').val(), false));
			}
			
			this.serviceParametersForm.fields.get('helpdesk_sla_response.serv_window_start').syncToUI();
			this.serviceParametersForm.fields.get('helpdesk_sla_response.serv_window_end').syncToUI();
			
		}else{
			// set service window start time and end time
			this.serviceParametersForm.record.setValue('helpdesk_sla_response.serv_window_start',this.slaResponseDS.parseValue('helpdesk_sla_response.serv_window_start', "09:00.00.000", false));
			this.serviceParametersForm.record.setValue('helpdesk_sla_response.serv_window_end',this.slaResponseDS.parseValue('helpdesk_sla_response.serv_window_end', "17:00.00.000", false));
			this.serviceParametersForm.fields.get('helpdesk_sla_response.serv_window_start').syncToUI();
			this.serviceParametersForm.fields.get('helpdesk_sla_response.serv_window_end').syncToUI();
		}
	}

});
