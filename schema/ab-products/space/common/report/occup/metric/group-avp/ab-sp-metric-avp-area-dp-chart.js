var abSpMetricAvpDpChartCtrl = abSpAllocTrendMetricChartCommCtrl.extend({

	initial: function(){
		this.chart = this.abSpMetricAvpDpChart;
	},

	addRestriction: function(obj, restriction){
		this.addDepartmentClauses(obj, restriction);
	},

	setSqlParameters: function(){
	}
})