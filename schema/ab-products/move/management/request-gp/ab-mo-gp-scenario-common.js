var scenarioCommonController = View.createController('scenarioCommonController',{
	
	showMyMoveProjects: true,
	
	afterInitialDataFetch: function(){
		if(this.grid_ab_gr_select_review_pr_list
			&& View.taskInfo.processId == 'Move Scenario Planner') {
				var reqAndApprovedMovesRestriction = "((status like 'Requested%' AND status != 'Requested-Rejected') OR (status like 'Approved%' AND status != 'Approved-Cancelled'))";
				this.grid_ab_gr_select_review_pr_list.addParameter('moveTypes', reqAndApprovedMovesRestriction);
				this.grid_ab_gr_select_review_pr_list.refresh();
				this.grid_ab_gr_select_review_pr_list.setTitle(getMessage("reqAndApprovedTitle"));
		}
	},

	onShowMyMoveProjects: function(gridId){
		var grid = View.panels.get(gridId);
		
		grid.addParameter('userIsProjectManager',
				this.showMyMoveProjects ? "project.proj_mgr = '${user.employee.id}'" : "1=1");
		grid.refresh();
		grid.actions.get("showMyMoveProjects").setTitle(
				this.showMyMoveProjects ? getMessage("showAllMoveProjects") : getMessage("showMyMoveProjects"));
		
		this.showMyMoveProjects = !this.showMyMoveProjects;
	}
})

function setProject(row){
	var project_id = row.restriction['project.project_id'];
	var controller = View.controllers.get('tabsController');
	if(controller ==  null){
		controller = View.getOpenerView().controllers.get('tabsController');
	}
	var objTabs = controller.objTabs;
	if(controller.project_id != project_id){
		//we need to reset tabs 
		objTabs.setTabVisible('planScenario', false);
		objTabs.setTabVisible('reviewScenario', false);
	}
	controller.project_id = project_id;
	var restriction = new Ab.view.Restriction();
	restriction.addClause('mo_scenario_em.project_id', controller.project_id, '=');
	objTabs.setTabRestriction('selectScenario', restriction);
	
	//controller.objTabs.enableTab(controller.objTabs.getSelectedTabName(), false);
}

function setProjectNoScenarioTabs(row){
	var project_id = row.restriction['project.project_id'];
	var controller = View.controllers.get('tabsController');
	if(controller ==  null){
		controller = View.getOpenerView().controllers.get('tabsController');
	}
	controller.project_id = project_id;
}

function onNewProject(cmdContext) {
	var cmd = cmdContext.command;
	var objForm = cmd.getParentPanel();
	var project_id = objForm.getFieldValue('project.project_id');
	var controller = View.controllers.get('tabsController');
	if(controller ==  null){
		controller = View.getOpenerView().controllers.get('tabsController');
	}
	controller.project_id = project_id;
	controller.objTabs.enableTab(controller.objTabs.getSelectedTabName(), false);
}

function setScenario(row){
	var scenario_id = row.restriction['mo_scenario.scenario_id'];
	var controller = View.controllers.get('tabsController');
	if(controller ==  null){
		controller = View.getOpenerView().controllers.get('tabsController');
	}
	controller.scenario_id = scenario_id;
	var objTabs = controller.objTabs;
	objTabs.setTabVisible('planScenario', true);
	objTabs.setTabVisible('reviewScenario', true);
	

	var restriction = new Ab.view.Restriction();
	restriction.addClause('mo_scenario_em.project_id', controller.project_id, '=');
	restriction.addClause('mo_scenario_em.scenario_id', controller.scenario_id, '=');
	objTabs.setTabRestriction('planScenario', restriction);
	objTabs.setTabRestriction('reviewScenario', restriction);
	
	// we need to refresh planScenarioTab
	var planScenarioCtrl;
	if(View.controllers.get('abPlanMoveScenarioCtrl')){
		planScenarioCtrl = View.controllers.get('abPlanMoveScenarioCtrl');
	}else if(objTabs.findTab('planScenario').getContentFrame().View && objTabs.findTab('planScenario').getContentFrame().View.controllers.get('abPlanMoveScenarioCtrl')){
		planScenarioCtrl = objTabs.findTab('planScenario').getContentFrame().View.controllers.get('abPlanMoveScenarioCtrl');
	}
	if(planScenarioCtrl){
		planScenarioCtrl.project_id = controller.project_id;
		planScenarioCtrl.scenario_id = controller.scenario_id;
		planScenarioCtrl.afterInitialDataFetch();
	}
	return true;
}

/**
 * 	save a form from callFunction command
 * @param {Object} cmdData
 */
function onSaveForm(cmdContext){
	var cmd = cmdContext.command;
	var form = cmd.getParentPanel();
	var wfrId = form.saveWorkflowRuleId;
	if(form.canSave()){
		var record = new Ab.data.Record();
		form.fields.eachKey(function(key){
			var value = form.getFieldValue(key);
			if(!valueExistsNotEmpty(value)){
				value = '';
			}
			record.setValue(key, value);
		});
		try{
			var result = Workflow.callMethod(wfrId, record);
		}catch(e){
			Workflow.handleError(e);
			return false;
		}
	}else{
		return false;
	}
}
