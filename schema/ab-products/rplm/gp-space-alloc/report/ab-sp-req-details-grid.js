/**
 * Controller for Space Report Scenario Grid Panel.
 */
View.createController('spaceRequirementDetailsPanelController', {
	
	/**
	 * Constructor.
	 */
	afterCreate : function() {
		this.on('app:space:portfolio:report:onclickScenarioLink', this.showRequirementDetails);
	},
	
	afterInitialDataFetch: function() {
		View.controllers.get('spaceReportFilter').hideComparisonTypeElement();
	 },

	// ----------------------- Action event handler--------------------
	/**
	 * Filter requirement details.
	 */
	 showRequirementDetails : function(res) {
	   this.abSpRptRequirementGrid.addParameter('filterRestriction', res);
	   this.abSpRptRequirementGrid.refresh(); 
	}

});
