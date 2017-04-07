/**
 * Controller for Space Report Gap Analysis Chart Panel.
 */
View.createController('spaceRptCostControllerr', {
	
	/**
	 * Constructor.
	 */
	afterCreate : function() {
		this.on('app:space:portfolio:report:showComparionResult', this.refreshRequirementCostAndHeadCount);
	},
	
    afterInitialDataFetch: function() {
    	this.abSpRptCostGrid1.show(false);
    	this.abSpRptCostGrid1.show(false);
    },
	
	// ----------------------- Action event handler--------------------

	/**
	 * Refresh Requirement cost and headcount
	 */
    refreshRequirementCostAndHeadCount : function(scenarioRows, comparisonType) {
		this.abSpRptCostGrid1.show(false);
		this.abSpRptCostGrid2.show(false);
		
		if(comparisonType == 'requirement'){
			if(scenarioRows.length == 1){
				this.abSpRptCostGrid1.show(true);
				this.setCostPanelTitle(this.abSpRptCostGrid1,scenarioRows[0].record['portfolio_scenario.scn_name']);
				this.setDataSourceParameters('abSpRptCostGrid1', 'scenarioIdRestriction', this.getScenarioIdRestriction(scenarioRows[0]));
				this.abSpRptCostGrid1.refresh();
				
			}else if(scenarioRows.length == 2){
				this.abSpRptCostGrid1.show(true);
				this.abSpRptCostGrid2.show(true);
				this.setCostPanelTitle(this.abSpRptCostGrid1,scenarioRows[0].record['portfolio_scenario.scn_name']);
				this.setCostPanelTitle(this.abSpRptCostGrid2,scenarioRows[1].record['portfolio_scenario.scn_name']);
				this.setDataSourceParameters('abSpRptCostGrid1', 'scenarioIdRestriction', this.getScenarioIdRestriction(scenarioRows[0]));
				this.abSpRptCostGrid1.refresh();
				this.setDataSourceParameters('abSpRptCostGrid2', 'scenarioIdRestriction', this.getScenarioIdRestriction(scenarioRows[1]));
				this.abSpRptCostGrid2.refresh();
			}
		}
	},
	
	setCostPanelTitle: function(panel,scenario) {
		// reset the chart panel title
		panel.config.title = getMessage('requirementCost') + ' - ' + scenario;
	},
	
	getScenarioIdRestriction: function(scenarioRow) {
		var scenarioId = scenarioRow.record['portfolio_scenario.portfolio_scenario_id'];
		return  "portfolio_scenario.portfolio_scenario_id = '" + scenarioId + "'";
	},
	
	setDataSourceParameters: function(panelId,name,value) {
		var panel = View.panels.get(panelId);
		panel.addParameter(name, value);
	 }

});
