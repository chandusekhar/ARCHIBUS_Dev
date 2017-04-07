var projMngProjsAlertActHoldController = View.createController('projMngProjsAlertActHold', {
	expanded: true,
	projRestriction: ' 1=1 ',
	
	afterViewLoad: function() {
	},
	
	afterInitialDataFetch: function() {	
		this.projRestriction = View.parameters.drilldownParameters.projRestriction;
		this.projMngProjsAlertActHold_projTree.addParameter('projRestriction', this.projRestriction);
		this.projMngProjsAlertActHold_projTree.refresh();
		this.projMngProjsAlertActHold_projTree.expand();	
	},
	
	projMngProjsAlertActHold_projTree_onCollapse: function() {
		if (this.expanded) {
			this.projMngProjsAlertActHold_projTree.collapse();
			this.projMngProjsAlertActHold_projTree.actions.get('collapse').setTitle(getMessage('expandAll'));
		}
		else {
			this.projMngProjsAlertActHold_projTree.expand();
			this.projMngProjsAlertActHold_projTree.actions.get('collapse').setTitle(getMessage('collapseAll'));
		}
		this.expanded = !this.expanded;
	}
});

function projMngProjsAlertActHold_actTree_select() {
	var currentNode = View.panels.get('projMngProjsAlertActHold_projTree').lastNodeClicked;
    var project_id = currentNode.data['activity_log.project_id'];

	var projMngController = View.getOpenerView().getOpenerView().controllers.get('projMng');
	projMngController.alertsFilter = 'onHold';
	View.getOpenerView().controllers.get('projMngProjs').openProjectDash(project_id, 'projMngActs', null, null);

	View.closeThisDialog();
}