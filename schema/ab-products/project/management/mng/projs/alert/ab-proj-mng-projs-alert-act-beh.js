var projMngProjsAlertActBehController = View.createController('projMngProjsAlertActBeh', {
	expanded: true,
	projRestriction: ' 1=1 ',
	
	afterViewLoad: function() {
	},
	
	afterInitialDataFetch: function() {	
		this.projRestriction = View.parameters.drilldownParameters.projRestriction;
		this.projMngProjsAlertActBeh_projTree.addParameter('projRestriction', this.projRestriction);
		this.projMngProjsAlertActBeh_projTree.refresh();
		this.projMngProjsAlertActBeh_projTree.expand();	
	},
	
	projMngProjsAlertActBeh_projTree_onCollapse: function() {
		if (this.expanded) {
			this.projMngProjsAlertActBeh_projTree.collapse();
			this.projMngProjsAlertActBeh_projTree.actions.get('collapse').setTitle(getMessage('expandAll'));
		}
		else {
			this.projMngProjsAlertActBeh_projTree.expand();
			this.projMngProjsAlertActBeh_projTree.actions.get('collapse').setTitle(getMessage('collapseAll'));
		}
		this.expanded = !this.expanded;
	}
});

function projMngProjsAlertActBeh_actTree_select() {
	var currentNode = View.panels.get('projMngProjsAlertActBeh_projTree').lastNodeClicked;
    var project_id = currentNode.data['activity_log.project_id'];

	var projMngController = View.getOpenerView().getOpenerView().controllers.get('projMng');
	projMngController.alertsFilter = 'behSched';
	View.getOpenerView().controllers.get('projMngProjs').openProjectDash(project_id, 'projMngActs', null, null);

	View.closeThisDialog();
}