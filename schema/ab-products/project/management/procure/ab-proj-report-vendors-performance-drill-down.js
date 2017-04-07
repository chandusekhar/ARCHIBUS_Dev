var projReportVendorsPerformanceDrillDownController = View.createController('projReportVendorsPerformanceDrillDown', {
	
	afterInitialDataFetch : function() {
		var record = this.projReportVendorsPerformanceDrillDownColumnReport.getRecord();
		
		/* remove vn_id restriction */
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.project_id', record.getValue('work_pkg_bids.project_id'));
		restriction.addClause('activity_log.work_pkg_id', record.getValue('work_pkg_bids.work_pkg_id'));
		this.projReportVendorsPerformanceDrillDownGrid.refresh(restriction);
	}
});
