var projEstApproveChangeOrderController = View.createController('projEstApproveChangeOrder', {
	projEstApproveChangeOrderForm_onApprove : function() {
		var activity_log_id = this.projEstApproveChangeOrderForm.getFieldValue('activity_log.activity_log_id');
		var parameters = {'activity_log_id' : activity_log_id};
		var result = Workflow.callMethodWithParameters('AbProjectManagement-ProjectManagementService-approveChangeOrder', parameters);
		if (result.code == 'executed') {
			this.projEstApproveChangeOrderForm.setFieldValue('activity_log.status','SCHEDULED');
			this.projEstApproveChangeOrderForm.save();
			this.projEstApproveChangeOrderGrid.refresh();
			this.projEstApproveChangeOrderForm.closeWindow();
		} else {
			View.showMessage(result.code + " :: " + result.message);
		}	
	},
	projEstApproveChangeOrderForm_onReject : function() {
		this.projEstApproveChangeOrderForm.setFieldValue('activity_log.status','REJECTED');
		this.projEstApproveChangeOrderForm.save();
		this.projEstApproveChangeOrderGrid.refresh();
		this.projEstApproveChangeOrderForm.closeWindow();
	}
});