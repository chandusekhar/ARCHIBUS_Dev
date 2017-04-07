var projFcpmCpsProjsAlertInvController = View.createController('projFcpmCpsProjsAlertInv', {
	type: 'chg',
	expanded: true,
	projRestriction: ' 1=1 ',
	
	afterInitialDataFetch: function() {	
		this.projRestriction = View.parameters.drilldownParameters.projRestriction;
		this.projFcpmCpsProjsAlertInv_projTree.addParameter('projRestriction', this.projRestriction);
		this.projFcpmCpsProjsAlertInv_projTree.refresh();
		this.projFcpmCpsProjsAlertInv_projTree.expand();	
	},
	
	projFcpmCpsProjsAlertInv_projTree_onCollapse: function() {
		if (this.expanded) {
			this.projFcpmCpsProjsAlertInv_projTree.collapse();
			this.projFcpmCpsProjsAlertInv_projTree.actions.get('collapse').setTitle(getMessage('expandAll'));
		}
		else {
			this.projFcpmCpsProjsAlertInv_projTree.expand();
			this.projFcpmCpsProjsAlertInv_projTree.actions.get('collapse').setTitle(getMessage('collapseAll'));
		}
		this.expanded = !this.expanded;
	}
});

function projFcpmCpsProjsAlertInv_projTree_select() {
	var currentNode = View.panels.get('projFcpmCpsProjsAlertInv_projTree').lastNodeClicked;
	var project_id = currentNode.data['project.project_id'];

    var projFcpmCpsController = View.getOpenerView().getOpenerView().controllers.get('projFcpmCps');
	projFcpmCpsController.alertsFilter = 'open';
	View.getOpenerView().controllers.get('projFcpmCpsProjs').openProjectDash(project_id, 'projFcpmCpsDash', null, null);
	View.closeThisDialog();
}

function projFcpmCpsProjsAlertInv_invTree_select() {
	var currentNode = View.panels.get('projFcpmCpsProjsAlertInv_projTree').lastNodeClicked;
	var project_id = currentNode.data['invoice.project_id'];
	var work_pkg_id = currentNode.data['invoice.work_pkg_id'];
	var restriction = new Ab.view.Restriction();
	restriction.addClause('work_pkgs.project_id', project_id);
	restriction.addClause('work_pkgs.work_pkg_id', work_pkg_id);
	
	var projFcpmCpsController = View.getOpenerView().getOpenerView().controllers.get('projFcpmCps');
	projFcpmCpsController.alertsFilter = 'open';
	View.getOpenerView().controllers.get('projFcpmCpsProjs').openProjectDash(project_id, 'projFcpmCpsPkg', 'projFcpmCpsPkgInv', restriction);
	View.closeThisDialog();
}