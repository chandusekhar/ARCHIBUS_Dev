var projAddOrEditActionsMcController = View.createController('projAddOrEditActionsMc', {
	project_id : '',
	
	projAddOrEditActionsMcGrid_afterRefresh : function() {
		var controller = View.getOpenerView().controllers.get('projManageConsole');
		this.project_id = controller.project_id;
	},
	
	projAddOrEditActionsMcGrid_onApplyTemplate : function() {
		if (this.project_id != '') {
			var restriction = "project.is_template = 1";
			View.selectValue('', getMessage('applyTemplateViewTitle'), ['activity_log.activity_log_id'], 'project', ['project.project_id'], 
				['project.project_id','project.project_type','project.summary','project.description'], 
		        restriction, 'afterCopyToProject', false, true, '');
		}
	},
	
	projAddOrEditActionsMcForm_onCancelAction : function() {
		this.projAddOrEditActionsMcForm.setFieldValue('activity_log.status', 'CANCELLED');
		this.projAddOrEditActionsMcForm.save();
		this.projAddOrEditActionsMcForm.refresh();
		this.projAddOrEditActionsMcGrid.refresh();
	},
	
	projAddOrEditActionsMcForm_onStopAction : function() {
		this.projAddOrEditActionsMcForm.setFieldValue('activity_log.status', 'STOPPED');
		this.projAddOrEditActionsMcForm.save();
		this.projAddOrEditActionsMcForm.refresh();
		this.projAddOrEditActionsMcGrid.refresh();
	}
});

function afterCopyToProject(fieldName, selectedValue, previousValue)
{
	var controller = View.controllers.get('projAddOrEditActionsMc');
	try {
		var jobId = Workflow.startJob('AbCommonResources-ProjectService-copyTemplateProject', selectedValue, controller.project_id, false);
		View.openJobProgressBar(getMessage('progressMessage'), jobId, '', function(status) {
			controller.projAddOrEditActionsMcGrid.refresh(null);
		});
	} catch (e) {
	    Workflow.handleError(e);
	}	
}