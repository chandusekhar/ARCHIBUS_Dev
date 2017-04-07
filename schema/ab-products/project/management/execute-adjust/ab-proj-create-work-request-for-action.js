var projCreateWorkRequestController = View.createController('projCreateWorkRequest', {
	projCreateWorkRequestColumnReport_onCreateRequest : function() {
		var projCreateWorkRequestColumnReport = View.panels.get('projCreateWorkRequestColumnReport');
		var activity_log_id = this.projCreateWorkRequestColumnReport.restriction['activity_log.activity_log_id'];
		var parameters = {'activity_log_id': activity_log_id, 'updatedRecordsRequired':false};
		var result = Workflow.callMethodWithParameters('AbProjectManagement-ProjectManagementService-createWorkRequestForAction', parameters);
		if (result.code == 'executed') {
			this.projCreateWorkRequestRequestGrid.refresh();
		} else {
			View.showMessage(result.code + " :: " + result.message);
		}
	}
});