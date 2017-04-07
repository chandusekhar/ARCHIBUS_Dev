var projQuickContractsController = View.createController('projQuickContracts', {
    afterInitialDataFetch : function() {
        /* remove vn_id restriction */
        var record = this.projQuickContractsForm.getRecord();
        var restriction = new Ab.view.Restriction();
        restriction.addClause('activity_log.project_id', record.getValue('work_pkg_bids.project_id'));
        restriction.addClause('activity_log.work_pkg_id', record.getValue('work_pkg_bids.work_pkg_id'));
        this.projQuickContractsActionsGrid.refresh(restriction);
    },

    projQuickContractsForm_onSign : function(row, action) {
        /* Ensure that Contract Amount is greater than 0. */
        if (this.projQuickContractsForm.getFieldValue('work_pkg_bids.cost_contract') <= 0) {
            this.projQuickContractsForm.addInvalidField('work_pkg_bids.cost_contract', "Contract Cost Must Be Greater Than 0.00");
            View.showMessage("\"Amount - Contract\" must be greater than 0.00 before the contract can be signed.");
            return false;
        }

        this.projQuickContractsForm.setFieldValue('work_pkg_bids.status', 'Contract Signed');
        this.projQuickContractsForm.save()
        this.projQuickContractsForm.refresh();
        //var controller = View.getOpenerView().controllers.get('projRecordPublishContracts');
        //controller.selectWorkPkgReport.refresh();
    },

    autoApproveBid : function() {
        var record = this.projEnterBidsEdit_page1Form.getFieldValue();
        var project_id = this.projEnterBidsEdit_page1Form.getFieldValue('work_pkg_bids.project_id');
        var work_pkg_id = this.projEnterBidsEdit_page1Form.getFieldValue('work_pkg_bids.work_pkg_id');
        var vn_id = this.projEnterBidsEdit_page1Form.getFieldValue('work_pkg_bids.vn_id');
        var parameters = {
            "project_id": project_id,
            "work_pkg_id": work_pkg_id,
            "vn_id": vn_id
        };

        var result = Workflow.callMethodWithParameters('AbProjectManagement-ProjectManagementService-approveWorkPkgBid', parameters);
        if (result.code == 'executed')
        {
            return true;
        } else
        {
            View.showMessage(result.code + " :: " + result.message);
            return false;
        }
    }
});

function autoApproveBid() {
    projQuickContractsController.autoApproveBid();
}