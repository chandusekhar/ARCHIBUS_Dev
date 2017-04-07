var projMngPkgActAsgnController = View.createController('projMngPkgActAsgn', {
	project_id : '',
	work_pkg_id : '',
	
	afterInitialDataFetch : function() {
		this.work_pkg_id = View.getOpenerView().panels.get('projMngPkgActGrid').restriction.findClause('work_pkgs.work_pkg_id').value;

		var projMngController = View.getOpenerView().getOpenerView().controllers.get('projMng');
		projMngController.dialogView = View;	
	},
	
	projMngPkgActAsgnGrid_onAssignSelectedRecords : function() {
		var selectedRows = this.projMngPkgActAsgnGrid.getPrimaryKeysForSelectedRows();
		if (selectedRows.length < 1) {
			View.showMessage(getMessage('noSelection'));
			return;
		}
		for (var i = 0; i < selectedRows.length; i++) {
			var row = selectedRows[i];
		    var record = this.projMngPkgActAsgnDs0.getRecord(row);
		    record.setValue('activity_log.work_pkg_id', this.work_pkg_id);
		    this.projMngPkgActAsgnDs0.saveRecord(record);
		}		
		View.getOpenerView().panels.get('projMngPkgActGrid').refresh();
		View.closeThisDialog();
	}
});


												