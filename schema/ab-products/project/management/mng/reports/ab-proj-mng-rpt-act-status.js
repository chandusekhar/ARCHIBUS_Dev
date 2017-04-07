var projMngRptActStatusController = View.createController('projMngRptActStatus', {
	project_id : '', 
	
	afterInitialDataFetch: function() {
		var consoleController = View.getOpenerView().getOpenerView().controllers.get('projMng');
		this.project_id = consoleController.project_id;
		this.projMngRptActStatusGrid.appendTitle(this.project_id);
	},
	
	projMngRptActStatusGridActivityType_onSelectActivityType : function(row, action) {
		var record = row.getRecord();
	    var activity_type = record.getValue('activity_log.activity_type');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.project_id', this.project_id);
		restriction.addClause('activity_log.activity_type', activity_type);
		this.projMngRptActStatusGrid.refresh(restriction);
		this.projMngRptActStatusGrid.show(true);
		this.projMngRptActStatusGrid.appendTitle(this.project_id + ' - ' + activity_type);
	}
});

