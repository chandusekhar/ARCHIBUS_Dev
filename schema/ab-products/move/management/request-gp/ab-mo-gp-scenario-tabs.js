var tabsController = View.createController('tabsController',{
	// selected project id
	project_id: null,
	// selected scenario id
	scenario_id: null,
	
	objTabs: null,
	
	afterViewLoad: function(){
		var haveScenarioTabs;

		// Request Group Move Tab
		if(View.panels.get('prtabs')){
			this.objTabs = View.panels.get('prtabs');
			haveScenarioTabs = true;
		}

		// Edit Group Move Tab
		if(View.panels.get('prEditTabs')){
			this.objTabs = View.panels.get('prEditTabs');
			haveScenarioTabs = true;
		}

		// Review and Estimate Group Move Tab
		if(View.panels.get('abGroupMoveReview_tabsFrame')){
			this.objTabs = View.panels.get('abGroupMoveReview_tabsFrame');
			haveScenarioTabs = true;
		}

		// Route Group Moves Tab - No Scenarios
		if(View.panels.get('abGroupMoveRoute_tabsFrame')){
			this.objTabs = View.panels.get('abGroupMoveRoute_tabsFrame');
			haveScenarioTabs = false;
		}

		// Issue Group Moves Tab
		if(View.panels.get('abGroupMoveIssue_tabsFrame')){
			this.objTabs = View.panels.get('abGroupMoveIssue_tabsFrame');
			haveScenarioTabs = true;
		}

		// Complete Group Moves Tab - No Scenarios
		if(View.panels.get('abGroupMoveComplete_tabsFrame')){
			this.objTabs = View.panels.get('abGroupMoveComplete_tabsFrame');
			haveScenarioTabs = false;
		}

		if(View.panels.get('abDevelopMoveScenarios_tabsFrame')){
			this.objTabs = View.panels.get('abDevelopMoveScenarios_tabsFrame');
			haveScenarioTabs = true;
		}
		
		if (this.objTabs != null) {
			this.objTabs.addEventListener('beforeTabChange', beforeTabChange);
			if (haveScenarioTabs == true) {
				this.objTabs.setTabVisible('planScenario', false);
				this.objTabs.setTabVisible('reviewScenario', false);
			}
		}
	}
})

function beforeTabChange(tabPanel, currentTabName, newTabName){
	var controller = View.controllers.get('tabsController');
	if(currentTabName == 'selectProject' || currentTabName == 'abGroupMoveReview_selectProject'
		|| currentTabName == 'page1' || currentTabName == 'abGroupMoveIssue_selectProject'
		|| currentTabName == 'abGroupMoveRoute_selectProject' || currentTabName == 'abGroupMoveComplete_selectProject'){
		if(!valueExistsNotEmpty(controller.project_id)){
			View.showMessage(getMessage('msg_no_project_id'));
			return false;
		}
	}

	if(newTabName == 'selectScenario'){
		var record = new Ab.data.Record({
			'mo_scenario.project_id':controller.project_id,
			'mo_scenario.scenario_id':'Scenario 1',
			'mo_scenario.planner':View.user.employee.id,
			'mo_scenario.description':'Scenario 1',
			'mo_scenario.comments':'',
			'mo_scenario.date_created':''
		}, true);
		try{
			var result = Workflow.callMethod('AbMoveManagement-MoveService-createMoveScenario', record, true);
		}catch(e){
			Workflow.handleError(e);
		}
		tabPanel.refreshTab(newTabName);
	}
	
	if(newTabName == 'planScenario' || newTabName == 'reviewScenario'){
		if(!valueExistsNotEmpty(controller.scenario_id)){
			View.showMessage(getMessage('msg_no_scenario_id'));
			return false;
		}
	}
	
	/* In case of click on "Initiate a New Request" action button in "Edit Group Move" form,
	 * must re-initialize the view
	 */
	if(currentTabName == 'page2' && newTabName == "page1"){
		controller.project_id = null;
		controller.scenario_id = null;
		controller.objTabs.setTabVisible('planScenario', false);
		controller.objTabs.setTabVisible('reviewScenario', false);
	}
	
	return true;
}