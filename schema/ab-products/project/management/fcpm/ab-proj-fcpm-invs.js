var projFcpmInvsController = View.createController('projFcpmInvs', {
	project_id: '',
	
	projFcpmInvs_invs_onAddNew: function() {
		var restriction = new Ab.view.Restriction();
		var project_id = this.projFcpmInvs_console.getFieldValue('invoice.project_id');
		var work_pkg_id = this.projFcpmInvs_console.getFieldValue('invoice.work_pkg_id');
		var vn_id = this.projFcpmInvs_console.getFieldValue('invoice.vn_id');
			
		if (project_id) restriction.addClause('invoice.project_id', project_id);
		if (work_pkg_id) restriction.addClause('invoice.work_pkg_id', work_pkg_id);
		if (vn_id) restriction.addClause('invoice.vn_id', vn_id);
		View.openDialog('ab-proj-fcpm-invs-edit.axvw', restriction, true, {
			width : 1000,
			height : 800,
			closeButton : true
		});
	}
});

function selectInvoice(row) {
	var invoice_id = row['invoice.invoice_id'];
	var restriction = new Ab.view.Restriction();
	restriction.addClause('invoice.invoice_id', invoice_id);
	View.openDialog('ab-proj-fcpm-invs-edit.axvw', restriction, false, {
		width : 1000,
		height : 800,
		closeButton : true
	});
}


