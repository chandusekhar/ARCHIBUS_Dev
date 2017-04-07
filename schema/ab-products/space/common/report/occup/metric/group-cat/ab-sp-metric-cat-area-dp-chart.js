var abSpMetricCatAreaDpChartCtrl = abSpMetricDpChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpMetricCatAreaDpChart;
	},

	addRestriction: function(obj, restriction){
		this.addDivisionClauses(obj, restriction);
		this.addDepartmentClauses(obj, restriction);
	}

})