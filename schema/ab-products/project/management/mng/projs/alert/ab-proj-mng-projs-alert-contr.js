var projMngProjsAlertContrController = View.createController('projMngProjsAlertContr', {
	expanded: true,
	projRestriction: ' 1=1 ',
	
	afterInitialDataFetch: function() {	
		this.projRestriction = View.parameters.drilldownParameters.projRestriction;
		this.projMngProjsAlertContr_projTree.addParameter('projRestriction', this.projRestriction);
		this.projMngProjsAlertContr_projTree.refresh();
		this.projMngProjsAlertContr_projTree.expand();	
	},
	
	projMngProjsAlertContr_projTree_onCollapse: function() {
		if (this.expanded) {
			this.projMngProjsAlertContr_projTree.collapse();
			this.projMngProjsAlertContr_projTree.actions.get('collapse').setTitle(getMessage('expandAll'));
		}
		else {
			this.projMngProjsAlertContr_projTree.expand();
			this.projMngProjsAlertContr_projTree.actions.get('collapse').setTitle(getMessage('collapseAll'));
		}
		this.expanded = !this.expanded;
	}
});

function projMngProjsAlertContr_contrTree_select() {
	var currentNode = View.panels.get('projMngProjsAlertContr_projTree').lastNodeClicked;
    var project_id = currentNode.data['work_pkg_bids.project_id'];
    var work_pkg_id = currentNode.data['work_pkg_bids.work_pkg_id'];

    var restriction = new Ab.view.Restriction();
	restriction.addClause('work_pkgs.project_id', project_id);
	restriction.addClause('work_pkgs.work_pkg_id', work_pkg_id);
	View.getOpenerView().controllers.get('projMngProjs').openProjectDash(project_id, 'projMngPkg', 'projMngPkgProf', restriction);

	View.closeThisDialog();
}