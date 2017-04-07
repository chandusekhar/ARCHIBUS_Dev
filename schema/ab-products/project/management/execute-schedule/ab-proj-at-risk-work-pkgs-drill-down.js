var projAtRiskWorkPkgsDrilldownController = View.createController('projAtRiskWorkPkgsDrilldown', {

	afterInitialDataFetch : function() {
		var restriction = this.projAtRiskWorkPkgsDrilldownReport.restriction;
		this.projAtRiskWorkPkgsDrilldownGrid.refresh(restriction);
	}
});