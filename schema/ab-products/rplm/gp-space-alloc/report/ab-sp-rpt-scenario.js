/**
 * Controller for Space Report Scenario Grid Panel.
 */
View.createController('spaceScenarioPanelControllerr', {
	
	/**
	 * Constructor.
	 */
	afterCreate : function() {
		this.on('app:space:portfolio:report:filter', this.filterScenarioGrid);
	},
	
	 /**
     * Select scenario and show result panel.
     * @param row
     */
	scenarioGrid_onMultipleSelectionChange: function(row) {
        var scenarioRows = this.scenarioGrid.getSelectedGridRows();
        if (scenarioRows.length>2) {
        	View.showMessage(getMessage('onlySelectTwo'));
        	row.row.unselect();
        }else{
        	var comparisonType = View.controllers.get('spaceReportFilter').getComparisonType();
        	this.trigger('app:space:portfolio:report:showComparionResult', scenarioRows, comparisonType);
        }
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
