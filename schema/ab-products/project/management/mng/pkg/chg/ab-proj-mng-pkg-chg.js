var projMngPkgChgController = View.createController('projMngPkgChg', {

	projMngPkgChgGrid_afterRefresh : function() {
		if (this.projMngPkgChgGrid.restriction) {
			var project_id = this.projMngPkgChgGrid.restriction.findClause('work_pkgs.project_id').value;
			var work_pkg_id = this.projMngPkgChgGrid.restriction.findClause('work_pkgs.work_pkg_id').value;
			this.projMngPkgChgGrid.appendTitle(project_id + ' - ' + work_pkg_id);
		}
		
		this.projMngPkgChgGrid.gridRows.each(function (row) {
		      var record = row.getRecord();
		      var action = row.actions.get('edit_icon');
			   var status = record.getValue('activity_log.status');
			   if (status == 'REQUESTED') {
				   action.show(true);
		 	   }
		 	   else action.show(false)
		});
	},
	
	projMngPkgChgGrid_onAddNew : function() {
		var grid = this.projMngPkgChgGrid;
		View.openDialog('ab-proj-mng-chg-edit.axvw', grid.restriction, true, {
		    closeButton: true,
		    callback: function() {
		    	grid.refresh();
		    } 
		});
	},
	
	projMngPkgChgGrid_onEdit: function(obj) {
		var grid = this.projMngPkgChgGrid;
		View.openDialog('ab-proj-mng-chg-edit.axvw', obj.restriction, false, {
		    closeButton: true,
		    callback: function() {
		    	grid.refresh();
		    } 
		});
	}
});