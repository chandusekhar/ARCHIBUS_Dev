var projMngProjsAlertLogHiController = View.createController('projMngProjsAlertLogHi', {	
	expanded: true,
	projRestriction: ' 1=1 ',
	
	afterInitialDataFetch: function() {	
		this.projRestriction = View.parameters.drilldownParameters.projRestriction;
		this.projMngProjsAlertLogHi_projTree.addParameter('projRestriction', this.projRestriction);
		this.projMngProjsAlertLogHi_projTree.refresh();
		this.projMngProjsAlertLogHi_projTree.expand();	
	},
	
	projMngProjsAlertLogHi_projTree_onCollapse: function() {
		if (this.expanded) {
			this.projMngProjsAlertLogHi_projTree.collapse();
			this.projMngProjsAlertLogHi_projTree.actions.get('collapse').setTitle(getMessage('expandAll'));
		}
		else {
			this.projMngProjsAlertLogHi_projTree.expand();
			this.projMngProjsAlertLogHi_projTree.actions.get('collapse').setTitle(getMessage('collapseAll'));
		}
		this.expanded = !this.expanded;
	}
});

function projMngProjsAlertLogHi_logTree_select() {
	var currentNode = View.panels.get('projMngProjsAlertLogHi_projTree').lastNodeClicked;
    var project_id = currentNode.data['ls_comm.project_id'];

    var projMngController = View.getOpenerView().getOpenerView().controllers.get('projMng');
	projMngController.alertsFilter = 'high';
	View.getOpenerView().controllers.get('projMngProjs').openProjectDash(project_id, 'projMngDash', null, null);

	View.closeThisDialog();
}