var projProjectsAnalysisDetailsController = View.createController('projProjectsAnalysisDetails', {

	afterInitialDataFetch : function() {
		if (this.projProjectsAnalysisDetailsColumnReport.restriction.clauses.length == 0) 
			this.projProjectsAnalysisDetailsColumnReport.show(false);
	}
});