var projMngProjsAlertLogUrgController = View.createController('projMngProjsAlertLogUrg', {	
	expanded: true,
	projRestriction: ' 1=1 ',
	
	afterInitialDataFetch: function() {	
		this.projRestriction = View.parameters.drilldownParameters.projRestriction;
		this.projMngProjsAlertLogUrg_projTree.addParameter('projRestriction', this.projRestriction);
		this.projMngProjsAlertLogUrg_projTree.refresh();
		this.projMngProjsAlertLogUrg_projTree.expand();	
	},
	
	projMngProjsAlertLogUrg_projTree_onCollapse: function() {
		if (this.expanded) {
			this.projMngProjsAlertLogUrg_projTree.collapse();
			this.projMngProjsAlertLogUrg_projTree.actions.get('collapse').setTitle(getMessage('expandAll'));
		}
		else {
			this.projMngProjsAlertLogUrg_projTree.expand();
			this.projMngProjsAlertLogUrg_projTree.actions.get('collapse').setTitle(getMessage('collapseAll'));
		}
		this.expanded = !this.expanded;
	}
});

function projMngProjsAlertLogUrg_logTree_select() {
	var currentNode = View.panels.get('projMngProjsAlertLogUrg_projTree').lastNodeClicked;
    var project_id = currentNode.data['ls_comm.project_id'];

    var projMngController = View.getOpenerView().getOpenerView().controllers.get('projMng');
	projMngController.alertsFilter = 'urgent';
	View.getOpenerView().controllers.get('projMngProjs').openProjectDash(project_id, 'projMngDash', null, null);

	View.closeThisDialog();
}