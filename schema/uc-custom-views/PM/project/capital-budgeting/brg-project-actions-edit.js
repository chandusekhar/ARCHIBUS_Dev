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
			var restriction = "project.is_template = 1";
			View.selectValue('', getMessage('applyTemplateViewTitle'), ['activity_log.activity_log_id'], 'project', ['project.project_id'], 
				['project.project_id','project.project_type','project.summary','project.description'], 
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
	var parameters = 
	{
		'proj_id_template':selectedValue,
		'proj_id_destination':controller.project_id
	};
	var result = Workflow.callMethodWithParameters('AbCapitalBudgeting-CapitalProjectsService-copyTemplateActionsToProject',parameters);
	if (result.code == 'executed') {
		controller.projectActionsEditGrid.refresh(null);
    } else   
    {
    	alert(result.code + " :: " + result.message);
  	}
	
}

/****************************************************************
 * Project Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval("project.status IN ('Created','Requested')");
}