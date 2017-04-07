var projFcpmDashQcPieStatusController = View.createController('projFcpmDashQcPieStatus',{
	afterViewLoad: function() {
		this.projFcpmDashQcPieStatus_chart.addParameter('pending', getMessage('pendingSummary'));
		this.projFcpmDashQcPieStatus_chart.addParameter('active', getMessage('activeSummary'));
		this.projFcpmDashQcPieStatus_chart.addParameter('onHold', getMessage('onHoldSummary'));
		this.projFcpmDashQcPieStatus_chart.addParameter('done', getMessage('doneSummary'));
		this.projFcpmDashQcPieStatus_chart.addParameter('closed', getMessage('closedSummary'));
	}
});

function selectPieStatus(obj) {
	if (obj.restriction.clauses[0]) {
		View.openDialog('ab-proj-fcpm-dash-qc-pie-status-dtl.axvw', obj.restriction);
	}
}