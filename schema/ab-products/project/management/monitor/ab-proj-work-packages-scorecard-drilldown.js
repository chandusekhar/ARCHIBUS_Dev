var projWorkPackagesScorecardDrilldownController = View.createController('projWorkPackagesScorecardDrilldown', {
	
	afterInitialDataFetch : function() {
		var openerController = View.getOpenerView().controllers.get('projWorkPackagesScorecard');
		this.projWorkPackagesScorecardDrilldownGrid.addParameter('projRestriction', openerController.projRestriction);
		this.projWorkPackagesScorecardDrilldownGrid.refresh();
	}
});
