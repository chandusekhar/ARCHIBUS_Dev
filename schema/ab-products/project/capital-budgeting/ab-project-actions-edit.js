var projectActionsEditController = View.createController('projectActionsEdit', {
	project_id : '',
	
	selectProjectReport_onSelectProjectId : function(row) {
		this.project_id = row.record['project.project_id.key'];
		var restriction = new Ab.view.Restriction();
		restriction.addClause('project.project_id', this.project_id);
		this.projectActionsEditGrid.refresh(restriction);
		this.projectActionsEditGrid.show(true);
		this.projectActionsEditGrid.appendTitle(this.project_id);
	},
	
	projectActionsEditGrid_onApplyTemplate : function() {
		if (this.project_id != '') {
			var restriction = new Ab.view.Restriction();
			restriction.addClause("project.is_template", 1);
			View.selectValue('', getMessage('applyTemplateViewTitle'), ['activity_log.activity_log_id'], 'project', ['project.project_id'], 
				['project.project_id','project.project_name','project.project_type','project.summary','project.description'], 
		        restriction, 'afterCopyToProject', false, true, '');
		}
	},
	
	projectActionsEditForm_beforeSave : function() {
		this.projectActionsEditForm.setFieldValue('activity_log.date_scheduled', this.projectActionsEditForm.getFieldValue('activity_log.date_planned_for'));
		this.projectActionsEditForm.setFieldValue('activity_log.duration', this.projectActionsEditForm.getFieldValue('activity_log.duration_est_baseline'));
		this.projectActionsEditForm.setFieldValue('activity_log.hours_est_design', this.projectActionsEditForm.getFieldValue('activity_log.hours_est_baseline'));
		return true;
	}
});

function afterCopyToProject(fieldName, selectedValue, previousValue)
{	
	var controller = View.controllers.get('projectActionsEdit');
	try {
		var jobId = Workflow.startJob('AbCommonResources-ProjectService-copyTemplateProject', selectedValue, controller.project_id, false);
		View.openJobProgressBar(getMessage('progressMessage'), jobId, '', function(status) {
			controller.projectActionsEditGrid.refresh(null);
		});
	} catch (e) {
	    Workflow.handleError(e);
	}	
}

/****************************************************************
 * Project Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval("project.status IN ('Created','Requested')");
}