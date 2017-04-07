var projReportVendorsPerformanceController = View.createController('projReportVendorsPerformance', {
	projReportVendorsPerformanceConsole_onShow : function() {
		var state = this.projReportVendorsPerformanceConsole.getFieldValue('vn.state');
		var city = this.projReportVendorsPerformanceConsole.getFieldValue('vn.city');
		var restriction = "1=1";
		if (state) restriction += " AND work_pkg_bids.state = '" + state + "'"
		if (city) restriction += " AND work_pkg_bids.city = '" + city + "'";
		this.projReportVendorsPerformanceGrid.refresh(restriction);
	}
});
	