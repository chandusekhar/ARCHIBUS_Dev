var abBldgopsReportComplWrBudgetAndCostMonthController = View.createController('abBldgopsReportComplWrBudgetAndCostMonthController', {
	consoleResWr:' 1=1 ',
	consoleResBudget:' 1=1 ',
	yearSelect:'',
	isCalYear:true,

	refreshChart: function() {
		var chartController = View.controllers.get("abBldgopsReportComplWrBudgetAndCostMonthChartController");
		chartController.refreshChart(this.consoleResWr, this.consoleResBudget, this.yearSelect,this.isCalYear);
	}
})