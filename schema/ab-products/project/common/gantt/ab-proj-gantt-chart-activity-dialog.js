var projGanttChartActivityDialogController = View.createController('projGanttChartActivityDialog', {
    days_per_week : 5,
    
    afterInitialDataFetch: function() {
		var openerController = View.getOpenerView().controllers.get('projGanttChart');
		this.setDaysPerWeek();
		if (openerController.view_type == 'baseline') {
			this.projGanttChartActivityDialogForm.showField('activity_log.date_scheduled', false);
			this.projGanttChartActivityDialogForm.showField('activity_log.date_scheduled_end', false);
			this.projGanttChartActivityDialogForm.showField('activity_log.duration', false);
			this.projGanttChartActivityDialogForm.showField('activity_log.hours_est_design', false);
			this.projGanttChartActivityDialogForm.showField('activity_log.cost_est_design_exp', false);
			this.projGanttChartActivityDialogForm.showField('activity_log.cost_est_design_cap', false);
		}
		else {
			this.projGanttChartActivityDialogForm.showField('activity_log.date_planned_for', false);
			this.projGanttChartActivityDialogForm.showField('activity_log.date_planned_end', false);
			this.projGanttChartActivityDialogForm.showField('activity_log.duration_est_baseline', false);
			this.projGanttChartActivityDialogForm.showField('activity_log.hours_est_baseline', false);
			this.projGanttChartActivityDialogForm.showField('activity_log.cost_estimated', false);
			this.projGanttChartActivityDialogForm.showField('activity_log.cost_est_cap', false);
		}
	},
	
	setDaysPerWeek: function() {
		var openerController = View.getOpenerView().controllers.get('projGanttChart');
		var id = this.projGanttChartActivityDialogForm.getFieldValue('activity_log.activity_log_id');
		this.days_per_week = getDaysPerWeek(id, openerController);
		$('projGanttChartActivityDialogForm_activity_log.days_per_week').innerHTML = this.days_per_week;
				
		var startDateISO = this.projGanttChartActivityDialogForm.getFieldValue(openerController.activity_from_date_field);
		var adjustedStartDate = adjustStartDateByDaysPerWeek(startDateISO, this.days_per_week);
		if (startDateISO != adjustedStartDate) {
			View.showMessage(getMessage("adjustingDates"));
			this.projGanttChartActivityDialogForm.setFieldValue(openerController.activity_from_date_field, adjustedStartDate);
		}
	},
    
    projGanttChartActivityDialogForm_onSave: function() {
		if (!this.projGanttChartActivityDialogForm.save()) return;
		var openerController = View.getOpenerView().controllers.get('projGanttChart');
		if (openerController.view_type == 'baseline') {
			this.projGanttChartActivityDialogForm.setFieldValue('activity_log.date_scheduled', this.projGanttChartActivityDialogForm.getFieldValue('activity_log.date_planned_for'));
			this.projGanttChartActivityDialogForm.setFieldValue('activity_log.duration', this.projGanttChartActivityDialogForm.getFieldValue('activity_log.duration_est_baseline'));
			this.projGanttChartActivityDialogForm.setFieldValue('activity_log.hours_est_design', this.projGanttChartActivityDialogForm.getFieldValue('activity_log.hours_est_baseline'));
		}
		this.projGanttChartActivityDialogForm.save();
		cascadeTaskDependencies(this.projGanttChartActivityDialogForm.getRecord());
		this.projGanttChartActivityDialogForm.refresh();
		
		openerController.refreshProjGanttChartPanel();
    },
    
    projGanttChartActivityDialogForm_onDeleteAction : function() {
    	var id = this.projGanttChartActivityDialogForm.getFieldValue('activity_log.activity_log_id');
    	var message = String.format(getMessage('confirmDeleteAction'), id);
    	var controller = this;
    	View.confirm(message, function(button) {
            if (button == 'yes') {
            	controller.projGanttChartActivityDialogForm.deleteRecord();
        		var openerController = View.getOpenerView().controllers.get('projGanttChart');
        		openerController.refreshProjGanttChartPanel();
        		View.closeThisDialog();
            }
    	});
	},
    
    projGanttChartActivityDialogForm_onCancelAction : function() {
		if (!this.projGanttChartActivityDialogForm.save()) return;
		this.projGanttChartActivityDialogForm.setFieldValue('activity_log.status', 'CANCELLED');
		this.projGanttChartActivityDialogForm.save();
		cascadeTaskDependencies(this.projGanttChartActivityDialogForm.getRecord());
		this.projGanttChartActivityDialogForm.refresh();
		
		var openerController = View.getOpenerView().controllers.get('projGanttChart');
		openerController.refreshProjGanttChartPanel();
	},
	
	projGanttChartActivityDialogForm_onStopAction : function() {
		if (!this.projGanttChartActivityDialogForm.save()) return;
		this.projGanttChartActivityDialogForm.setFieldValue('activity_log.status', 'STOPPED');
		this.projGanttChartActivityDialogForm.save();
		cascadeTaskDependencies(this.projGanttChartActivityDialogForm.getRecord());
		this.projGanttChartActivityDialogForm.refresh();
		
		var openerController = View.getOpenerView().controllers.get('projGanttChart');
		openerController.refreshProjGanttChartPanel();
	}
});

function calculateActivityDuration() {
	var openerController = View.getOpenerView().controllers.get('projGanttChart');
	var controller = View.controllers.get('projGanttChartActivityDialog');
	
	var startDateISO = controller.projGanttChartActivityDialogForm.getFieldValue(openerController.activity_from_date_field);
	var endDateISO = controller.projGanttChartActivityDialogForm.getFieldValue(openerController.activity_to_date_field);
	
	if (startDateISO != adjustStartDateByDaysPerWeek(startDateISO, controller.days_per_week) || endDateISO != truncateEndDateByDaysPerWeek(endDateISO, controller.days_per_week)) {
		View.showMessage(getMessage("adjustingDates"));
	}
	startDateISO = adjustStartDateByDaysPerWeek(startDateISO, controller.days_per_week);
	endDateISO = truncateEndDateByDaysPerWeek(endDateISO, controller.days_per_week);
	if (getDateObject(endDateISO) < getDateObject(startDateISO)) {
		endDateISO = startDateISO;
	}
	var duration = getActivityDuration(startDateISO, endDateISO, controller.days_per_week);
	controller.projGanttChartActivityDialogForm.setFieldValue(openerController.activity_from_date_field, startDateISO);
	controller.projGanttChartActivityDialogForm.setFieldValue(openerController.activity_to_date_field, endDateISO);
	controller.projGanttChartActivityDialogForm.setFieldValue(openerController.activity_duration_field, duration);
	return true;
}

function calculateActivityDateEnd() {
	var openerController = View.getOpenerView().controllers.get('projGanttChart');
	var controller = View.controllers.get('projGanttChartActivityDialog');
	
	var duration = controller.projGanttChartActivityDialogForm.getFieldValue(openerController.activity_duration_field);
	
	var startDateISO = controller.projGanttChartActivityDialogForm.getFieldValue(openerController.activity_from_date_field);
	startDateISO = adjustStartDateByDaysPerWeek(startDateISO, controller.days_per_week);
	var endDateISO = getDateEndForActivity(startDateISO, duration, controller.days_per_week);
	controller.projGanttChartActivityDialogForm.setFieldValue(openerController.activity_from_date_field, startDateISO);
	controller.projGanttChartActivityDialogForm.setFieldValue(openerController.activity_to_date_field, endDateISO);
}