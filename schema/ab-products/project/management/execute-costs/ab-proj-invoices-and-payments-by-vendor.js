
function selectVendor(row) {
	var vn_id = row['vn.vn_id'];
	var controller = View.getOpenerView().controllers.get('projManageConsole');
	var restriction = new Ab.view.Restriction();
	restriction.addClause('invoice.project_id', controller.project_id);
	restriction.addClause('invoice.vn_id', vn_id);
	View.panels.get('projInvoicesPaymentsByVendorGridInvoices').refresh(restriction);
}