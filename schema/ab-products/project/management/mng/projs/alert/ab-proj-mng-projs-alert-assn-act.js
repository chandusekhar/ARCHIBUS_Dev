var projMngProjsAlertAssnActController = View.createController('projMngProjsAlertAssnAct', {
	expanded: true,
	projRestriction: ' 1=1 ',
	
	afterViewLoad: function() {
	},
	
	afterInitialDataFetch: function() {	
		this.projRestriction = View.parameters.drilldownParameters.projRestriction;
		this.projMngProjsAlertAssnAct_projTree.addParameter('projRestriction', this.projRestriction);
		this.projMngProjsAlertAssnAct_projTree.refresh();
		this.projMngProjsAlertAssnAct_projTree.expand();	
	},
	
	projMngProjsAlertAssnAct_projTree_onCollapse: function() {
		if (this.expanded) {
			this.projMngProjsAlertAssnAct_projTree.collapse();
			this.projMngProjsAlertAssnAct_projTree.actions.get('collapse').setTitle(getMessage('expandAll'));
		}
		else {
			this.projMngProjsAlertAssnAct_projTree.expand();
			this.projMngProjsAlertAssnAct_projTree.actions.get('collapse').setTitle(getMessage('collapseAll'));
		}
		this.expanded = !this.expanded;
	}
});

function projMngProjsAlertAssnAct_actTree_select() {
	var currentNode = View.panels.get('projMngProjsAlertAssnAct_projTree').lastNodeClicked;
    var project_id = currentNode.data['activity_log.project_id'];

	var projMngController = View.getOpenerView().getOpenerView().controllers.get('projMng');
	projMngController.alertsFilter = 'assignedAct';
	View.getOpenerView().controllers.get('projMngProjs').openProjectDash(project_id, 'projMngActs', null, null);

	View.closeThisDialog();
}