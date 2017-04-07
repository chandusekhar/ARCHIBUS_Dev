
var abBldgopsReportWrBudgetAndCostController = View.createController('abBldgopsReportWrBudgetAndCostController', {

	consoleResWr:' 1=1 ',
	consoleResBudget:' 1=1 ',
	groupPara:'',
	dateStart:null,
	dateEnd:null,

	refreshChart: function() {
		var chartController = View.controllers.get("abBldgopsReportWrBudgetAndCostChartController");
		chartController.refreshChart(this.consoleResWr, this.consoleResBudget, this.groupPara, this.dateStart, this.dateEnd);
	}

})

