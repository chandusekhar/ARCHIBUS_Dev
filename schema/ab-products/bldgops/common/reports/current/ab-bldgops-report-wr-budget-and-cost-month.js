var abBldgopsReportWrBudgetAndCostMonthController = View.createController('abBldgopsReportWrBudgetAndCostMonthController', {
	consoleResWr:' 1=1 ',
	consoleResBudget:' 1=1 ',
	yearSelect:'',
	isCalYear:true,

	refreshChart: function() {
		var chartController = View.controllers.get("abBldgopsReportWrBudgetAndCostMonthChartController");
		chartController.refreshChart(this.consoleResWr, this.consoleResBudget, this.yearSelect, this.isCalYear);
	}
})