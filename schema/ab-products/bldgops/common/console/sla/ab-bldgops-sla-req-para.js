/**
 * Controller for request parameter tab.
 */
var requestParaTabController = View.createController('requestParaTab', {

	events : {
		/**
		 * Event handler when click checkbox.
		 * 
		 * @param event
		 */
		'click :checkbox' : function(event) {
			if (event.target.value == 'useMultipleLevels') {
				this.useMultipleLevels(event.target.checked);
			}
		}
	},

	/**
	 * Constructor.
	 */
	afterCreate : function() {
		this.on('app:operation:express:sla:loadSLA', this.loadRequestParameters);
		this.on('app:operation:express:sla:setSelectedCssForPriorityLevel', this.setSelectedCssForPriorityLevel);
	},
	
	/**
	 * Set auto complete callback after view loaded.
	 */
	afterViewLoad : function() {
		//KB3042875 - set auto complete event listener to populate site_id after type room code and floor code
		var form = View.panels.get('requestParametersForm');
		form.addEventListener("onAutoCompleteSelect", this.onAutoCompleteSelect.createDelegate(this));
		form.fields.get('helpdesk_sla_request.fl_id').actions.get(0).command.commands[0].actionListener = afterSelectLocation;
		form.fields.get('helpdesk_sla_request.rm_id').actions.get(0).command.commands[0].actionListener = afterSelectLocation;
	},
	
	/**
	 * Event listener for autoComplete .
	 */
	onAutoCompleteSelect : function(form, fieldName, selectedValue) {
		if (fieldName == 'helpdesk_sla_request.bl_id') {
			var blId = selectedValue;
			this.setSiteBaseOnBl(blId);

		}
	},
	
	/**
	 * Set site in the form base on given building code .
	 */
	setSiteBaseOnBl : function(blId) {
		// if building and floor not empty
		if (valueExistsNotEmpty(blId)) {
			// query bl table
			var restriction = new Ab.view.Restriction();
			restriction.addClause("bl.bl_id", blId, '=');
			var records = this.siteQuerfyDS.getRecords(restriction);

			// return site_id from the record
			if (records.length > 0) {
				this.requestParametersForm.setFieldValue('helpdesk_sla_request.site_id', records[0].getValue('bl.site_id'));
			} else {
				this.requestParametersForm.setFieldValue('helpdesk_sla_request.site_id', '');
			}
		}
	},
	
	/**
	 * Return to Console.
	 */
	requestFormTopActionBar_onReturnToConsole : function() {
		SLA_returnToConsole();
	},

	/**
	 * Return to Console.
	 */
	requestParametersActions_onReturnToConsole : function() {
		SLA_returnToConsole();
	},
	
	/**
	 * Select next tab.
	 */
	requestFormTopActionBar_onGoNextTab : function() {
		this.goNextTab();

	},

	/**
	 * Select next tab.
	 */
	requestParametersActions_onGoNextTab : function() {
		this.goNextTab();

	},

	/**
	 * Select next tab.
	 */
	goNextTab : function() {
		View.openProgressBar(getMessage('validating'));
		// update sla request parameters from interface
		this.updateRequestParameters();
		
		View.updateProgressBar(1/3);
		
		if(this.validateForm()){
			// go to next tab
			this.requestTabs.selectTab('workflowTab');
			
			//get sla object
			var selectedSLA = View.controllers.get('editDetailsWizard').selectedSLA;

			// show priority level tabs
			this.showPriorityLevelTabs(selectedSLA);
			
			// Load first priority to workflow tab
			this.trigger('app:operation:express:sla:loadWorkflowPriorityLevel', 1);

			// show summary panel with new data
			this.trigger('app:operation:express:sla:showSlaSummary', selectedSLA);
		}

	},
	
	/**
	 * Validate form values.
	 */
	validateForm : function() {
		var selectedSLA = View.controllers.get('editDetailsWizard').selectedSLA;

		try {
			// check valid foreign keys for request parameters
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-checkValidForeignKeysForRequestParameters', selectedSLA.requestParameters);

		} catch (e) {
			View.closeProgressBar();
			View.showMessage(e.message);
			return false;
		}
		
		View.closeProgressBar();
		
		if(!this.validateMultiplePriorityLevels()){
			return false;
		}

		return true;
		
	},
	
	/**
	 * Validate multiple priority levels
	 */
	validateMultiplePriorityLevels : function() {
		if (Ext.fly(Ext.query("*[value=useMultipleLevels]")[0]).dom.checked) {
			var priorityLelvel1 = $('priority_level_1').value;
			var priorityLelvel2 = $('priority_level_2').value;
			var priorityLelvel3 = $('priority_level_3').value;
			var priorityLelvel4 = $('priority_level_4').value;
			var priorityLelvel5 = $('priority_level_5').value;
			
			if(!valueExistsNotEmpty(priorityLelvel1+priorityLelvel2+priorityLelvel3+priorityLelvel4+priorityLelvel5)){
				View.showMessage(getMessage('noPriorities'))
				return false;
			}
			
			for ( var i = 1; i <= 4; i++) {
				var priorityLelvel = $('priority_level_' + i).value;
				var nextPriorityLelvel = $('priority_level_' + (i+1)).value;
				if (!valueExistsNotEmpty(priorityLelvel) && valueExistsNotEmpty(nextPriorityLelvel)) {
					View.showMessage(getMessage('emptyPriorityLabel') + ' ' + i);
					return false;
				}
			}
		}
		
		return true;
	},
	
	/**
	 * Shows priority level tabs if more that one priority level input
	 */
	showPriorityLevelTabs : function(selectedSLA) {
		//clear the existing tabs before showing the current tabs
		if(Ext.fly('priorityLevelTabs_block')){
			Ext.fly('priorityLevelTabs_block').remove();
		}
		if (selectedSLA.responseParameters.length > 1) {
			var priorityLevelTabs = [];
			for ( var i = 0; i < selectedSLA.responseParameters.length; i++) {
				var responseParameter = selectedSLA.responseParameters[i];
				priorityLevelTabs.push({
					id : responseParameter.priorityLevel,
					label : responseParameter.priorityLevelLabel
				});
			}

			View.templates.get('priorityLevelTabTemplate').render({
				priorityLevels : priorityLevelTabs
			}, this.requestTabs.tabPanel.getTabEl(1).parentElement);
		}
	},
	
	/**
	 * Set selected css to given priority level
	 */
	setSelectedCssForPriorityLevel : function(level) {
		//Set CSS to indicate the given priority level are selected
		if (jQuery('#priorityLevelTabs_block').length > 0) {
			jQuery('.priorityLevelTab').removeClass('prioritySelected');
			jQuery('#priority_level_tab_' + level).addClass('prioritySelected');
		}
	},
	
	/**
	 * Load request parameter from the selected sla.
	 */
	loadRequestParameters : function(selectedSLA) {
		var requestParameters = selectedSLA.requestParameters;
		this.requestParametersForm.setFieldValue('helpdesk_sla_request.site_id', requestParameters.siteId, null, false);
		this.requestParametersForm.setFieldValue('helpdesk_sla_request.bl_id', requestParameters.blId, null, false);
		this.requestParametersForm.setFieldValue('helpdesk_sla_request.fl_id', requestParameters.flId, null, false);
		this.requestParametersForm.setFieldValue('helpdesk_sla_request.rm_id', requestParameters.rmId, null, false);
		this.requestParametersForm.setFieldValue('helpdesk_sla_request.requestor', requestParameters.requestor, null, false);
		this.requestParametersForm.setFieldValue('helpdesk_sla_request.em_std', requestParameters.emStd, null, false);
		this.requestParametersForm.setFieldValue('helpdesk_sla_request.dv_id', requestParameters.dvId, null, false);
		this.requestParametersForm.setFieldValue('helpdesk_sla_request.dp_id', requestParameters.dpId, null, false);
		this.requestParametersForm.setFieldValue('helpdesk_sla_request.prob_type', requestParameters.probType, null, false);
		this.requestParametersForm.setFieldValue('helpdesk_sla_request.eq_std', requestParameters.eqStd, null, false);
		this.requestParametersForm.setFieldValue('helpdesk_sla_request.eq_id', requestParameters.eqId, null, false);
		this.requestParametersForm.setFieldValue('helpdesk_sla_request.pmp_id', requestParameters.pmpId, null, false);

		_.each(selectedSLA.responseParameters, function(responseParameter, index) {
			$('priority_level_' + (index + 1)).value = responseParameter.priorityLevelLabel;
		});

		if (selectedSLA.responseParameters.length > 1) {
			this.showPriorityLevelFields(true);
		} else {
			this.showPriorityLevelFields(false);
		}

		if (selectedSLA.requestParameters.defaultPriority > 0) {
			Ext.fly(Ext.query("*[value=clientChoosePriority]")[0]).dom.checked = false;
		} else {
			Ext.fly(Ext.query("*[value=clientChoosePriority]")[0]).dom.checked = true;
		}
		
		//for PM SLA, disable field helpdesk_sla_request.prob_type, hide priority level fields
		if(this.requestParametersForm.getFieldValue('helpdesk_sla_request.prob_type') == 'PREVENTIVE MAINT'){
			this.requestParametersForm.enableField('helpdesk_sla_request.prob_type',false);
			//hide add more button
			jQuery('#requestParametersForm_helpdesk_sla_request\\.prob_type').siblings().hide();
			
			Ext.fly(Ext.query("*[value=useMultipleLevels]")[0]).parent().parent().parent().setDisplayed(false);
			this.requestParametersForm.showField('helpdesk_sla_request.pmp_id',true);
			Ext.fly('requestParametersForm_helpdesk_sla_request.pmp_id').parent().parent().setDisplayed(true);
			this.showPriorityLevelFields(false);
		}else{
			this.requestParametersForm.enableField('helpdesk_sla_request.prob_type',true);
			//show add more button
			jQuery('#requestParametersForm_helpdesk_sla_request\\.prob_type').siblings().show();
			
			Ext.fly('requestParametersForm_helpdesk_sla_request.pmp_id').parent().parent().setDisplayed(false);
		}
	},

	/**
	 * Update request parameter from the interface.
	 */
	updateRequestParameters : function() {
		var selectedSLA = View.controllers.get('editDetailsWizard').selectedSLA;
		var requestParameters = selectedSLA.requestParameters;
		requestParameters.siteId = this.requestParametersForm.getFieldValue('helpdesk_sla_request.site_id');
		requestParameters.blId = this.requestParametersForm.getFieldValue('helpdesk_sla_request.bl_id');
		requestParameters.flId = this.requestParametersForm.getFieldValue('helpdesk_sla_request.fl_id');
		requestParameters.rmId = this.requestParametersForm.getFieldValue('helpdesk_sla_request.rm_id');
		requestParameters.requestor = this.requestParametersForm.getFieldValue('helpdesk_sla_request.requestor');
		requestParameters.emStd = this.requestParametersForm.getFieldValue('helpdesk_sla_request.em_std');
		requestParameters.dvId = this.requestParametersForm.getFieldValue('helpdesk_sla_request.dv_id');
		requestParameters.dpId = this.requestParametersForm.getFieldValue('helpdesk_sla_request.dp_id');
		requestParameters.probType = this.requestParametersForm.getFieldValue('helpdesk_sla_request.prob_type');
		requestParameters.eqStd = this.requestParametersForm.getFieldValue('helpdesk_sla_request.eq_std');
		requestParameters.eqId = this.requestParametersForm.getFieldValue('helpdesk_sla_request.eq_id');
		requestParameters.pmpId = this.requestParametersForm.getFieldValue('helpdesk_sla_request.pmp_id');
		if (!Ext.fly(Ext.query("*[value=clientChoosePriority]")[0]).dom.checked) {
			requestParameters.defaultPriority = 1;
		} else {
			requestParameters.defaultPriority = 0;
		}

		var responseParameters = selectedSLA.responseParameters;
		selectedSLA.responseParameters = [];

		if (Ext.fly(Ext.query("*[value=useMultipleLevels]")[0]).dom.checked) {
			for ( var i = 1; i <= 5; i++) {
				var priorityLelvel = $('priority_level_' + i).value;
				if (priorityLelvel) {
					if (valueExists(responseParameters[i - 1])) {
						responseParameters[i - 1].priorityLevelLabel = priorityLelvel;
						selectedSLA.responseParameters.push(responseParameters[i - 1]);
					} else {
						var responseParameter = new Ab.operation.express.sla.ResponseParameters();
						responseParameter.priorityLevel = i;
						responseParameter.priorityLevelLabel = priorityLelvel;
						selectedSLA.responseParameters.push(responseParameter);
					}
				}
			}
		} else {
			if (valueExists(responseParameters[0])) {
				responseParameters[0].priorityLevelLabel = getMessage('defaultMessage');
				selectedSLA.responseParameters.push(responseParameters[0]);
			} else {
				var responseParameter = new Ab.operation.express.sla.ResponseParameters();
				responseParameter.priorityLevel = 1;
				responseParameter.priorityLevelLabel = getMessage('defaultMessage');
				selectedSLA.responseParameters.push(responseParameter);
			}
		}
	},

	/**
	 * Load request parameter from the selected sla.
	 */
	useMultipleLevels : function(isChecked) {
		this.showPriorityLevelFields(isChecked);
	},

	/**
	 * Load request parameter from the selected sla.
	 */
	showPriorityLevelFields : function(isShow) {
		Ext.fly(Ext.query("*[value=useMultipleLevels]")[0]).dom.checked = isShow;

		var clientChoosePriorityEl = Ext.fly(Ext.query("*[value=clientChoosePriority]")[0].parentElement);
		clientChoosePriorityEl.setDisplayed(isShow);

		var priorityLevelsRowEl = Ext.fly(Ext.query("#requestParametersForm_priority_levels_labelCell")[0].parentElement);
		priorityLevelsRowEl.setDisplayed(isShow);
	}

});


/**
 * Action Listener after select location fields.
 */
function afterSelectLocation(fieldName, selectedValue, previousValue) {
	
	// set site base on building code
	if (fieldName == 'helpdesk_sla_request.bl_id' && valueExistsNotEmpty(selectedValue)) {
		requestParaTabController.setSiteBaseOnBl(selectedValue);
	}
}