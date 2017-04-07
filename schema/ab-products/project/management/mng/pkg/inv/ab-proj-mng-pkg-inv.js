var projMngPkgInvController = View.createController('projMngPkgInv', {
    
	projMngPkgInvGrid_afterRefresh: function() {
		if (this.projMngPkgInvGrid.restriction) {
			var project_id = this.projMngPkgInvGrid.restriction.findClause('work_pkgs.project_id').value;
			var work_pkg_id = this.projMngPkgInvGrid.restriction.findClause('work_pkgs.work_pkg_id').value;
			this.projMngPkgInvGrid.appendTitle(project_id + ' - ' + work_pkg_id);
		}
		
	    
		this.projMngPkgInvGrid.gridRows.each(function (row) {
	       var record = row.getRecord();
	       var action = row.actions.get('edit_icon');
	 	   var status = record.getValue('invoice.status');
	 	   if (status == 'ISSUED') {
	 		   action.show(true);
	 	   }
	 	   else action.show(false)
	    });
	},
	
    projMngPkgInvGrid_onAddNew: function() {
		View.openDialog('ab-proj-mng-inv-edit.axvw', this.projMngPkgInvGrid.restriction, true, {
    		width : 1000,
			height : 800,
			closeButton : true,
			callback: function() {
				View.panels.get('projMngPkgInvGrid').refresh();
		    }
		});
    }
});

function openInv(commandContext) {
	var invoice_id = commandContext.restriction['invoice.invoice_id'];
	var restriction = new Ab.view.Restriction();
	restriction.addClause('invoice.invoice_id', invoice_id);
	View.openDialog('ab-proj-mng-inv-edit.axvw', restriction, false, {
		width : 1000,
		height : 800,
		closeButton : true,
		callback: function() {
			View.panels.get('projMngPkgInvGrid').refresh();
	    }
	});
}