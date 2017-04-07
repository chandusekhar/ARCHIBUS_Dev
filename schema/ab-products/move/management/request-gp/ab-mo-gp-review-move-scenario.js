var abReviewMoveScenarioCtrl = View.createController('abReviewMoveScenarioCtrl',{
	parentController: null,
	afterViewLoad: function(){
		if(View.controllers.get('tabsController')){
			this.parentController = View.controllers.get('tabsController');
		}else if(View.getOpenerView().controllers.get('tabsController')){
			this.parentController = View.getOpenerView().controllers.get('tabsController');
		}
	},
	afterInitialDataFetch: function(){
		var restriction = new Ab.view.Restriction();
		if(valueExistsNotEmpty(this.parentController.project_id)){
			restriction.addClause('mo_scenario_em.project_id', this.parentController.project_id, '=');
		}
		if(valueExistsNotEmpty(this.parentController.scenario_id)){
			restriction.addClause('mo_scenario_em.scenario_id', this.parentController.scenario_id, '=');
		}
		this.list_abPlanMoveScenario.refresh(restriction);
		this.list_abPlanMoveScenario.setTitle(this.parentController.project_id + " - " + this.parentController.scenario_id);
	},
	list_abPlanMoveScenario_afterRefresh: function(){
		this.list_abPlanMoveScenario.setTitle(this.parentController.project_id + " - " + this.parentController.scenario_id);
	},
	list_abPlanMoveScenario_onUpdateProject: function(){
		View.openProgressBar(getMessage('saving'));
		var project_id = this.parentController.project_id;
		var scenario_id = this.parentController.scenario_id;
		try{
			var result = Workflow.callMethod('AbMoveManagement-MoveService-updateMoveProject', project_id, scenario_id);
			View.closeProgressBar();
			View.showMessage(getMessage("msg_project_updated")+" "+ scenario_id);
		}
		catch (e){
			View.closeProgressBar();
			Workflow.handleError(e);
		}
	}
})

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

