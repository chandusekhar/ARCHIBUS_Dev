var projGanttChartWorkpkgDialogController = View.createController('projGanttChartWorkpkgDialog', {
	
    projGanttChartWorkpkgDialogForm_onSave : function() {
    	this.projGanttChartWorkpkgDialogForm.clearValidationResult();
    	var date_start = getDateObject(this.projGanttChartWorkpkgDialogForm.getFieldValue('work_pkgs.date_est_start'));//note that getFieldValue returns date in ISO format
    	var date_end = getDateObject(this.projGanttChartWorkpkgDialogForm.getFieldValue('work_pkgs.date_est_end'));
    	if (date_end < date_start) {
    		this.projGanttChartWorkpkgDialogForm.addInvalidField('work_pkgs.date_est_end', getMessage('endBeforeStart'));
    		this.projGanttChartWorkpkgDialogForm.displayValidationResult('');
    		return;
    	}
    	
    	if (!this.projGanttChartWorkpkgDialogForm.save()) return;
    	var openerController = View.getOpenerView().controllers.get('projGanttChart');
    	var project_id = this.projGanttChartWorkpkgDialogForm.getFieldValue('work_pkgs.project_id');
    	openerController.onCalcEndDatesForProject(project_id); // days_per_week field may have been changed; recalculate action end dates
		openerController.refreshProjGanttChartPanel();
		View.closeThisDialog();
    }
});

function getDateObject(ISODate)
{
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0],tempArray[1]-1,tempArray[2]);
}