var planScenarioCostsPage1Controller = View.createController('planScenarioCostsPage1', {
	project_id : '',
			
	afterInitialDataFetch : function() {
		this.planScenarioCostsScenariosTable.show(false);
		this.planScenarioCostsAddScenarioGrid.show(false);
	},
	
	planScenarioCostsScenariosTable_afterRefresh: function() {
		Ext.get('projscns.design_cost;planScenarioCostsScenariosTable_totals').dom.parentNode.parentNode.style.display = 'none';
		Ext.get('projscns.cost_scenario;planScenarioCostsScenariosTable_totals').dom.parentNode.parentNode.style.display = 'none';
	},
	
	planScenarioCostsConsole_onShow : function() {
		this.project_id = this.planScenarioCostsConsole.getFieldValue('project.project_id');
		if (this.project_id == '') {
			View.showMessage(getMessage('emptyRequiredFields'));
			return;
		}
		this.planScenarioCostsScenariosTable.addParameter('projectId', this.project_id);
		this.planScenarioCostsScenariosTable.refresh();
		this.planScenarioCostsScenariosTable.show(true);
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('project.project_id', this.project_id);
		var record = this.planScenarioCostsConsoleDs.getRecord(restriction);
		var project_name = record.getValue('project.project_name');
		var projectIdName = this.project_id;
		if (project_name) projectIdName += "-" + project_name;
		this.planScenarioCostsScenariosTable.appendTitle(projectIdName);
		
		this.planScenarioCostsScenariosTableDs.addParameter('projectId', this.project_id);
		var records = this.planScenarioCostsScenariosTableDs.getRecords();
		if (records.length == 0) this.planScenarioCostsScenariosTable_onAddScenario();
	},
	
	planScenarioCostsScenariosTable_onAddScenario : function() {
		this.planScenarioCostsAddScenarioGrid.addParameter('projectId', this.project_id);
		this.planScenarioCostsAddScenarioGrid.refresh();
		this.planScenarioCostsAddScenarioGrid.appendTitle(this.project_id);
		this.planScenarioCostsAddScenarioGrid.showInWindow({
			width: 600,
			height: 500
		});
	},
	
	planScenarioCostsAddScenarioGrid_onSelect : function() {
		var records = this.planScenarioCostsAddScenarioGrid.getSelectedRecords();
		for (i = 0; i < records.length; i++) {
			this.createScenarioItems(records[i].getValue('scenario.proj_scenario_id'));
		}
		this.planScenarioCostsScenariosTable.refresh();
		this.planScenarioCostsScenariosTable.show(true);
	},
	
	createScenarioItems: function(project_scenario_id) {
		var parameters = {
			'project_id':this.project_id,
			'project_scenario_id': project_scenario_id		
		};
		var result = Workflow.callMethodWithParameters('AbCapitalBudgeting-CapitalProjectsService-createScenarioItemsFromActivityLogs', parameters);
		if (result.code == 'executed') 
		{
			return true;
		} 
		else 
		{
			View.showMessage('error', result.code + " :: " + result.message);
			return false;
		}
	}
});

function planScenarioCostsScenariosTable_onClick(obj) {
	if (obj.restriction.clauses.length == 0) return;
	if (obj.restriction.clauses[0].name == 'projscns.fiscal_year') return;
	
	var controllerPage2 = View.controllers.get('planScenarioCostsPage2');
    controllerPage2.restrictScenarioItemsTable(obj);
    
    var tabPanel = View.panels.get('planScenarioCostsTabs');
    tabPanel.selectTab('planScenarioCostsPage2');    
}