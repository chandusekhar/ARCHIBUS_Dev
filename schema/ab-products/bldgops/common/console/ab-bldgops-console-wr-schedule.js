/**
 * Controller for the work request schedule.
 */
View.createController('wrSchedule', {

	/**
	 * Show Complete Scheduling button only for required step.
	 */
	afterInitialDataFetch : function() {
		this.estimateInstructions.actions.get('completeScheduling').show(false);

		var openerController = View.getOpenerView().controllers.get('opsConsoleWrListActionController');
		var selectedWrRecords = openerController.selectedWrRecordsForAction;
		
		if(selectedWrRecords.length==1){
			this.wrtrGrid.showColumn('wrtr.wr_id', false);
			this.wrcfGrid.showColumn('wrcf.wr_id', false);
			this.wrtlGrid.showColumn('wrtl.wr_id', false);
			this.wrtrGrid.update();
		}

		for ( var i = 0; i < selectedWrRecords.length; i++) {

			var stepType = selectedWrRecords[i].getValue('wr.stepWaitingType');
			if (stepType == 'scheduling') {

				this.estimateInstructions.actions.get('completeScheduling').show(true);
				break;

			}
		}

		View.controllers.get('opsConsoleWrtrController').setReadOnly();

		var opsConsoleWrcfController = View.controllers.get('opsConsoleWrcfController');
		opsConsoleWrcfController.hideFields([ 'wrcf.date_start', 'wrcf.time_start', 'wrcf.date_end', 'wrcf.time_end' ]);
		opsConsoleWrcfController.wrcfGrid.actions.get('addCf').setTitle(getMessage('addCfActionTitle'));
		opsConsoleWrcfController.wrcfGrid.actions.get('addCf').command.commands[0].dialogTitle = getMessage('addCfFormTitle');

		var opsConsoleWrtlController = View.controllers.get('opsConsoleWrtlController');
		opsConsoleWrtlController.hideFields([ 'wrtl.date_start', 'wrtl.time_start', 'wrtl.date_end', 'wrtl.time_end' ]);
		opsConsoleWrtlController.wrtlGrid.actions.get('addTl').setTitle(getMessage('addTlActionTitle'));
		opsConsoleWrtlController.wrtlGrid.actions.get('addTl').command.commands[0].dialogTitle = getMessage('addTlFormTitle');

	},

	/**
	 * Complete scheduling when step is required
	 */
	estimateInstructions_onCompleteScheduling : function() {
		var openerController = View.getOpenerView().controllers.get('opsConsoleWrListActionController');
		var selectedWrRecords = openerController.selectedWrRecordsForAction;

		for ( var i = 0; i < selectedWrRecords.length; i++) {

			var wrId = selectedWrRecords[i].getValue('wr.wr_id');
			var stepCode = selectedWrRecords[i].getValue('wr.stepWaitingCode');
			if (stepCode) {
				var record = {};
				record['wr.wr_id'] = wrId;
				record['wr_step_waiting.step_log_id'] = stepCode;
				
				if(selectedWrRecords[i].getValue('wr.status') == 'Rej'){
					record['wr.status'] = selectedWrRecords[i].getValue('wr.rejectedStep').split(';')[0];
				}

				try {
					Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-completeScheduling', record);
				} catch (e) {
					Workflow.handleError(e);
				}
			}
		}

		var wrFilter = View.getOpenerView().controllers.get('wrFilter');
		if (wrFilter) {
			wrFilter.wrFilter_onFilter();
		}

		keepConsoleReqeustsSelectedAfterRefresh();

		View.closeThisDialog();
	},

	/**
	 * Forward to others
	 */
	estimateInstructions_onForward : function() {
		this.forwardForm.clear();
		var wrId = '';

		if (this.wrcfGrid.restriction.clauses[0].op == '=') {
			wrId = this.wrcfGrid.restriction.clauses[0].value;
		}

		this.forwardForm.showInWindow({
			x : 10,
			y : 100,
			modal : true,
			width : 600,
			height : 200,
			title : getMessage('forwordFormTitle') + ' ' + wrId
		});
	}

});