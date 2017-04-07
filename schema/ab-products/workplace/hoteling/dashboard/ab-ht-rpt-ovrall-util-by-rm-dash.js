var roomsUtilizationController = View.createController('roomsUtilizationController', {

	afterViewLoad: function(){
		var dvId = View.user.employee.organization.divisionId;
		var dpId = View.user.employee.organization.departmentId;
		var restriction = new Ab.view.Restriction();

		restriction.addClause('rm.dv_id', dvId, '=');
		restriction.addClause('rm.dp_id', dpId, '=');
		restriction.addClause('rm.dp_id', null, '<>');

		this.rmUtilizationChartGrid.show(true);
		this.rmUtilizationChartGrid.refresh(restriction);
    }
})
