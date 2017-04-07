/**
 * Opens the Communication Log Details pop-up window for the selected communication log.
 * @param commandContext
 */
function showCommLogDetails(commandContext){
	var restriction = new Ab.view.Restriction();
	
	if(commandContext.restriction['ls_comm.auto_number']){
		restriction.addClause('ls_comm.auto_number', commandContext.restriction['ls_comm.auto_number'], '=');
	} else if(commandContext.getParentPanel){
		var grid = commandContext.getParentPanel();
		var selGridRow = grid.gridRows.get(grid.selectedRowIndex);
		var autoNumber = selGridRow.getFieldValue("ls_comm.auto_number");
		if(valueExistsNotEmpty(autoNumber)){
			restriction.addClause('ls_comm.auto_number', autoNumber, '=');
		}
	}
	
	View.openDialog('ab-repm-lsadmin-comm-log-details.axvw', restriction, false);
}

/**
 * Opens the Add/Edit Communication Log pop-up window
 * @param newRecord Boolean indicator for new records
 * @param parentGridId The opener grid's id, the grid that is refreshed after changes are made in the pop-up window. 
 * @param commandContext Command context used to get the restriction.
 * @param disableFieldIds An array with fields id for filled by restriction and read only fields. 
 */
function openAddEditDialog(newRecord, parentGridId, commandContext, disableFieldIds){
	var parentGrid = View.panels.get(parentGridId);
	var restriction = commandContext.restriction;
	if(!restriction){
		restriction = parentGrid.restriction;
	}
	
	var newRestriction = new Ab.view.Restriction();
	
	if(restriction){
		if(valueExistsNotEmpty(disableFieldIds) && valueExistsNotEmpty(restriction.clauses)){
			var clause = null;
			for(var i=0; i < disableFieldIds.length; i++){
				clause = restriction.findClause(disableFieldIds[i]);
				if(valueExistsNotEmpty(clause)){
					newRestriction.addClause(clause.name, clause.value, clause.op);
				}
			}
		}else if(valueExistsNotEmpty(restriction.clauses)){
			var clause = restriction.findClause('ls_comm.auto_number');
			if(valueExistsNotEmpty(clause)){
				newRestriction.addClause(clause.name, clause.value, clause.op);
			}
		}else if(!valueExistsNotEmpty(restriction.clauses)){
			newRestriction = restriction;
		}
	}
	
	View.openDialog('ab-repm-lsadmin-comm-log-add-edit.axvw', newRestriction, newRecord, {
	    callback: function() {
	    	parentGrid.refresh(parentGrid.restriction);
	    },
	    disableFieldIds: disableFieldIds
	});
}

/**
 * After the activity log id is completed the project id field 
 * is automatically updated with the associated value.
 * @param context
 * @param controllerId
 * @param panelId
 */
function afterSelectActivityLogId(context, controllerId, panelId){
	var controller = View.controllers.get(controllerId);
	var panel = View.panels.get(panelId);
	
	var activityLogId = context.value;
	
	if(valueExistsNotEmpty(activityLogId)){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.activity_log_id',  activityLogId, '=');
		var record = controller.abRepmLsadminCommLogAddEdit_activityDs.getRecord(restriction);
		
		if(valueExistsNotEmpty(record.getValue("activity_log.activity_log_id"))){
			var projectId = record.getValue("activity_log.project_id");
			
			if(valueExistsNotEmpty(projectId)){
				panel.setFieldValue("ls_comm.project_id", projectId);
			}
		}else{
			View.showMessage(getMessage("invalidActivityLogId"));
			panel.setFieldValue("ls_comm.activity_log_id", "");
		}
	}
}

/**
 * Select value for Project.
 */
function selectProjectId(panelId) {
	var panel = View.panels.get(panelId);
	var restriction = '';
	// selecting an activity log id restrict the list of projects that can be selected,
	//useful for cases when activity log is not related to a project and this way avoid
	//assigning to the communication log an unrelated project (KB3036668)
	var activityLogId = panel.getFieldValue('ls_comm.activity_log_id');
	if(valueExistsNotEmpty(activityLogId)){
		restriction = "project.project_id IN (SELECT activity_log.project_id " +
        	"FROM activity_log " +
        	"WHERE activity_log.ls_id IS NOT NULL AND activity_log.activity_log_id=" + activityLogId + ")";
	}else{
		restriction = "project.project_id IN (SELECT activity_log.project_id " +
    		"FROM activity_log WHERE activity_log.ls_id IS NOT NULL)";
	}
    Ab.view.View.selectValue({
    			formId: panelId,
    			title: panel.fields.get("ls_comm.project_id").title,
    			fieldNames: ['ls_comm.project_id'],
    			selectTableName: 'project',
    			selectFieldNames: ['project.project_id'],
    			visibleFieldNames: ['project.project_id', 'project.summary', 'project.hierarchy_ids'],
    			restriction: restriction
    });
}
