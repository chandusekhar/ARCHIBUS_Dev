var projMngActsUpController = View.createController('projMngActsUp', {
	records: null,
	
	afterInitialDataFetch: function() {
		this.records = View.parameters.updateParameters.records;
		for (var i = 0; i < 6; i++) {
			this.projMngActsUp_form.getFieldElement('activity_log.status').options[i].setAttribute("disabled", "true");
		}
	},
	
	projMngActsUp_form_onSave : function() {
		var status = this.projMngActsUp_form.getFieldValue('activity_log.status');
		var pct_complete = this.projMngActsUp_form.getFieldValue('activity_log.pct_complete');
		var date_started = this.projMngActsUp_form.getFieldValue('activity_log.date_started');
		var date_completed = this.projMngActsUp_form.getFieldValue('activity_log.date_completed');
		var verified_by = this.projMngActsUp_form.getFieldValue('activity_log.verified_by');
		var date_verified = this.projMngActsUp_form.getFieldValue('activity_log.date_verified');
		View.openProgressBar(getMessage('msg_progress'));
		var numRecords = this.records.length;
		for (var i = 0; i < numRecords; i++) {
			View.updateProgressBar(i/numRecords);
			var activity_log_id = this.records[i].getValue('activity_log.activity_log_id');
			var restriction = new Ab.view.Restriction();
			restriction.addClause('activity_log.activity_log_id', activity_log_id);
			var record = this.projMngActsUpDs0.getRecord(restriction);
			var currentStatus = record.getValue('activity_log.status');
			var activityType = record.getValue('activity_log.activity_type');
			if (activityType == 'PROJECT - CHANGE ORDER' && (currentStatus == 'REJECTED' || currentStatus == 'REQUESTED') ) continue;
			if (status != '') record.setValue('activity_log.status', status);
			if (pct_complete != '') record.setValue('activity_log.pct_complete', pct_complete);
			if (date_started != '' || date_completed != '') {			
				if (date_started == '') {
					var date = record.getValue('activity_log.date_started');
					if (date) date_started = FormattingDate(date.getDate(), date.getMonth() + 1, date.getFullYear(), 'YYYY-MM-DD');
				}
				if (date_completed == '') {
					var date = record.getValue('activity_log.date_completed');
					if (date) date_completed = FormattingDate(date.getDate(), date.getMonth() + 1, date.getFullYear(), 'YYYY-MM-DD');
				}
				if (date_started != '' && date_completed != '') {
					if (date_started > date_completed) date_completed = date_started;
					var days_per_week = getDaysPerWeek(activity_log_id);
					var duration_act = getActivityDuration(date_started, date_completed, days_per_week);
					record.setValue('activity_log.duration_act', duration_act);
				} else record.setValue('activity_log.duration_act', 0);
			}
			if (date_started != '') record.setValue('activity_log.date_started', date_started);
			if (date_completed != '' && record.getValue('activity_log.date_completed') == '') record.setValue('activity_log.date_completed', date_completed);
			if (verified_by != '') record.setValue('activity_log.verified_by', verified_by);
			if (date_verified != '') record.setValue('activity_log.date_verified', date_verified);
			this.projMngActsUpDs0.saveRecord(record);
		}
		if (View.parameters.callback) {
			View.parameters.callback();
		}
		View.closeProgressBar();
		View.closeThisDialog();
	}
});

function statusListener() {
	var controller = View.controllers.get('projMngActsUp');
	var date = new Date();
	var currentDate = FormattingDate(date.getDate(), date.getMonth() + 1, date.getFullYear(), 'YYYY-MM-DD');
	var status = controller.projMngActsUp_form.getFieldValue('activity_log.status');
	if (status == 'COMPLETED') {
		controller.projMngActsUp_form.setFieldValue('activity_log.pct_complete', 100);
		//controller.projMngActsUp_form.setFieldValue('activity_log.date_completed', currentDate);
	}
	else if (status == 'COMPLETED-V') {
		controller.projMngActsUp_form.setFieldValue('activity_log.pct_complete', 100);
		controller.projMngActsUp_form.setFieldValue('activity_log.date_verified', currentDate);
		controller.projMngActsUp_form.setFieldValue('activity_log.verified_by', View.user.employee.id);
	}
	else if (status == 'CLOSED') {
		controller.projMngActsUp_form.setFieldValue('activity_log.pct_complete', 100);
	}
}

function verifyEndAfterStart(formId) {
	var form = View.panels.get(formId);
	var date_started = form.getFieldValue('activity_log.date_started');
	var date_completed = form.getFieldValue('activity_log.date_completed');
	if (date_started != '' && date_completed != '' && date_completed < date_started) {
		form.setFieldValue('activity_log.date_completed', date_started);
	}
}