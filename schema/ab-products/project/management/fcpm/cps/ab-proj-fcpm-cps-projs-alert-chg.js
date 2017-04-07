var projFcpmCpsProjsAlertChgController = View.createController('projFcpmCpsProjsAlertChg', {
	expanded: true,
	projRestriction: ' 1=1 ',
	
	afterInitialDataFetch: function() {	
		this.projRestriction = View.parameters.drilldownParameters.projRestriction;
		this.projFcpmCpsProjsAlertChg_projTree.addParameter('projRestriction', this.projRestriction);
		this.projFcpmCpsProjsAlertChg_projTree.refresh();
		this.projFcpmCpsProjsAlertChg_projTree.expand();	
	},
	
	projFcpmCpsProjsAlertChg_projTree_onCollapse: function() {
		if (this.expanded) {
			this.projFcpmCpsProjsAlertChg_projTree.collapse();
			this.projFcpmCpsProjsAlertChg_projTree.actions.get('collapse').setTitle(getMessage('expandAll'));
		}
		else {
			this.projFcpmCpsProjsAlertChg_projTree.expand();
			this.projFcpmCpsProjsAlertChg_projTree.actions.get('collapse').setTitle(getMessage('collapseAll'));
		}
		this.expanded = !this.expanded;
	}
});

function projFcpmCpsProjsAlertChg_projTree_select() {
	var currentNode = View.panels.get('projFcpmCpsProjsAlertChg_projTree').lastNodeClicked;
	var project_id = currentNode.data['project.project_id'];

    var projFcpmCpsController = View.getOpenerView().getOpenerView().controllers.get('projFcpmCps');
	projFcpmCpsController.alertsFilter = 'open';
	View.getOpenerView().controllers.get('projFcpmCpsProjs').openProjectDash(project_id, 'projFcpmCpsDash', null, null);
	View.closeThisDialog();
}

function projFcpmCpsProjsAlertChg_actTree_select() {
	var currentNode = View.panels.get('projFcpmCpsProjsAlertChg_projTree').lastNodeClicked;
	var project_id = currentNode.data['activity_log.project_id'];
	var work_pkg_id = currentNode.data['activity_log.work_pkg_id'];
	var restriction = new Ab.view.Restriction();
	restriction.addClause('work_pkgs.project_id', project_id);
	restriction.addClause('work_pkgs.work_pkg_id', work_pkg_id);
	
	var projFcpmCpsController = View.getOpenerView().getOpenerView().controllers.get('projFcpmCps');
	projFcpmCpsController.alertsFilter = 'open';
	View.getOpenerView().controllers.get('projFcpmCpsProjs').openProjectDash(project_id, 'projFcpmCpsPkg', 'projFcpmCpsPkgChg', restriction);
	View.closeThisDialog();
}


