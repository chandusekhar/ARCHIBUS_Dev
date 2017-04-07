var projGanttChartAddActionController = View.createController('projGanttChartAddAction', {
	
	afterInitialDataFetch: function() {
		var openerController = View.getOpenerView().controllers.get('projGanttChart');
		if (openerController.view_type == 'baseline') {
			this.projGanttChartAddActionForm.showField('activity_log.date_scheduled', false);
			this.projGanttChartAddActionForm.showField('activity_log.duration', false);
			this.projGanttChartAddActionForm.showField('activity_log.hours_est_design', false);
			this.projGanttChartAddActionForm.showField('activity_log.cost_est_design_exp', false);
			this.projGanttChartAddActionForm.showField('activity_log.cost_est_design_cap', false);
		}
		else {
			this.projGanttChartAddActionForm.showField('activity_log.date_planned_for', false);
			this.projGanttChartAddActionForm.showField('activity_log.duration_est_baseline', false);
			this.projGanttChartAddActionForm.showField('activity_log.hours_est_baseline', false);
			this.projGanttChartAddActionForm.showField('activity_log.cost_estimated', false);
			this.projGanttChartAddActionForm.showField('activity_log.cost_est_cap', false);
		}
		
		if (openerController.is_mc == true || openerController.is_stat == true) {
			this.projGanttChartAddActionForm.setFieldValue('activity_log.project_id', openerController.projectId);
			this.projGanttChartAddActionForm.enableField('activity_log.project_id', false);
		}
	},
	
    projGanttChartAddActionForm_onSave: function() {
		if (!this.projGanttChartAddActionForm.save()) return;
		var openerController = View.getOpenerView().controllers.get('projGanttChart');
		if (openerController.view_type == 'baseline') {
			this.projGanttChartAddActionForm.setFieldValue('activity_log.date_scheduled', this.projGanttChartAddActionForm.getFieldValue('activity_log.date_planned_for'));
			this.projGanttChartAddActionForm.setFieldValue('activity_log.duration', this.projGanttChartAddActionForm.getFieldValue('activity_log.duration_est_baseline'));
			this.projGanttChartAddActionForm.setFieldValue('activity_log.hours_est_design', this.projGanttChartAddActionForm.getFieldValue('activity_log.hours_est_baseline'));
		}
		if (!calculateActivityDateEnd('activity_log.date_planned_for', 'activity_log.date_planned_end', 'activity_log.duration_est_baseline')) return;
		if (!calculateActivityDateEnd('activity_log.date_scheduled', 'activity_log.date_scheduled_end', 'activity_log.duration')) return;
		
		if (!this.projGanttChartAddActionForm.save()) return;
		if (cascadeTaskDependencies(this.projGanttChartAddActionForm.getRecord())) this.projGanttChartAddActionForm.refresh();
		
		var openerController = View.getOpenerView().controllers.get('projGanttChart');
		openerController.refreshProjGanttChartPanel();
    }
});

function calculateActivityDateEnd(activity_from_date_field, activity_to_date_field, activity_duration_field) {
	var controller = View.controllers.get('projGanttChartAddAction');
	var id = controller.projGanttChartAddActionForm.getFieldValue('activity_log.activity_log_id');
	var days_per_week = getDaysPerWeek(id, View.getOpenerView().controllers.get('projGanttChart'));
	
	var startDateISO = controller.projGanttChartAddActionForm.getFieldValue(activity_from_date_field);
	startDateISO = adjustStartDateByDaysPerWeek(startDateISO, days_per_week);
	var duration = controller.projGanttChartAddActionForm.getFieldValue(activity_duration_field);
	var endDateISO = getDateEndForActivity(startDateISO, duration, days_per_week);
	controller.projGanttChartAddActionForm.setFieldValue(activity_from_date_field, startDateISO);
	controller.projGanttChartAddActionForm.setFieldValue(activity_to_date_field, endDateISO);
	return true;
}

function ganttChart_selValActionProjectId() {
	var controller = View.getOpenerView().controllers.get('projGanttChart');
	var restriction = new Ab.view.Restriction();
	var title = '';
	if (controller.view_type == 'baseline') {
		restriction.addClause('project.status', 'Requested');
		title = getMessage('projSelvalTitleBaseline');
	} else if (controller.view_type == 'design') {
		restriction.addClause('project.status', ['Approved', 'Approved-In Design'], 'IN');
		title = getMessage('projSelvalTitleDesign');
	} else {
		restriction.addClause('project.status', ['Approved', 'Approved-In Design', 'Issued-In Process', 'Issued-On Hold', 'Completed-Pending','Completed-Not Ver'], 'IN');
		title = getMessage('projSelvalTitleActive');
	}
	if (View.taskInfo.activityId == 'AbProjCommissioning') {
		restriction.addClause('project.project_type', 'COMMISSIONING');
	}
	View.selectValue({
    	formId: 'projGanttChartAddActionForm',
    	title: title,
    	fieldNames: ['activity_log.project_id'],
    	selectTableName: 'project',
    	selectFieldNames: ['project.project_id'],
    	visibleFieldNames: ['project.project_id','project.project_name','project.project_type','project.status','project.summary'],
    	restriction: restriction
    });
}