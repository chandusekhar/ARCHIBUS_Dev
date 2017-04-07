/**
 * Controller for Space Report Area Cross table Panel.
 */
View.createController('spaceRptAreasControllerr', {
	
	/**
	 * Constructor.
	 */
	afterCreate : function() {
		this.on('app:space:portfolio:report:showComparionResult', this.refreshAreasCrossTable);
	},
	
    afterInitialDataFetch: function() {
    	this.abSpRptAreaCrossTable1.show(false);
    	this.abSpRptAreaCrossTable2.show(false);
    },
	
	// ----------------------- Action event handler--------------------

	/**
	 * Refresh Area cross table 
	 */
    refreshAreasCrossTable : function(scenarioRows, comparisonType) {
		this.abSpRptAreaCrossTable1.show(false);
		this.abSpRptAreaCrossTable2.show(false);
		
		if(comparisonType == 'areas'){
			if(scenarioRows.length == 1){
				this.abSpRptAreaCrossTable1.show(true);
				this.setAreaPanelTitle(this.abSpRptAreaCrossTable1,scenarioRows[0].record['portfolio_scenario.scn_name']);
				this.setDataSourceParameters('abSpRptAreaCrossTable1', 'filterRestriction', this.getScenarioIdRestriction(scenarioRows[0]));
				this.abSpRptAreaCrossTable1.refresh();
				
			}else if(scenarioRows.length == 2){
				this.abSpRptAreaCrossTable1.show(true);
				this.abSpRptAreaCrossTable2.show(true);
				this.setAreaPanelTitle(this.abSpRptAreaCrossTable1,scenarioRows[0].record['portfolio_scenario.scn_name']);
				this.setAreaPanelTitle(this.abSpRptAreaCrossTable2,scenarioRows[1].record['portfolio_scenario.scn_name']);
				this.setDataSourceParameters('abSpRptAreaCrossTable1', 'filterRestriction', this.getScenarioIdRestriction(scenarioRows[0]));
				this.abSpRptAreaCrossTable1.refresh();
				this.setDataSourceParameters('abSpRptAreaCrossTable2', 'filterRestriction', this.getScenarioIdRestriction(scenarioRows[1]));
				this.abSpRptAreaCrossTable2.refresh();
			}
		}
	},
	
	setAreaPanelTitle: function(panel,scenario) {
		// reset the chart panel title
		panel.config.title = getMessage('AreaTitle') + ' - ' + scenario;
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
