var projGanttChartProjectDialogController = View.createController('projGanttChartProjectDialog', {
    
    quest : null,
    
    afterInitialDataFetch : function() {
		var q_id = 'Project - ' + this.projGanttChartProjectDialogForm.getFieldValue('project.project_type');
		this.quest = new Ab.questionnaire.Quest(q_id, 'projGanttChartProjectDialogForm');
    },
    
    projGanttChartProjectDialogForm_onSave : function() {
    	this.projGanttChartProjectDialogForm.clearValidationResult();
    	var date_start = getDateObject(this.projGanttChartProjectDialogForm.getFieldValue('project.date_start'));//note that getFieldValue returns date in ISO format
    	var date_end = getDateObject(this.projGanttChartProjectDialogForm.getFieldValue('project.date_end'));
    	if (date_end < date_start) {
    		this.projGanttChartProjectDialogForm.addInvalidField('project.date_end', getMessage('endBeforeStart'));
    		this.projGanttChartProjectDialogForm.displayValidationResult('');
    		return;
    	}

    	if (!this.quest.beforeSaveQuestionnaire()) {
    		View.showMessage(getMessage('emptyRequiredFields'));
    		return;
    	}
    	if (!this.projGanttChartProjectDialogForm.save()) return;
    	var openerController = View.getOpenerView().controllers.get('projGanttChart');
    	var project_id = this.projGanttChartProjectDialogForm.getFieldValue('project.project_id');
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