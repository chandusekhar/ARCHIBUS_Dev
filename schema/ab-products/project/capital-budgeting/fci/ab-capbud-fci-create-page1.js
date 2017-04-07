var capbudFciCreatePage1Controller = View.createController('capbudFciCreatePage1', {
	project_id : '',
	
	afterViewLoad: function() {
        this.capbudFciCreateScenariosTable.addEventListener('afterGetData', this.capbudFciCreateScenariosTable_afterGetData, this);
    },
    
    capbudFciCreateScenariosTable_afterGetData: function(panel, dataSet) {
    	dataSet.totals[0].localizedValues['actscns.avg_fci'] = '';
		dataSet.totals[0].localizedValues['actscns.funding_req'] = '';
		for (var c = 0; c < dataSet.columnSubtotals.length; c++) {
			dataSet.columnSubtotals[c].localizedValues['actscns.avg_fci'] = '';
			dataSet.columnSubtotals[c].localizedValues['actscns.funding_req'] = '';
		}
	},
	
	afterInitialDataFetch : function() {
		this.capbudFciCreateScenariosTable.show(false);
		this.capbudFciCreateAddScenarioForm.show(false);
	},
	
	capbudFciCreateConsole_onShow : function() {
		var project_id = this.capbudFciCreateConsole.getFieldValue('project.project_id');
		if (project_id == '') {
			View.showMessage(getMessage('emptyRequiredFields'));
			return;
		}
		this.project_id = project_id;
		this.capbudFciCreateScenariosTable.addParameter('projRestriction', "activity_log.project_id IN ('" + this.project_id + "')");
		this.capbudFciCreateScenariosTable.refresh();
		this.capbudFciCreateScenariosTable.show(true);
		this.capbudFciCreateScenariosTable.appendTitle(this.project_id);
		
		this.capbudFciCreateScenariosTableDs.addParameter('projRestriction', "activity_log.project_id IN ('" + this.project_id + "')");
		var records = this.capbudFciCreateScenariosTableDs.getRecords();
		if (records.length == 0) this.capbudFciCreateScenariosTable_onAddScenario();
	},
	
	capbudFciCreateScenariosTable_onAddScenario : function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.project_id', this.project_id);
		this.capbudFciCreateAddScenarioForm.newRecord = true;
		this.capbudFciCreateAddScenarioForm.refresh(restriction);		
		this.capbudFciCreateAddScenarioForm.showInWindow({
			width: 600,
			height: 500
		});
	},
	
	capbudFciCreateAddScenarioForm_onSave : function() {
		var record = this.capbudFciCreateAddScenarioForm.getRecord();
		this.createScenarioItems(record);
		this.capbudFciCreateScenariosTable.refresh();
		this.capbudFciCreateScenariosTable.show(true);
		this.capbudFciCreateScenariosTable.appendTitle(this.project_id);
	},

	createScenarioItems: function(record) {
		var parameters = {
		  		'proj_scenario_id':record.getValue('actscns.proj_scenario_id'),			
				'fiscal_year':record.getValue('actscns.fiscal_year'),
				'project_id':record.getValue('activity_log.project_id')		
		};
		var result = Workflow.callMethodWithParameters('AbCapitalBudgeting-CapitalProjectsService-createFCIScenario', parameters);
		if (result.code == 'executed') {
			return true;
		} 
	}
});

function capbudFciCreateScenariosTable_onClick(obj) {
	if (obj.restriction.clauses.length == 0) return;
    var tabPanel = View.panels.get('capbudFciCreateTabs');
    tabPanel.selectTab('capbudFciCreatePage2');
    
    var controllerPage2 = View.controllers.get('capbudFciCreatePage2');
    controllerPage2.restrictScenarioItemsGrid(obj);
}