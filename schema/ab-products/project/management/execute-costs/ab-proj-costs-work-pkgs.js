var projCostsWorkPkgsController = View.createController('projCostsWorkPkgs', {
	afterInitialDataFetch : function() {		
		if (this.projCostsWorkPkgsDetails.restriction.clauses.length < 2) {
			this.projCostsWorkPkgsDetails.show(false);
		}
	}
});
