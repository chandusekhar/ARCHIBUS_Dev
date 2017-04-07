var projFcpmCpsPkgInvController = View.createController('projFcpmCpsPkgInv', {
    
	projFcpmCpsPkgInvGrid_afterRefresh: function() {
		if (this.projFcpmCpsPkgInvGrid.restriction) {
			var project_id = this.projFcpmCpsPkgInvGrid.restriction.findClause('work_pkgs.project_id').value;
			var work_pkg_id = this.projFcpmCpsPkgInvGrid.restriction.findClause('work_pkgs.work_pkg_id').value;
			this.projFcpmCpsPkgInvGrid.appendTitle(project_id + ' - ' + work_pkg_id);
		}
		
		this.projFcpmCpsPkgInvGrid.gridRows.each(function (row) {
	       var record = row.getRecord();
	       var action = row.actions.get('edit_icon');
	 	   var status = record.getValue('invoice.status');
	 	   if (status == 'ISSUED') {
	 		   action.show(true);
	 	   }
	 	   else action.show(false)
	    });
	},
	
	projFcpmCpsPkgInvGrid_onAddInvoice: function() {
		var project_id = this.projFcpmCpsPkgInvGrid.restriction.findClause('work_pkgs.project_id').value;
		var work_pkg_id = this.projFcpmCpsPkgInvGrid.restriction.findClause('work_pkgs.work_pkg_id').value;
		var restriction = new Ab.view.Restriction();
		restriction.addClause('work_pkg_bids.project_id', project_id);
		restriction.addClause('work_pkg_bids.work_pkg_id', work_pkg_id);
		var records = this.projFcpmCpsPkgInvDs2.getRecords(restriction);
		var vn_id = '';
		if (records.length > 0) {
			vn_id = records[0].getValue('work_pkg_bids.vn_id');
		}		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('invoice.project_id', project_id);
		restriction.addClause('invoice.work_pkg_id', work_pkg_id);
		if (vn_id) restriction.addClause('invoice.vn_id', vn_id);
		View.openDialog('ab-proj-fcpm-cps-pkg-inv-edit.axvw', restriction, true, {
			width : 1000,
			height : 800,
			closeButton : true
		});
	}
});

function projFcpmCpsPkgInvGrid_onEditInvoice(obj) {
	View.openDialog('ab-proj-fcpm-cps-pkg-inv-edit.axvw', obj.restriction, false, {
		width : 1000,
		height : 800,
		closeButton : true
	});
}