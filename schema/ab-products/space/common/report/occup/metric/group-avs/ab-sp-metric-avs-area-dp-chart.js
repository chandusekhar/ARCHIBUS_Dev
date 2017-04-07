var abSpMetricAvsDpChartCtrl = abSpAllocTrendMetricChartCommCtrl.extend({

	initial: function(){
		this.chart = this.abSpMetricAvsDpChart;
	},

	addRestriction: function(obj, restriction){
		this.addDepartmentClauses(obj, restriction);
	},

	setSqlParameters: function(){
	}
})