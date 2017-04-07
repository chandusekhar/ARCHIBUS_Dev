/**
 * Controller for the work request edit and approve.
 */
var wrEditApproveController = View.createController('wrEditApproveController', {

	/**
	 * Ab.operation.express.console.PriorityField
	 */
	priorityField : null,

	/**
	 * Indicate view initialized and have loaded data
	 */
	initializedCompleted : false,

	/**
	 * Fields that need call field after change event
	 */
	fieldsNeedCallAfterChange : null,

	/**
	 * Initial priorityField after view loaded
	 */
	afterViewLoad : function() {
		// Initial priorityField
		this.priorityField = new Ab.operation.express.console.PriorityField('revieweForm','approver');

		// Initial fieldsNeedCallAfterChange
		this.fieldsNeedCallAfterChange = new Ext.util.MixedCollection();
		this.fieldsNeedCallAfterChange.addAll({
			id : 'activity_log.site_id'
		}, {
			id : 'activity_log.bl_id'
		}, {
			id : 'activity_log.fl_id'
		}, {
			id : 'activity_log.rm_id'
		}, {
			id : 'activity_log.dv_id'
		}, {
			id : 'activity_log.dp_id'
		}, {
			id : 'activity_log.prob_type'
		}, {
			id : 'activity_log.eq_id'
		});
		
		this.revieweForm.fields.get('activity_log.prob_type').actions.get(0).command.commands[0].actionListener = afterSelectWorkRequestDetailsProblemtype;
	},

	/**
	 * Load the edit work request.
	 */
	afterInitialDataFetch : function() {
		// get the selected work request from opener controller
		var openerController = View.getOpenerView().controllers.get('opsConsoleWrListActionController');
		var selectedWrRecords = openerController.selectedWrRecordsForAction;

		// load the selected work request to the review form
		if (selectedWrRecords.length > 0) {

			// contract the restriction
			var wrId = selectedWrRecords[0].getValue('wr.wr_id');
			var stepCode = selectedWrRecords[0].getValue('wr.stepWaitingCode');
			var restriction = new Ab.view.Restriction();
			restriction.addClause('wr.wr_id', wrId, "=");
			restriction.addClause('wr_step_waiting.step_log_id', stepCode, '=');

			// refresh the review form
			this.revieweForm.refresh(restriction);
			var currentPriority = this.revieweForm.getFieldValue('activity_log.priority');

			// show priority fields
			this.priorityField.showPriority();

			// show current priority radio
			SLA_setPriority('revieweForm', 'revieweForm', currentPriority, "priorities");

			// set the view initialized
			this.initializedCompleted = true;
		}
	},
	
	/**
	 * Forward the Approve Step.
	 */
	revieweForm_onForward : function() {
		var record = {};
		record['wr.wr_id'] = this.revieweForm.getFieldValue('wr.wr_id');
		record['wr_step_waiting.step_log_id'] = this.revieweForm.getFieldValue('wr_step_waiting.step_log_id');
		View.forwardRecords = [record];
			
		this.forwardForm.setFieldValue('em.em_id','');
		this.forwardForm.showInWindow({
			x : 200,
			y : 200,
			modal : true,
			width : 500,
			height : 200
		});
	},

	/**
	 * Approve the work request.
	 */
	revieweForm_onApprove : function() {
		
		if(!this.revieweForm.canSave()){
			
			return;
			
		}
		
		var record = {};
		record['wr.activity_log_id'] = this.revieweForm.getFieldValue('activity_log.activity_log_id');
		record['wr.site_id'] = this.revieweForm.getFieldValue('activity_log.site_id');
		record['wr.bl_id'] = this.revieweForm.getFieldValue('activity_log.bl_id');
		record['wr.fl_id'] = this.revieweForm.getFieldValue('activity_log.fl_id');
		record['wr.rm_id'] = this.revieweForm.getFieldValue('activity_log.rm_id');
		record['wr.dv_id'] = this.revieweForm.getFieldValue('activity_log.dv_id');
		record['wr.dp_id'] = this.revieweForm.getFieldValue('activity_log.dp_id');
		record['wr.eq_id'] = this.revieweForm.getFieldValue('activity_log.eq_id');
		record['wr.description'] = this.revieweForm.getFieldValue('activity_log.description');
		record['wr.prob_type'] = this.revieweForm.getFieldValue('activity_log.prob_type');
		record['wr.priority'] = this.revieweForm.getFieldValue('activity_log.priority');

		try {
			// call WFR to save activtiy_log data
			Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-saveRequest', record);

			var comments = $('approve_comments').value;

			// call WFR to save work request data and approve the request
			record['wr.wr_id'] = this.revieweForm.getFieldValue('wr.wr_id');
			record['wr_step_waiting.step_log_id'] = this.revieweForm.getFieldValue('wr_step_waiting.step_log_id');
			Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-editAndApproveWorkRequest', record, comments);

			var openerView = View.getOpenerView();
			if (openerView) {
				var wrFilter = openerView.controllers.get('wrFilter');
				if (wrFilter) {
					wrFilter.wrFilter_onFilter();
				}
			}
			// close dialog
			View.closeThisDialog();
		} catch (e) {
			Workflow.handleError(e);
		}
	},

	/**
	 * Reject the work request.
	 */
	revieweForm_onReject : function() {
		try {
			var comments = $('approve_comments').value;
			
			//KB3021309 - Comments required when rejecting a request
			if(!valueExistsNotEmpty(comments)){
				View.showMessage(getMessage('noCommentsForReject'));
				return;
			}
			
			// call WFR to save work request data and approve the request
			var record = {};
			record['wr.wr_id'] = this.revieweForm.getFieldValue('wr.wr_id');
			record['wr.activity_type'] = 'SERVICE DESK - MAINTENANCE';
			record['wr_step_waiting.step_log_id'] = this.revieweForm.getFieldValue('wr_step_waiting.step_log_id');
			
			//if the schema not having rejected_step field, call the old WRF to reject work request and keep same as v21.3 
			if(!Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-checkSchemaExisting','helpdesk_step_log', 'rejected_step').value){
				Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-rejectWorkRequest', record, comments);
			}else{
				try {
					 var result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-getRejectReturnToOptions',parseInt(this.revieweForm.getFieldValue('wr.wr_id')));
					 var rejectToOptions = [];
					 if(result.code == 'executed'){
						rejectToOptions = eval('('+result.jsonExpression+')');
						record['wr_step_waiting.comments'] = comments;
						Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-rejectWorkRequestToPreviousStep', record, 'R',rejectToOptions[0].user_name);
					 }
					
				} catch (e) {
					Workflow.handleError(e);
					return;
				}
			}

			var openerView = View.getOpenerView();
			if (openerView) {
				var wrFilter = openerView.controllers.get('wrFilter');
				if (wrFilter) {
					wrFilter.wrFilter_onFilter();
				}
			}
			// close dialog
			View.closeThisDialog();
		} catch (e) {
			Workflow.handleError(e);
		}
	},
	
	/**
	 * Cancel the work request.
	 */
	revieweForm_onCancel : function() {
		var record = {};
		record['wr.activity_log_id'] = this.revieweForm.getFieldValue('activity_log.activity_log_id');
		record['wr.wr_id'] = this.revieweForm.getFieldValue('wr.wr_id');
		record['wr.activity_type'] = 'SERVICE DESK - MAINTENANCE';
		
		try {
			 Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-cancelWorkRequests', [record]);
			 var openerView = View.getOpenerView();
				if (openerView) {
					var wrFilter = openerView.controllers.get('wrFilter');
					if (wrFilter) {
						wrFilter.wrFilter_onFilter();
					}
				}
			// close dialog
			View.closeThisDialog();
		} catch (e) {
			Workflow.handleError(e);
		}

	},
	
	/**
	 * Re-query the sla and show priority radios after change field vale in fieldsNeedCallAfterChange.
	 */
	afterFieldValueChagne : function(fieldName) {
		if (this.initializedCompleted && this.fieldsNeedCallAfterChange.get(fieldName)) {
			// show priority fields
			this.priorityField.showPriority();
		}
	}

});

/**
 * Over write core API to make sure re-query the sla and show the priorities again after change any field values in the form.
 */
Ab.form.Field.prototype.afterChange = function() {
	wrEditApproveController.afterFieldValueChagne(this.getId());
}

/**
 * Action Listener after select Problem Type field.
 */
function afterSelectWorkRequestDetailsProblemtype(fieldName, selectedValue, previousValue) {
	var form = View.panels.get('revieweForm');
	form.setFieldValue("activity_log.priority", 1);
	form.setFieldValue('activity_log.prob_type', selectedValue);
	return false;
}