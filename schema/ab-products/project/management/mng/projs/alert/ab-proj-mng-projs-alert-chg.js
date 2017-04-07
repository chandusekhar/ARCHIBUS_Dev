var projMngProjsAlertChgController = View.createController('projMngProjsAlertChg', {
	expanded: true,
	projRestriction: ' 1=1 ',
	
	afterInitialDataFetch: function() {	
		this.projRestriction = View.parameters.drilldownParameters.projRestriction;
		this.projMngProjsAlertChg_projTree.addParameter('projRestriction', this.projRestriction);
		this.projMngProjsAlertChg_projTree.refresh();
		this.projMngProjsAlertChg_projTree.expand();	
	},
	
	projMngProjsAlertChg_projTree_onCollapse: function() {
		if (this.expanded) {
			this.projMngProjsAlertChg_projTree.collapse();
			this.projMngProjsAlertChg_projTree.actions.get('collapse').setTitle(getMessage('expandAll'));
		}
		else {
			this.projMngProjsAlertChg_projTree.expand();
			this.projMngProjsAlertChg_projTree.actions.get('collapse').setTitle(getMessage('collapseAll'));
		}
		this.expanded = !this.expanded;
	}
});

function projMngProjsAlertChg_actTree_select() {
	var currentNode = View.panels.get('projMngProjsAlertChg_projTree').lastNodeClicked;
    var project_id = currentNode.data['activity_log.project_id'];
    var work_pkg_id = currentNode.data['activity_log.work_pkg_id'];
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause('work_pkgs.project_id', project_id);
	restriction.addClause('work_pkgs.work_pkg_id', work_pkg_id);
	View.getOpenerView().controllers.get('projMngProjs').openProjectDash(project_id, 'projMngPkg', 'projMngPkgChg', restriction);

	View.closeThisDialog();
}