var commActionsDocsContractController = View.createController('commActionsDocsContract', {
	project_id : '',
	activitytype : '',
	
	afterInitialDataFetch : function() {
		var restriction = this.commActionsDocsContractConsole.getFieldRestriction();
		this.activitytype = this.commActionsDocsContractConsole.getFieldValue('activity_log.activity_type');
		this.commActionsDocsContractGrid.refresh(restriction);
	},
	
	commActionsDocsContractConsole_onShow : function() {
		var restriction = getRestrictionFromConsole(this.commActionsDocsContractConsole);
		this.commActionsDocsContractProjGrid.refresh(restriction);
		this.commActionsDocsContractGrid.show(false);
	},
	
	commActionsDocsContractProjGrid_onSelectProjectId : function(row) {
		this.project_id = row.record['project.project_id.key'];
		var project_name = row.record['project.project_name'];
		var projectIdName = this.project_id;
		if (project_name) projectIdName += " - " + project_name;
		var restriction = this.commActionsDocsContractConsole.getFieldRestriction();
		restriction.addClause('project.project_id', this.project_id);
		this.commActionsDocsContractGrid.refresh(restriction);
		this.commActionsDocsContractGrid.show(true);
		this.commActionsDocsContractGrid.appendTitle(projectIdName);
	},
	
	commActionsDocsContractConsole_onClear : function() {
    	this.commActionsDocsContractConsole.clear();
	},
	
	commActionsDocsContractGrid_onAddNew : function() {
		var restriction = new Ab.view.Restriction();
    	restriction.addClause('project.project_id', this.project_id);
    	
        var controller = this;
        var dialog = View.openDialog('ab-comm-actions-with-docs-create.axvw', restriction, true, {
            closeButton: false,
            maximize: true,

            afterInitialDataFetch: function(dialogView) {
                var dialogController = dialogView.controllers.get('commActionsDocsCreate'); 
                dialogController.commActionsDocsCreateForm1.setFieldValue('activity_log.activity_type', controller.activitytype);
                dialogController.onCompleteForm = controller.commActionsDocCreate_onCompleteForm.createDelegate(controller);
            }
        });
	},
	
	 /**
     * Callback for Create New Action dialog.
     */
	commActionsDocCreate_onCompleteForm: function(dialogController) {
    	this.commActionsDocsContractGrid.refresh();
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
