var projActionsByWorkpkgController = View.createController('projActionsByWorkpkg', {
	project_id : '',
	work_pkg_id : '',
	
	projActionsByWorkpkgGrid_afterRefresh : function() {
		var controller = View.getOpenerView().controllers.get('projManageConsole');
		this.project_id = controller.project_id;
	},
	
	projActionsByWorkpkgGrid_onSelectWorkPkgId : function(row) {
		this.work_pkg_id = row.record['work_pkgs.work_pkg_id.key'];
		var restriction = new Ab.view.Restriction();
		restriction.addClause('work_pkgs.project_id', this.project_id);
		restriction.addClause('work_pkgs.work_pkg_id', this.work_pkg_id);
		this.projActionsByWorkpkgActionsGrid.refresh(restriction);
		this.projActionsByWorkpkgActionsGrid.show(true);
		this.projActionsByWorkpkgActionsGrid.appendTitle(this.work_pkg_id);
	},
	
	projActionsByWorkpkgActionsGrid_onAssignActions : function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.project_id', this.project_id);
		this.projActionsByWorkpkgCopyActionsGrid.refresh(restriction);
		this.projActionsByWorkpkgCopyActionsGrid.showInWindow({
			width: 800,
			height: 400
		});
	},
	
	projActionsByWorkpkgCopyActionsGrid_onAssignSelectedRecords : function() {
		var selectedRows = this.projActionsByWorkpkgCopyActionsGrid.getPrimaryKeysForSelectedRows();
		for (var i = 0; i < selectedRows.length; i++) {
			var row = selectedRows[i];
		    var record = this.projActionsByWorkpkgDs2.getRecord(row);
		    record.setValue('activity_log.work_pkg_id', this.work_pkg_id);
		    this.projActionsByWorkpkgDs2.saveRecord(record);
		}		
		this.projActionsByWorkpkgActionsGrid.refresh();
		this.projActionsByWorkpkgActionsGrid.show(true);
	},
	
	projActionsByWorkpkgForm_onCancelAction : function() {
		this.projActionsByWorkpkgForm.setFieldValue('activity_log.status', 'CANCELLED');
		this.projActionsByWorkpkgForm.save();
		this.projActionsByWorkpkgForm.closeWindow();
		this.projActionsByWorkpkgActionsGrid.refresh();
	},
	
	projActionsByWorkpkgForm_onStopAction : function() {
		this.projActionsByWorkpkgForm.setFieldValue('activity_log.status', 'STOPPED');
		this.projActionsByWorkpkgForm.save();
		this.projActionsByWorkpkgForm.closeWindow();
		this.projActionsByWorkpkgActionsGrid.refresh();
	}
});