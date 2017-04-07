var projCommlogsByTypeController = View.createController('projCommlogsByType', {
	
	projCommlogsByTypeGrid_onSelectCommType : function(row) {
		var comm_type = row.record['commtype.comm_type.key'];
		var controller = View.getOpenerView().controllers.get('projManageConsole');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('ls_comm.comm_type', comm_type);
		restriction.addClause('ls_comm.project_id', controller.project_id);
		this.projCommlogsGrid.refresh(restriction);
		this.projCommlogsGrid.show(true);
	}
});