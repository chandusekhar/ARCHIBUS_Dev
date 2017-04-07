/**
 * Controller for Space Report Scenario Grid Panel.
 */
View.createController('spaceScenarioGridPanelControllerr', {
	
	/**
	 * Constructor.
	 */
	afterCreate : function() {
		this.on('app:space:portfolio:report:filter', this.filterScenarioGrid);
	},

	// ----------------------- Action event handler--------------------

	/**
	 * Filter Scenario Grid.
	 */
	filterScenarioGrid : function() {
		var scenarioRes = View.controllers.get('spaceReportFilter').scenariosRes;
		this.scenarioGrid.refresh(scenarioRes)
	}

});

function onclickScenario() {
	var grid = View.panels.get('scenarioGrid');
	var selectedRow = grid.rows[grid.selectedRowIndex];
	var scn_id = selectedRow['portfolio_scenario.portfolio_scenario_id'];
	var indexOfQuote = scn_id.indexOf("'");
	var scnId = scn_id;
	if ( indexOfQuote != -1 ){
		scnId	 = scn_id.replace(/\'/g, "''");
	}

	var res = "portfolio_scenario.portfolio_scenario_id ='"+scnId+"'"
	// trigger filter event
	View.controllers.get('spaceScenarioGridPanelControllerr').trigger('app:space:portfolio:report:onclickScenarioLink', res);
}
