var projRecordPublishContractsDetailsController = View.createController('projRecordPublishContractsDetails', {
    afterInitialDataFetch : function() {
        /* remove vn_id restriction */
        var record = this.projRecordPublishContractsDetailsForm.getRecord();
        var restriction = new Ab.view.Restriction();
        restriction.addClause('activity_log.project_id', record.getValue('work_pkg_bids.project_id'));
        restriction.addClause('activity_log.work_pkg_id', record.getValue('work_pkg_bids.work_pkg_id'));
        this.projRecordPublishContractsDetailsActionsGrid.refresh(restriction);
    },

    projRecordPublishContractsDetailsForm_onSign : function(row, action) {
        /* Ensure that Contract Amount is greater than 0. */
        if (this.projRecordPublishContractsDetailsForm.getFieldValue('work_pkg_bids.cost_contract') <= 0) {
            this.projRecordPublishContractsDetailsForm.addInvalidField('work_pkg_bids.cost_contract', "Contract Cost Must Be Greater Than 0.00");
            View.showMessage("\"Amount - Contract\" must be greater than 0.00 before the contract can be signed.");
            return false;
        }

        this.projRecordPublishContractsDetailsForm.setFieldValue('work_pkg_bids.status', 'Contract Signed');
        this.projRecordPublishContractsDetailsForm.save()
        this.projRecordPublishContractsDetailsForm.refresh();
        var controller = View.getOpenerView().controllers.get('projRecordPublishContracts');
        controller.selectWorkPkgReport.refresh();
    }
});
