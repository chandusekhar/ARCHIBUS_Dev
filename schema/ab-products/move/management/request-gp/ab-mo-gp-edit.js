// ab-mo-group-edit2.js
//  enabled="${record['project.status'] == 'Created'}"

var moveProjectFormController = View.createController('moveProjectForm', {

    pr_form_afterRefresh : function() {
		var form = View.panels.get('pr_form');
		var project_id = form.getFieldValue('project.project_id');
		var restriction  = new Ab.view.Restriction();
		restriction.addClause('mo.project_id', project_id, '=');
		
		View.panels.get('emmo_list').refresh(restriction);
		View.panels.get('hiremo_list').refresh(restriction);
		View.panels.get('leavingmo_list').refresh(restriction);
		View.panels.get('assetmo_list').refresh(restriction);
		View.panels.get('rmmo_list').refresh(restriction);
		View.panels.get('eqmo_list').refresh(restriction);
		View.panels.get('abMoGroupListMoEq_list').refresh(restriction);
		View.panels.get('abMoGroupListMoTa_list').refresh(restriction);
		
		// hide "Initiate a New Request" if view not opened from Request a Group Move
		var groupTabs = View.parentTab.parentPanel;
		if(!groupTabs || groupTabs.id != "prtabs"){
			form.showElement(requestButtonNew, false);
		}
    }
});

// On Requesting a Group Move

function onRequest(cmdContext) {
	var form = cmdContext.command.getParentPanel();
	var project_id = form.getFieldValue('project.project_id');
	
	try {
		var result = Workflow.callMethod('AbMoveManagement-MoveService-requestGroupMove', project_id);
		form.enableButton('requestButton', false);
		$('project.status').value="Requested";
	}catch(e){
		Workflow.handleError(result);
	}
}

/**
 * Select the "Step 1: Initiate" tab
 * @param cmdContext
 */
function selectInitiateTab(cmdContext) {
	var groupTabs = View.parentTab.parentPanel;
	
	if(groupTabs){
		groupTabs.selectTab("page1", null, true);
	}
}

/**
 * used for paginated report as command function 
 * 
 * @param {Object} type - values 'group', 'single', 'scenario' 
 * @param {Object} commandObject
 */
function onPaginatedReport(type, commandObject){
	var panel = commandObject.getParentPanel();
	var projectId = "";
	var moveId = "";
	
	if(type == 'group'){
		projectId = panel.getFieldValue('project.project_id');
	}else if(type == 'single'){
		moveId = panel.getFieldValue('mo.mo_id');
	}else if(type == 'scenario'){
		var isAssigned = false;
		panel.gridRows.each(function(row){
			if(valueExistsNotEmpty(row.getRecord().getValue('mo_scenario_em.to_rm_id'))){
				isAssigned = true;
			}
		});
		if(panel.gridRows.length > 0 && isAssigned){
			var row = panel.gridRows.get(0);
			moveId = row.getRecord().getValue('mo_scenario_em.scenario_id');
			projectId = row.getRecord().getValue('mo_scenario_em.project_id');
		}else{
			View.showMessage(getMessage('error_no_data_rpt'));
			return;
		}
	}
	
	var result = Workflow.callMethod('AbMoveManagement-MoveService-onPaginatedReport', type, projectId, moveId);

    if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
		result.data = eval('(' + result.jsonExpression + ')');
		var jobId = result.data.jobId;
		var url = 'ab-paginated-report-job.axvw?jobId=' + jobId;
		View.openDialog(url);
	}
}

function selectDeptId(commandObject){
	var form = commandObject.getParentPanel();

	View.selectValue(form.id, getMessage('deptCode'),
					['project.dv_id','project.dp_id','dp.name'], 'dp', ['dp.dv_id','dp.dp_id','dp.name'], ['dp.dv_id','dp.dp_id','dp.name'],
					null, 'afterSelectDeptId');
}

function afterSelectDeptId(targetFieldName, selectedValue, previousValue) {
	if(targetFieldName != "dp.name")
		return true;
	
	View.panels.get('pr_form').setFieldValue("dp.name", selectedValue);
	
	return true;
}
