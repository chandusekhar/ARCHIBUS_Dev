/**
 * View's controller
 */
View.createController('abRrParametersCtrl', {
	
	params_list_onReloadParameters: function() {
		try {
			Workflow.callMethod('AbSystemAdministration-ConfigHandlers-reloadActivityParameters');
			View.showMessage(getMessage('activityParametersReloaded'));
		} catch (e) {
			Workflow.handleError(e);
		}
	}
});