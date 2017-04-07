
var abBldgopsReportComplWrBudgetAndCostController = View.createController('abBldgopsReportComplWrBudgetAndCostController', {

	consoleResWr:' 1=1 ',
	consoleResBudget:' 1=1 ',
	groupPara:'',
	dateStart:null,
	dateEnd:null,

	refreshChart: function() {
		var chartController = View.controllers.get("abBldgopsReportComplWrBudgetAndCostChartController");
		chartController.refreshChart(this.consoleResWr.replace(/date_assigned/g, "date_completed"), this.consoleResBudget, this.groupPara, this.dateStart, this.dateEnd);
	}

})

