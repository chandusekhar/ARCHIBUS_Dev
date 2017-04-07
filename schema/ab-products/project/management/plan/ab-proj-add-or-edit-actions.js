var projAddOrEditActionsController = View.createController('projAddOrEditActions', {
	project_id : '',
	
	selectProjectReport_onSelectProjectId : function(row) {
		this.project_id = row.record['project.project_id.key'];
		var restriction = new Ab.view.Restriction();
		restriction.addClause('project.project_id', this.project_id);
		this.projAddOrEditActionsGrid.refresh(restriction);
		this.projAddOrEditActionsGrid.show(true);
		this.projAddOrEditActionsGrid.appendTitle(this.project_id);
	},
	
	projAddOrEditActionsGrid_onApplyTemplate : function() {
		if (this.project_id != '') {
			var restriction = "project.is_template = 1";
			View.selectValue('', getMessage('applyTemplateViewTitle'), ['activity_log.activity_log_id'], 'project', ['project.project_id'], 
				['project.project_id','project.project_name','project.project_type','project.summary','project.description'], 
		        restriction, 'afterCopyToProject', false, true, '');
		}
	},
	
	projAddOrEditActionsForm_onCancelAction : function() {
		this.projAddOrEditActionsForm.setFieldValue('activity_log.status', 'CANCELLED');
		this.projAddOrEditActionsForm.save();
		this.projAddOrEditActionsForm.closeWindow();
		this.projAddOrEditActionsGrid.refresh();
	},
	
	projAddOrEditActionsForm_onStopAction : function() {
		this.projAddOrEditActionsForm.setFieldValue('activity_log.status', 'STOPPED');
		this.projAddOrEditActionsForm.save();
		this.projAddOrEditActionsForm.closeWindow();
		this.projAddOrEditActionsGrid.refresh();
	}
});

function afterCopyToProject(fieldName, selectedValue, previousValue)
{
	var controller = View.controllers.get('projAddOrEditActions');
	try {
		var jobId = Workflow.startJob('AbCommonResources-ProjectService-copyTemplateProject', selectedValue, controller.project_id, false);
		View.openJobProgressBar(getMessage('progressMessage'), jobId, '', function(status) {
			controller.projAddOrEditActionsGrid.refresh(null);
		});
	} catch (e) {
	    Workflow.handleError(e);
	}
}

/****************************************************************
 * Project Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval("project.status IN ('Approved','Approved-In Design')");
}