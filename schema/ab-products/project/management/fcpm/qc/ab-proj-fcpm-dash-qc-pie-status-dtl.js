var projFcpmDashQcPieStatusDtlController = View.createController('projFcpmDashQcPieStatusDtl',{
	
	afterViewLoad: function() {
		this.projFcpmDashQcPieStatusDtl_grid.addParameter('pending', getMessage('pendingSummary'));
		this.projFcpmDashQcPieStatusDtl_grid.addParameter('active', getMessage('activeSummary'));
		this.projFcpmDashQcPieStatusDtl_grid.addParameter('onHold', getMessage('onHoldSummary'));
		this.projFcpmDashQcPieStatusDtl_grid.addParameter('done', getMessage('doneSummary'));
		this.projFcpmDashQcPieStatusDtl_grid.addParameter('closed', getMessage('closedSummary'));
		this.projFcpmDashQcPieStatusDtl_grid.appendTitle(this.projFcpmDashQcPieStatusDtl_grid.restriction.findClause('project.status_group').value);
	}
});