var commActionsDocsAllController = View.createController('commActionsDocsAll', {
	project_id : '',
	
	commActionsDocsAllConsole_onShow : function() {
		var restriction = getRestrictionFromConsole(this.commActionsDocsAllConsole);
		this.commActionsDocsAllProjGrid.refresh(restriction);
		this.commActionsDocsAllGrid.show(false);
	},
	
	commActionsDocsAllProjGrid_onSelectProjectId : function(row) {
		this.project_id = row.record['project.project_id.key'];
		var project_name = row.record['project.project_name'];
		var projectIdName = this.project_id;
		if (project_name) projectIdName += " - " + project_name;
		var restriction = this.commActionsDocsAllConsole.getFieldRestriction();
		restriction.addClause('project.project_id', this.project_id);
		this.commActionsDocsAllGrid.refresh(restriction);
		this.commActionsDocsAllGrid.show(true);
		this.commActionsDocsAllGrid.appendTitle(projectIdName);
	},
	
	commActionsDocsAllConsole_onClear : function() {
    	this.commActionsDocsAllConsole.clear();
	},
	
	commActionsDocsAllGrid_onAddNew : function() {
		var restriction = new Ab.view.Restriction();
    	restriction.addClause('project.project_id', this.project_id);
    	
        var controller = this;
        var dialog = View.openDialog('ab-comm-actions-with-docs-create.axvw', restriction, true, {
            closeButton: false,
            maximize: true,

            afterViewLoad: function(dialogView) {
                var dialogController = dialogView.controllers.get('commActionsDocsCreate');
                dialogController.onCompleteForm = controller.commActionsDocsCreate_onCompleteForm.createDelegate(controller);
            }
        });
	},
	
	 /**
     * Callback for Create New Action dialog.
     */
	commActionsDocsCreate_onCompleteForm: function(dialogController) {
    	this.commActionsDocsAllGrid.refresh();
    },
    
    commActionsDocsAllFormApprove_afterRefresh: function() {
    	this.commActionsDocsAllFormApprove.setFieldValue('activity_log.status', 'APPROVED');
    }
});

/****************************************************************
 * Project Restriction Console functions
 */

function getRestrictionFromConsole(form) {
	var restriction = ' 1=1 ';
	var activityString = "EXISTS (SELECT 1 FROM activity_log WHERE activity_log.project_id = project.project_id AND ";
	var blString = "EXISTS (SELECT 1 FROM bl WHERE bl.bl_id = project.bl_id AND ";
	
	if (form.getFieldValue('activity_log.project_id')) 
    	restriction += " AND project.project_id = '" + getValidValue(form.getFieldValue('activity_log.project_id')) + "'";
    if (form.getFieldValue('activity_log.work_pkg_id'))
    	restriction += " AND " + activityString + " activity_log.work_pkg_id = '" + getValidValue(form.getFieldValue('activity_log.work_pkg_id')) + "') ";
    if (form.getFieldValue('activity_log.activity_type')) 
    	restriction += " AND " + activityString + " activity_log.activity_type = '" + getValidValue(form.getFieldValue('activity_log.activity_type')) + "') ";
    if (form.getFieldValue('activity_log.bl_id'))
    	restriction += " AND project.bl_id = '" + getValidValue(form.getFieldValue('activity_log.bl_id')) + "' ";
	if (form.getFieldValue('project.site_id')) {
		restriction += " AND ((project.site_id = '" + getValidValue(form.getFieldValue('project.site_id')) + "') OR ";
		restriction += blString + "bl.site_id = '" + getValidValue(form.getFieldValue('project.site_id')) + "'))";
	}
	if (form.getFieldValue('project.proj_mgr'))
    	restriction += " AND project.proj_mgr = '" + getValidValue(form.getFieldValue('project.proj_mgr')) + "' ";
	return restriction;
}

function getValidValue(fieldValue)
{
	fieldValue = fieldValue.replace(/\'/g, "\'\'");
	return fieldValue;
}
