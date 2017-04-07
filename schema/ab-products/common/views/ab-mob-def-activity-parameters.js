var abMobDefActivityParametersCtrl = View.createController('abMobDefActivityParametersCtrl',{
	abMobDefActivityParameters_grid_onReloadParameters: function() {
			try {
				Workflow.callMethod('AbSystemAdministration-ConfigHandlers-reloadActivityParameters');
				View.showMessage(getMessage('activityParametersReloaded'));
			} catch (e) {
				Workflow.handleError(e);
			}
		}
});
