var projActionsStatusesController = View.createController('projActionsStatuses', {
	projActionsStatusesGridActivityType_onSelectActivityType : function(row, action) {
		var record = row.getRecord();
	    var activity_type = record.getValue('activitytype.activity_type');
	    var consoleController = View.getOpenerView().controllers.get('projManageConsole');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.project_id', consoleController.project_id);
		restriction.addClause('activity_log.activity_type', activity_type);
		this.projActionsStatusesGrid.refresh(restriction);
		this.projActionsStatusesGrid.show(true);
	}
});

