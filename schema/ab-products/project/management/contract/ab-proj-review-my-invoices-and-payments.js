function selectWorkPkg(row) {
	var project_id = row['work_pkgs.project_id'];
	var work_pkg_id = row['work_pkg_bids.work_pkg_id'];
	var restriction = new Ab.view.Restriction();
	restriction.addClause('invoice.project_id', project_id);
	restriction.addClause('invoice.work_pkg_id', work_pkg_id);
	View.panels.get('projReviewMyInvoicesAndPaymentsGridInvoices').refresh(restriction);
}

/****************************************************************
 * Work Package Restriction Console functions
 */

function onProjectIdSelval() {
	var restriction = "project.is_template = 0 AND EXISTS (SELECT 1 FROM activity_log WHERE activity_log.project_id = project.project_id "+
	"AND activity_log.work_pkg_id IN (SELECT work_pkg_id FROM work_pkg_bids WHERE work_pkg_bids.status "+
	"IN ( 'Contract Signed', 'In Process', 'In Process-On Hold', 'Completed', 'Completed and Verified', 'Paid in Full') "+
	"AND vn_id = (SELECT vn_id FROM vn WHERE vn.email='"+View.user.email+"')))";
	projectIdSelval(restriction);
}