var projFcpmCpsPkgChgController = View.createController('projFcpmCpsPkgChg', {

	projFcpmCpsPkgChgGrid_afterRefresh : function() {
		if (this.projFcpmCpsPkgChgGrid.restriction) {
			var project_id = this.projFcpmCpsPkgChgGrid.restriction.findClause('work_pkgs.project_id').value;
			var work_pkg_id = this.projFcpmCpsPkgChgGrid.restriction.findClause('work_pkgs.work_pkg_id').value;
			this.projFcpmCpsPkgChgGrid.appendTitle(project_id + ' - ' + work_pkg_id);
		}
		
		this.projFcpmCpsPkgChgGrid.gridRows.each(function (row) {
		      var record = row.getRecord();
		      var action = row.actions.get('edit_icon');
			   var status = record.getValue('activity_log.status');
			   if (status == 'REQUESTED') {
				   action.show(true);
		 	   }
		 	   else action.show(false)
		});
	},
	
	projFcpmCpsPkgChgGrid_onAddRequest: function() {
		var project_id = this.projFcpmCpsPkgChgGrid.restriction.findClause('work_pkgs.project_id').value;
		var work_pkg_id = this.projFcpmCpsPkgChgGrid.restriction.findClause('work_pkgs.work_pkg_id').value;
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.project_id', project_id);
		restriction.addClause('activity_log.work_pkg_id', work_pkg_id);
		View.openDialog('ab-proj-fcpm-cps-pkg-chg-edit.axvw', this.projFcpmCpsPkgChgGrid.restriction, true, {
			width : 1000,
			height : 800,
			closeButton : true
		});
	}
});