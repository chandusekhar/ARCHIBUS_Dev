var projMngDashAlertContrController = View.createController('projMngDashAlertContr', {

	projMngDashAlertContr_grid_select: function(obj) {
		var project_id = obj.restriction['work_pkg_bids.project_id'];
		var work_pkg_id = obj.restriction['work_pkg_bids.work_pkg_id'];
		var restriction = new Ab.view.Restriction();
		restriction.addClause('work_pkgs.project_id', project_id);
		restriction.addClause('work_pkgs.work_pkg_id', work_pkg_id);
		var openerController = View.getOpenerView().getOpenerView().controllers.get('projMng');
		selectNestedTab(openerController.projMngTabs, 'projMngPkg', openerController.projMngPkgTabs, 'projMngPkgProf', restriction);
		openerController.projMngTabs.setTabTitle('projMngPkg', work_pkg_id);
		View.closeThisDialog();
	}
});