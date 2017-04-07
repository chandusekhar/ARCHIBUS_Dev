var projMngRptAtRiskDtlController = View.createController('projMngRptAtRiskDtl', {
	
	afterInitialDataFetch : function() {
		var work_pkg_id = this.projMngRptAtRiskDtlGrid.restriction.clauses[0].value;
		var project_id = this.projMngRptAtRiskDtlGrid.restriction.clauses[1].value;
		this.projMngRptAtRiskDtlGrid.appendTitle(project_id + " - " + work_pkg_id);
	}
});


