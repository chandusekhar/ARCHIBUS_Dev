/**
 * Controller for SLA console events and handler.
 * 
 * Events: 
 * app:operation:express:sla:addNewSLA app:operation:express:sla:quickEditSLA 
 * app:operation:express:sla:copySLA 
 * app:operation:express:sla:editDetailsSLA 
 * app:operation:express:sla:refreshSLA
 */
View.createController('slaConsoleEvents', {

	/**
	 * Constructor.
	 */
	afterCreate : function() {
		this.on('app:operation:express:sla:addNewSLA', this.addNewSLA);
		this.on('app:operation:express:sla:quickEditSLA', this.quickEditSLA);
		this.on('app:operation:express:sla:copySLA', this.copySLA);
		this.on('app:operation:express:sla:editDetailsSLA', this.editDetailsSLA);
		this.on('app:operation:express:sla:deleteSLA', this.deleteSLA);
		this.on('app:operation:express:sla:splitGroup', this.splitGroup);
		this.on('app:operation:express:sla:showSLASummaryPopUp', this.showSLASummaryPopUp);
		this.on('app:operation:express:sla:refreshSLA', this.refreshSLA);
	},

	// ----------------------- Event handlers ----------------------------------
	/**
	 * Open quick edit window to add.
	 */
	addNewSLA : function(type) {
		// open quick edit window in addNew mode
		this.openQuickEditWindow(getMessage('addNewSLA'), 'addNew', null, type);

	},

	/**
	 * Open quick edit window to edit.
	 * 
	 * @param row
	 *            selected row
	 */
	quickEditSLA : function(row) {
		if (valueExistsNotEmpty(row) && row.getRecord().getValue('helpdesk_sla_response.workflow_name') == 'Multiple Priorities') {
			View.showMessage(getMessage("multiplePriority"));
			return;
		}
		// open quick edit window in edit mode
		this.openQuickEditWindow(getMessage('editSLA'), 'edit', row);
	},

	/**
	 * Open quick edit window to copy.
	 * 
	 * @param row
	 *            selected row
	 */
	copySLA : function(row) {
		// open quick edit window in copy mode
		this.openQuickEditWindow(getMessage('copySLA'), 'copy', row);
	},

	/**
	 * Open details window to edit.
	 * 
	 * @param row
	 *            selected row
	 */
	editDetailsSLA : function(row) {
		View.selectedSLA = this.createSlaModelFromRow(row);
		View.openDialog('ab-bldgops-sla-edit.axvw', null, false, {
			width : 1200,
			height : 900,
			collapsible : false,
			closeButton : false
		});
	},

	/**
	 * Delete given SLA.
	 * 
	 * @param rows
	 *            selected rows
	 */
	deleteSLA : function(rows) {
		var controller = this;
		View.confirm(getMessage("confirmDelete"), function(button) {
			if (button == 'yes') {
				try {
					// call common method to get records for delete WFR
					var records = controller.getRecordsForWFRFromGrouping(rows);
					Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-deleteRules', records);
					controller.trigger('app:operation:express:sla:refreshSLA');
				} catch (e) {
					Workflow.handleError(e);
				}
			}
		});
	},
	
	/**
	 * Split Group.
	 * KB3043660 - provide a way to split SLAs that have been grouped together
	 * 
	 * @param row
	 *            selected row
	 */
	splitGroup : function(row) {
		var grouping = row.getRecord().getValue('helpdesk_sla_request.grouping');
		try {
			Workflow.callMethod('AbBldgOpsHelpDesk-SLAService-splitGroup', parseInt(grouping));
			this.trigger('app:operation:express:sla:refreshSLA');
		} catch (e) {
			Workflow.handleError(e);
		}
	},

	/**
	 * Show SLA summary.
	 * 
	 * @param row
	 *            selected row
	 */
	showSLASummaryPopUp : function(row) {
		var selectedSLA = this.createSlaModelFromRow(row);
		this.trigger('app:operation:express:sla:showSlaSummary', selectedSLA);
		this.summaryForm.showInWindow({
			x : 10,
			y : 100,
			modal : true,
			height : 1200,
			width : 1200
		});
		this.summaryForm.parentSlaRow = row;
		this.summaryForm.actions.get('closeWindnow').show(true);
		
		//KB3043660 - provide a way to split SLAs that have been grouped together
		jQuery('#summary_form_customized_actions').removeClass('x-hide-display');
		if(this.isMultipleSlaInTheGrouping(row)){
			jQuery('#splitGroup').show();
		}else{
			jQuery('#splitGroup').hide();
		}
	},

	/**
	 * Refresh SLA grid list.
	 */
	refreshSLA : function() {
		// filter controller
		var filterContrller = View.controllers.get('slaFilter');
		
		//set default page index before refresh the sla grid
		this.slaList.addParameter('targetPage',1);

		// set grid datasource parameters from filter controller
		this.slaList.addParameter('requestFilterRes', filterContrller.requestFilterRes);
		this.slaList.addParameter('responseFilterRes', filterContrller.responseFilterRes);
		this.slaList.addParameter('workflowStepsFilterRes', filterContrller.workflowStepsFilterRes);

		// refresh grid
		this.slaList.refresh();
	},

	// ----------------------- Helper methods ----------------------------------

	/**
	 * Open quick edit form and set title.
	 * 
	 * @param title
	 *            quick edit window title
	 */
	openQuickEditWindow : function(title, mode, selectedRow,type) {
		jQuery('#quickEditForm_head').remove();

		// open quick edit window and reset title
		this.quickEditForm.refresh(null, true);
		this.quickEditForm.showInWindow({
			x : 10,
			y : 100,
			modal : true,
			width : 1200,
			height : 200,
			title : title
		});

		// set controller mode
		var quickEditController = View.controllers.get('quikEdit');
		quickEditController.mode = mode;
		quickEditController.selectedOnDemandWorkflowTemplate = null;
		quickEditController.selectedServiceTemplate = null;
		
		//set PM SLA, set the value of  helpdesk_sla_request.prob_type to 'PREVENTIVE MAINT'
		if(valueExistsNotEmpty(type) && type=='PM'){
			this.quickEditForm.setFieldValue('helpdesk_sla_request.prob_type', 'PREVENTIVE MAINT', null, false);
		}

		// set values to quick edit form
		if (valueExistsNotEmpty(selectedRow)) {
			this.quickEditForm.setFieldValue('helpdesk_sla_request.prob_type', selectedRow.getFieldValue('helpdesk_sla_request.prob_type'), null, false);
			this.quickEditForm.setFieldValue('helpdesk_sla_request.site_id', selectedRow.getFieldValue('helpdesk_sla_request.site_id'), null, false);
			this.quickEditForm.setFieldValue('helpdesk_sla_request.bl_id', selectedRow.getFieldValue('helpdesk_sla_request.bl_id'), null, false);
			this.quickEditForm.setFieldValue('helpdesk_sla_request.grouping', selectedRow.getFieldValue('helpdesk_sla_request.grouping'), null, false);
			this.quickEditForm.setFieldValue('helpdesk_sla_response.workflow_name', '');
			this.quickEditForm.setFieldValue('helpdesk_sla_response.service_name', '');
		}
		
		//for PM SLA, disable field helpdesk_sla_request.prob_type
		if(this.quickEditForm.getFieldValue('helpdesk_sla_request.prob_type') == 'PREVENTIVE MAINT'){
			this.quickEditForm.enableField('helpdesk_sla_request.prob_type',false);
			//hide add more button
			jQuery('#quickEditForm_helpdesk_sla_request\\.prob_type').siblings().hide();
		}else{
			this.quickEditForm.enableField('helpdesk_sla_request.prob_type',true);
			//show add more button
			jQuery('#quickEditForm_helpdesk_sla_request\\.prob_type').siblings().show();
		}
	},

	/**
	 * Create sla model from selected row.
	 * 
	 * @param row
	 *            selected row
	 */
	createSlaModelFromRow : function(row) {
		var sla = new Ab.operation.express.sla.ServiceLevelAgreements();
		var grouping = row.getRecord().getValue('helpdesk_sla_request.grouping');
		sla.loadByGrouping(grouping);
		return sla;
	},

	/**
	 * get records used for delete workflow rule
	 */
	getRecordsForWFRFromGrouping : function(rows) {
		// get grouping array from the selected rows or record
		var groupingArray = [];
		if (rows instanceof Array) {
			for ( var i = 0; i < rows.length; i++) {
				var row = rows[i];
				groupingArray.push(row['helpdesk_sla_request.grouping.raw']);
			}
		} else {
			groupingArray.push(rows.record['helpdesk_sla_request.grouping.raw']);
		}

		var records = [];
		for ( var i = 0; i < groupingArray.length; i++) {
			var grouping = groupingArray[i];
			var rules = View.dataSources.get('slaRquestDS').getRecords('helpdesk_sla_request.grouping=' + grouping);
			for ( var j = 0; j < rules.length; j++) {
				var record = {};
				record['helpdesk_sla_request.activity_type'] = rules[j].getValue('helpdesk_sla_request.activity_type');
				record['helpdesk_sla_request.ordering_seq'] = rules[j].getValue('helpdesk_sla_request.ordering_seq');
				records.push(record);
			}
		}

		return records;
	},
	
	/**
	 * Check is multiple SLAs in the grouping.
	 * 
	 * @param row
	 *            selected row
	 */
	isMultipleSlaInTheGrouping : function(row) {
		var grouping = row.getRecord().getValue('helpdesk_sla_request.grouping');
		return this.slaRquestDS.getRecords('grouping=' + grouping).length > 1
	},

});
