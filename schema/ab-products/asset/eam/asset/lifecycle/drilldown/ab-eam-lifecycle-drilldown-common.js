/**
 * On click mo_eq row
 * @param context
 */
function onClickMoEqRow(context){
	var moId = context.restriction['mo_eq.mo_id'];
	var eqId = context.restriction['mo_eq.eq_id'];
	var childPanels = {
			'abEamLifecycleMo_list': new Ab.view.Restriction({'mo.mo_id': moId}),
			'abEamLifecycleMoEq_details': new Ab.view.Restriction({'mo_eq.eq_id': eqId})
	}
	
	
	View.openDialog('ab-eam-lifecycle-mo-eq-details.axvw', null, false, {
		width:800,
		height:600,
		closeButton:true,
		afterInitialDataFetch: function(dialogView){
			refreshPanels(dialogView, childPanels);
		}
	});
}

/**
 * On click mo_ta row
 * @param context
 */
function onClickMoTaRow(context){
	var moId = context.restriction['mo_ta.mo_id'];
	var taId = context.restriction['mo_ta.ta_id'];
	var childPanels = {
			'abEamLifecycleMo_list': new Ab.view.Restriction({'mo.mo_id': moId}),
			'abEamLifecycleMoTa_details': new Ab.view.Restriction({'mo_ta.ta_id': taId})
	}
	
	View.openDialog('ab-eam-lifecycle-mo-ta-details.axvw', null, false, {
		width:800,
		height:600,
		closeButton:true,
		afterInitialDataFetch: function(dialogView){
			refreshPanels(dialogView, childPanels);
		}
	});
}


/**
 * On click wr row.
 * @param context
 */
function onClickWrRow(context){
	var parentPanel = View.panels.get(context.command.parentPanelId);
	var selectedRow = parentPanel.gridRows.get(parentPanel.selectedRowIndex);
	var workOrderId = selectedRow.getFieldValue('wrhwr.wo_id');
	var workReqId = selectedRow.getFieldValue('wrhwr.wr_id');
	var childPanels = {
			'abEamLifecycleWo_list': new Ab.view.Restriction({'wohwo.wo_id': workOrderId}),
			'abEamLifecycleWr_details': new Ab.view.Restriction({'wrhwr.wr_id': workReqId})
	}
	
	View.openDialog('ab-eam-lifecycle-wr-details.axvw', null, false, {
		width:800,
		height:600,
		closeButton:true,
		afterInitialDataFetch: function(dialogView){
			refreshPanels(dialogView, childPanels);
		}
	});
}

/**
 * On click activity_log row
 * @param context
 */
function onClickActivityLogRow(context){
	var parentPanel = View.panels.get(context.command.parentPanelId);
	var selectedRow = parentPanel.gridRows.get(parentPanel.selectedRowIndex);
	var projectId = selectedRow.getFieldValue('activity_log.project_id');
	var activityLogId = selectedRow.getFieldValue('activity_log.activity_log_id');
	var childPanels = {
			'abEamLifecycleProject_list': new Ab.view.Restriction({'project.project_id': projectId}),
			'abEamLifecycleActivityLog_details': new Ab.view.Restriction({'activity_log.activity_log_id': activityLogId})
	}
	
	View.openDialog('ab-eam-lifecycle-activity-log-details.axvw', null, false, {
		width:800,
		height:600,
		closeButton:true,
		afterInitialDataFetch: function(dialogView){
			refreshPanels(dialogView, childPanels);
		}
	});
}

/**
 * On click hactivity_log row
 * @param context
 */
function onClickHActivityLogRow(context){
	var parentPanel = View.panels.get(context.command.parentPanelId);
	var selectedRow = parentPanel.gridRows.get(parentPanel.selectedRowIndex);
	var projectId = selectedRow.getFieldValue('hactivity_log.project_id');
	var activityLogId = selectedRow.getFieldValue('hactivity_log.activity_log_id');
	var childPanels = {
			'abEamLifecycleProject_list': new Ab.view.Restriction({'project.project_id': projectId}),
			'abEamLifecycleActivityLog_details': new Ab.view.Restriction({'hactivity_log.activity_log_id': activityLogId})
	}
	
	View.openDialog('ab-eam-lifecycle-hactivity-log-details.axvw', null, false, {
		width:800,
		height:600,
		closeButton:true,
		afterInitialDataFetch: function(dialogView){
			refreshPanels(dialogView, childPanels);
		}
	});
}

/**
 * On click activity_log other row
 * @param context
 */
function onClickActivityLogOther(context) {
	var parentPanel = View.panels.get(context.command.parentPanelId);
	var selectedRow = parentPanel.gridRows.get(parentPanel.selectedRowIndex);
	var activityLogId = selectedRow.getFieldValue('activity_log.activity_log_id');
	var projectId = selectedRow.getFieldValue('activity_log.project_id');
	if (valueExistsNotEmpty(projectId)) {
		onClickActivityLogRow(context);
	} else {
		var restriction = new Ab.view.Restriction({'activity_log.activity_log_id': activityLogId});
		var detailsPanels = View.panels.get('abEamLifecycleActivityLog_other_details');
		detailsPanels.refresh(restriction);
		detailsPanels.showInWindow({
			width:800,
			height:600,
			closeButton:true
		});
	}
}

/**
 * On click hactivity_log other row
 * @param context
 */
function onClickHActivityLogOther(context) {
	var parentPanel = View.panels.get(context.command.parentPanelId);
	var selectedRow = parentPanel.gridRows.get(parentPanel.selectedRowIndex);
	var activityLogId = selectedRow.getFieldValue('hactivity_log.activity_log_id');
	var projectId = selectedRow.getFieldValue('hactivity_log.project_id');
	if (valueExistsNotEmpty(projectId)) {
		onClickHActivityLogRow(context);
	} else {
		var restriction = new Ab.view.Restriction({'hactivity_log.activity_log_id': activityLogId});
		var detailsPanels = View.panels.get('abEamLifecycleActivityLog_other_details');
		detailsPanels.refresh(restriction);
		detailsPanels.showInWindow({
			width:800,
			height:600,
			closeButton:true
		});
	}
}

/**
 * On click activity_log service desk row
 * @param context
 */
function onClickActivityLogServiceDesk(context) {
	var parentPanel = View.panels.get(context.command.parentPanelId);
	var selectedRow = parentPanel.gridRows.get(parentPanel.selectedRowIndex);
	var activityLogId = selectedRow.getFieldValue('activity_log.activity_log_id');
	var restriction = new Ab.view.Restriction({'activity_log.activity_log_id': activityLogId});
	var detailsPanels = View.panels.get('abEamLifecycleActivityLog_sd_details');
	detailsPanels.refresh(restriction);
	detailsPanels.showInWindow({
		width:800,
		height:600,
		closeButton:true
	});
}

/**
 * On click hactivity_log service desk row
 * @param context
 */
function onClickHActivityLogServiceDesk(context) {
	var parentPanel = View.panels.get(context.command.parentPanelId);
	var selectedRow = parentPanel.gridRows.get(parentPanel.selectedRowIndex);
	var activityLogId = selectedRow.getFieldValue('hactivity_log.activity_log_id');
	var restriction = new Ab.view.Restriction({'hactivity_log.activity_log_id': activityLogId});
	var detailsPanels = View.panels.get('abEamLifecycleActivityLog_sd_details');
	detailsPanels.refresh(restriction);
	detailsPanels.showInWindow({
		width:800,
		height:600,
		closeButton:true
	});
}


/**
 * Refresh parent and child panels
 * @param objView  view object
 * @param panels object with panel id and restriction
 */
function refreshPanels(objView, panels){
	for(var panel in panels){
		objView.panels.get(panel).refresh(panels[panel]);
	}
}

/**
 * On open project profile click action.
 * 
 * @param context command context
 */
function onOpenProjectProfile(context){
	var restriction = null;
	if(valueExists(context.restriction)){
		restriction = context.restriction;
		var panels = {
				'abEamLifecycleProject_list': restriction
		}
		
		View.openDialog('ab-proj-mng-dash-prof-edit.axvw', restriction, false, {
			width:800,
			height:600,
			closeButton:true,
			callback: function(){
				refreshPanels(View, panels);
			}
		});	
	}
}
