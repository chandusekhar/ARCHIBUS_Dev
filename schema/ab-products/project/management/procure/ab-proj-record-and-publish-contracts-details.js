var projRecordPublishContractsDetailsController = View.createController('projRecordPublishContractsDetails', {
	
	afterInitialDataFetch : function() {
		/* remove vn_id restriction */
		var record = this.projRecordPublishContractsDetailsForm.getRecord();
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.project_id', record.getValue('work_pkg_bids.project_id'));
		restriction.addClause('activity_log.work_pkg_id', record.getValue('work_pkg_bids.work_pkg_id'));
		this.projRecordPublishContractsDetailsActionsGrid.refresh(restriction);
		
		for (var i = 0; i < 6; i++) {
			this.projRecordPublishContractsDetailsForm.getFieldElement('work_pkg_bids.status').options[i].setAttribute("disabled", "true");
		}
	},
	
	projRecordPublishContractsDetailsForm_onSign : function(row, action) {
		this.projRecordPublishContractsDetailsForm.setFieldValue('work_pkg_bids.status', 'Contract Signed');
		this.projRecordPublishContractsDetailsForm.save()
		this.projRecordPublishContractsDetailsForm.refresh();
		var controller = View.getOpenerView().controllers.get('projRecordPublishContracts');
		controller.selectWorkPkgReport.refresh();
	}
});
