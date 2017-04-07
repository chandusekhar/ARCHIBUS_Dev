// ab-my-favorites.js


var myFavController =  View.createController('myFavoritesController', {

	// WFR used to clone view and add afm_ptask record 
    deleteRuleId: 'AbSystemAdministration-removeViewFromMyFavorites',

	/**
	 *  load the task_file of the selected row into the target panel
	 *
	myFavoritesReport_onAfm_ptasks.task_id: function(row, action) {
		var selectionPanel = View.getControl('','myFavoritesReport');
		var targetPanel = View.getControl('','myFavoriteView');
		if (selectionPanel != null && targetPanel != null) {
			//var row = selectionPanel.rows[selectionPanel.selectedRowIndex];
			var viewName = row.getFieldValue('afm_ptasks.task_file');
			targetPanel.loadView(viewName);
		}      
	},
*/

	/**
	 *  edit the afm_ptasks record (only the task_id) is a separate dialog
	 */
	myFavoritesReport_onEdit: function(row, action) {
		var targetPanel = View.getControl('','myFavoriteView');
		if (targetPanel != null) {
			//var row = selectionPanel.rows[selectionPanel.selectedRowIndex];
			var viewName = row.getFieldValue('afm_ptasks.task_file');
			var restriction = new Ab.view.Restriction();
			restriction.addClause('afm_ptasks.activity_id', row.getFieldValue('afm_ptasks.activity_id'), '=');
			restriction.addClause('afm_ptasks.process_id', row.getFieldValue('afm_ptasks.process_id'), '=');
			restriction.addClause('afm_ptasks.task_id', row.getFieldValue('afm_ptasks.task_id'), '=');
			restriction.addClause('afm_ptasks.hot_user_name', View.user.name, '=');

			View.openDialog('ab-my-favorites-edit-dialog.axvw', restriction, false);
		}      
	},


	/**
	 *  delete the afm_ptasks record and per-site axvw file if confirmed in the dialog
	 */
	myFavoritesReport_onDelete: function(row, action) {
        var record = row.getRecord();
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

					var panel = View.panels.get('myFavoritesReport');
					controller.myFavoritesReport.refresh();
                }
				catch (e) {
					Ab.workflow.Workflow.handleError(e);
                }
            }
		});
	}

});


	function selectTask() {
		var controller = View.controllers.get('myFavoritesController');

		var selectionPanel = View.getControl('','myFavoritesReport');
		var targetPanel = View.getControl('','myFavoriteView');
		if (selectionPanel != null && targetPanel != null) {
			var row = selectionPanel.rows[selectionPanel.selectedRowIndex];
			var viewName = row['afm_ptasks.task_file'];
			targetPanel.loadView(viewName);
		}      

	}
