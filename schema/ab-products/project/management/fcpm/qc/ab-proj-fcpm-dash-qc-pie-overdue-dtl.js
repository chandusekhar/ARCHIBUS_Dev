var projFcpmDashQcPieOverdueDtlController = View.createController('projFcpmDashQcPieOverdueDtl',{
	afterViewLoad: function() {
		this.projFcpmDashQcPieOverdueDtl_grid.addParameter('pastDue', getMessage('pastDueSummary'));
		this.projFcpmDashQcPieOverdueDtl_grid.addParameter('timely', getMessage('timelySummary'));
		this.projFcpmDashQcPieOverdueDtl_grid.addParameter('unscheduled', getMessage('unscheduledSummary'));
		this.projFcpmDashQcPieOverdueDtl_grid.addParameter('noValue', getMessage('noValueSummary'));
		this.projFcpmDashQcPieOverdueDtl_grid.appendTitle(this.projFcpmDashQcPieOverdueDtl_grid.restriction.findClause('project.status_group').value);
	}
});

