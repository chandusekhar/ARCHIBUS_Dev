var projMngProjsAlertPkgController = View.createController('projMngProjsAlertPkg', {
	expanded: true,
	projRestriction: ' 1=1 ',
	
	afterInitialDataFetch: function() {	
		this.projRestriction = View.parameters.drilldownParameters.projRestriction;
		this.projMngProjsAlertPkg_projTree.addParameter('projRestriction', this.projRestriction);
		this.projMngProjsAlertPkg_projTree.refresh();
		this.projMngProjsAlertPkg_projTree.expand();	
	},
	
	projMngProjsAlertPkg_projTree_onCollapse: function() {
		if (this.expanded) {
			this.projMngProjsAlertPkg_projTree.collapse();
			this.projMngProjsAlertPkg_projTree.actions.get('collapse').setTitle(getMessage('expandAll'));
		}
		else {
			this.projMngProjsAlertPkg_projTree.expand();
			this.projMngProjsAlertPkg_projTree.actions.get('collapse').setTitle(getMessage('collapseAll'));
		}
		this.expanded = !this.expanded;
	}
});

function projMngProjsAlertPkg_pkgTree_select() {
	var currentNode = View.panels.get('projMngProjsAlertPkg_projTree').lastNodeClicked;
    var project_id = currentNode.data['work_pkgs.project_id'];
    var work_pkg_id = currentNode.data['work_pkgs.work_pkg_id'];

    var restriction = new Ab.view.Restriction();
	restriction.addClause('work_pkgs.project_id', project_id);
	restriction.addClause('work_pkgs.work_pkg_id', work_pkg_id);
	View.getOpenerView().controllers.get('projMngProjs').openProjectDash(project_id, 'projMngPkg', 'projMngPkgProf', restriction);

	View.closeThisDialog();
}