var projMngDashAlertChgController = View.createController('projMngDashAlertChg', {

	projMngDashAlertChg_grid_select: function(obj) {
		var project_id = this.projMngDashAlertChg_grid.rows[this.projMngDashAlertChg_grid.selectedRowIndex]['activity_log.project_id'];
		var work_pkg_id = this.projMngDashAlertChg_grid.rows[this.projMngDashAlertChg_grid.selectedRowIndex]['activity_log.work_pkg_id'];
		var restriction = new Ab.view.Restriction();
		restriction.addClause('work_pkgs.project_id', project_id);
		restriction.addClause('work_pkgs.work_pkg_id', work_pkg_id);
		var openerController = View.getOpenerView().getOpenerView().controllers.get('projMng');
		selectNestedTab(openerController.projMngTabs, 'projMngPkg', openerController.projMngPkgTabs, 'projMngPkgChg', restriction);
		openerController.projMngTabs.setTabTitle('projMngPkg', work_pkg_id);
		View.closeThisDialog();
	}
});