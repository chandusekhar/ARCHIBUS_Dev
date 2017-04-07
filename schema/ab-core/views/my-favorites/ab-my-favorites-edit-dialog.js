// ab-my-favorites.js


var myFavController =  View.createController('myFavoritesEditController', {

	// WFR used to clone view and add afm_ptask record 
    deleteRuleId: 'AbSystemAdministration-removeViewFromMyFavorites',

	/**
	 *  delete the afm_ptasks record and per-site axvw file if confirmed in the dialog
	 */
	editForm_onDelete: function(row, action) {
        var record = this.editForm.getRecord();
        var controller = this;
		var message = getMessage('deleteConfirmation');

        View.confirm(message, function(button) {
            if (button == 'yes') {
                try {					
					var parameters = new Object();
					parameters.viewName = record.getValue('afm_ptasks.task_file');
					parameters.taskId = record.getValue('afm_ptasks.task_id');
					parameters.processId = record.getValue('afm_ptasks.process_id');
					parameters.activityId = record.getValue('afm_ptasks.activity_id');

				    // delete the afm_ptasks record and the view file
					var result = Ab.workflow.Workflow.call(controller.deleteRuleId, parameters);

					var openerView = View.getOpenerWindow().View;
					if (openerView != null) {
						var panel = openerView.panels.get('myFavoritesReport');
						panel.refresh();
						openerView.closeDialog();
					}
                }
				catch (e) {
					Ab.workflow.Workflow.handleError(e);
                }
            }
		});
	}

});



