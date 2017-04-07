/**
 * View's controller
 */
View.createController('abSpActivityParamsCtrl', {
	
	paramGrid_onReloadParameters: function() {
		try {
			Workflow.callMethod('AbSystemAdministration-ConfigHandlers-reloadActivityParameters');
			View.showMessage(getMessage('activityParametersReloaded'));
		} catch (e) {
			Workflow.handleError(e);
		}
	}
});

/**
 * Refresh form paramsForm by restriction of afm_activity_params.param_id
 */

function callActivtyParam(){
	 var grid = View.panels.get('paramGrid');
    var selectedRow = grid.rows[grid.selectedRowIndex];
    var paramId = selectedRow["afm_activity_params.param_id"];
    var restriction = new Ab.view.Restriction();
    restriction.addClause("afm_activity_params.param_id", paramId, "=", true);
      View.panels.get('paramsForm').refresh(restriction);
	
}
/**
 * Cancel edit param and hidden paramsForm
 */
function cancelEditParam(){
	
		 View.panels.get('paramsForm').show(false);
}
