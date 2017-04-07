var projMngProjsAlertInvController = View.createController('projMngProjsAlertInv', {
	type: 'chg',
	expanded: true,
	projRestriction: ' 1=1 ',
	
	afterInitialDataFetch: function() {	
		this.projRestriction = View.parameters.drilldownParameters.projRestriction;
		this.projMngProjsAlertInv_projTree.addParameter('projRestriction', this.projRestriction);
		this.projMngProjsAlertInv_projTree.refresh();
		this.projMngProjsAlertInv_projTree.expand();	
	},
	
	projMngProjsAlertInv_projTree_onCollapse: function() {
		if (this.expanded) {
			this.projMngProjsAlertInv_projTree.collapse();
			this.projMngProjsAlertInv_projTree.actions.get('collapse').setTitle(getMessage('expandAll'));
		}
		else {
			this.projMngProjsAlertInv_projTree.expand();
			this.projMngProjsAlertInv_projTree.actions.get('collapse').setTitle(getMessage('collapseAll'));
		}
		this.expanded = !this.expanded;
	}
});

function projMngProjsAlertInv_invTree_select() {
	var currentNode = View.panels.get('projMngProjsAlertInv_projTree').lastNodeClicked;
    var project_id = currentNode.data['invoice.project_id'];

    var projMngController = View.getOpenerView().getOpenerView().controllers.get('projMng');
	projMngController.alertsFilter = 'issued';
	View.getOpenerView().controllers.get('projMngProjs').openProjectDash(project_id, 'projMngInvs', null, null);

	View.closeThisDialog();
}