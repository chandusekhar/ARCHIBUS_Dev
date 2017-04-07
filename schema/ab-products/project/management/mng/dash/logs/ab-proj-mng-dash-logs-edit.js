var projMngDashLogsEditController = View.createController('projMngDashLogsEdit',{	
	
	projMngDashLogsEditForm_onSelectAction : function() {
		var project_id = this.projMngDashLogsEditForm.getFieldValue('ls_comm.project_id');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.project_id', project_id);
		View.selectValue('projMngDashLogsEditForm', getMessage('selectActionTitle'), ['ls_comm.activity_log_id'], 'activity_log', ['activity_log.activity_log_id'], 
			['activity_log.activity_log_id','activity_log.wbs_id','activity_log.action_title','activity_log.project_id','activity_log.work_pkg_id'], 
		    restriction);
	}
});

