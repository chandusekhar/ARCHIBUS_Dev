var projFcpmCpsPkgActUpController = View.createController('projFcpmCpsPkgActUp', {
	records: null,
	
	afterInitialDataFetch: function() {
		this.records = View.parameters.updateParameters.records;
		for (var i = 0; i < 7; i++) {
			this.projFcpmCpsPkgActUp_form.getFieldElement('activity_log.status').options[i].setAttribute("disabled", "true");
		}
	},
	
	projFcpmCpsPkgActUp_form_onSave : function() {
		var status = this.projFcpmCpsPkgActUp_form.getFieldValue('activity_log.status');
		if (status == 'CANCELLED' || status == 'REJECTED') {
			var message = '';
			if (status == 'CANCELLED') {
				message = getMessage('cancelledNotVisible');
			} else if (status == 'REJECTED') {
				message = getMessage('rejectedNotVisible');
			}
			var controller = this;
			View.confirm(message, function(button){
	            if (button == 'yes') {
	            	controller.saveActionRecords();
	            }
	            else {
	                
	            }
	        });
		} else this.saveActionRecords();
	},
	
	saveActionRecords: function() {
		var status = this.projFcpmCpsPkgActUp_form.getFieldValue('activity_log.status');
		var pct_complete = this.projFcpmCpsPkgActUp_form.getFieldValue('activity_log.pct_complete');
		var date_started = this.projFcpmCpsPkgActUp_form.getFieldValue('activity_log.date_started');
		var date_completed = this.projFcpmCpsPkgActUp_form.getFieldValue('activity_log.date_completed');
		var verified_by = this.projFcpmCpsPkgActUp_form.getFieldValue('activity_log.verified_by');
		var date_verified = this.projFcpmCpsPkgActUp_form.getFieldValue('activity_log.date_verified');
		for (var i = 0; i < this.records.length; i++) {
			var activity_log_id = this.records[i].getValue('activity_log.activity_log_id');
			var restriction = new Ab.view.Restriction();
			restriction.addClause('activity_log.activity_log_id', activity_log_id);
			var record = this.projFcpmCpsPkgActUpDs0.getRecord(restriction);
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
			if (date_completed != '') record.setValue('activity_log.date_completed', date_completed);
			if (verified_by != '') record.setValue('activity_log.verified_by', verified_by);
			if (date_verified != '') record.setValue('activity_log.date_verified', date_verified);
			this.projFcpmCpsPkgActUpDs0.saveRecord(record);
		}		
		var openerController = View.getOpenerView().controllers.get('projFcpmCpsPkgAct');
		openerController.projFcpmCpsPkgActGrid.refresh();
		View.closeThisDialog();
	}
});

function statusListener() {
	var controller = View.controllers.get('projFcpmCpsPkgActUp');
	var date = new Date();
	var currentDate = FormattingDate(date.getDate(), date.getMonth() + 1, date.getFullYear(), 'YYYY-MM-DD');
	var status = controller.projFcpmCpsPkgActUp_form.getFieldValue('activity_log.status');
	if (status == 'COMPLETED') {
		controller.projFcpmCpsPkgActUp_form.setFieldValue('activity_log.pct_complete', 100);
		controller.projFcpmCpsPkgActUp_form.setFieldValue('activity_log.date_completed', currentDate);
	}
	else if (status == 'COMPLETED-V' || status == 'CLOSED') {
		controller.projFcpmCpsPkgActUp_form.setFieldValue('activity_log.pct_complete', 100);
		controller.projFcpmCpsPkgActUp_form.setFieldValue('activity_log.date_completed', currentDate);
		controller.projFcpmCpsPkgActUp_form.setFieldValue('activity_log.date_verified', currentDate);
		controller.projFcpmCpsPkgActUp_form.setFieldValue('activity_log.verified_by', View.user.employee.id);
	}
}


function verifyEndAfterStart() {
	var form = View.panels.get('projFcpmCpsPkgActUp_form');
	var date_started = form.getFieldValue('activity_log.date_started');
	var date_completed = form.getFieldValue('activity_log.date_completed');
	if (date_started != '' && date_completed != '' && date_completed < date_started) {
		form.setFieldValue('activity_log.date_completed', date_started);
	}
}