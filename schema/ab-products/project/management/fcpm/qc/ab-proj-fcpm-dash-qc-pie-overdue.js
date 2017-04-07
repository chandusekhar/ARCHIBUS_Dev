var projFcpmDashQcPieOverdueController = View.createController('projFcpmDashQcPieOverdue',{
	afterViewLoad: function() {
		this.projFcpmDashQcPieOverdue_chart.addParameter('pastDue', getMessage('pastDueSummary'));
		this.projFcpmDashQcPieOverdue_chart.addParameter('timely', getMessage('timelySummary'));
		this.projFcpmDashQcPieOverdue_chart.addParameter('unscheduled', getMessage('unscheduledSummary'));
		this.projFcpmDashQcPieOverdue_chart.addParameter('noValue', getMessage('noValueSummary'));
	}
});

function selectPieOverdue(obj) {
	if (obj.restriction.clauses[0]) {
		View.openDialog('ab-proj-fcpm-dash-qc-pie-overdue-dtl.axvw', obj.restriction);
	}
}

