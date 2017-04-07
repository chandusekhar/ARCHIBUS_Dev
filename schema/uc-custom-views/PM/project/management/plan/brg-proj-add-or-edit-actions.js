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
				['project.project_id','project.project_type','project.summary','project.description'], 
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
	var parameters = 
	{
		'proj_id_template':selectedValue,
		'proj_id_destination':controller.project_id
	};
	var result = Workflow.callMethodWithParameters('AbCapitalBudgeting-CapitalProjectsService-copyTemplateActionsToProject',parameters);
	if (result.code == 'executed') {
		controller.projAddOrEditActionsGrid.refresh(null);
    } else   
    {
    	alert(result.code + " :: " + result.message);
  	}
	
}

/****************************************************************
 * Project Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval("project.status IN ('Approved','Approved-In Design')");
}