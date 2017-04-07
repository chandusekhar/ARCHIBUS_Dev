var abSpMetricDvCountDpChartCtrl = abSpMetricDpChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpMetricDvCountDpChart;
	},

	addRestriction: function(obj, restriction){
		this.addDivisionClauses(obj, restriction);
		this.addDepartmentClauses(obj, restriction);
	}

})