var abSpMetricDvAreaDpChartCtrl = abSpMetricDpChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpMetricDvAreaDpChart;
	},

	addRestriction: function(obj, restriction){
		this.addDivisionClauses(obj, restriction);
		this.addDepartmentClauses(obj, restriction);
	}

})