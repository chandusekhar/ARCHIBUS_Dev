var projReviewVendorPerfHistController = View.createController('projReviewVendorPerfHist', {
	projReviewVendorPerfHistGrid_onDetails : function(row, action) {
		this.projReviewVendorPerfHistDetailsColumnReport.addParameter('vn_project_work_pkg_restriction', "(RTRIM(work_pkg_bids.vn_id) ${sql.concat} ' - ' ${sql.concat} RTRIM(work_pkg_bids.project_id) ${sql.concat} ' - ' ${sql.concat} RTRIM(work_pkg_bids.work_pkg_id)) = '" + row.getRecord().getValue('vn.vn_project_work_pkg_id') + "'");
		this.projReviewVendorPerfHistDetailsColumnReport.refresh();
		this.projReviewVendorPerfHistDetailsColumnReport.showInWindow({
		    width: 800,
		    height: 500
		});
	}
});
