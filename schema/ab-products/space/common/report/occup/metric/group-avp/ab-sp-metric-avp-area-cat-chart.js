var abSpMetricAvpCatChartCtrl = abSpAllocTrendMetricChartCommCtrl.extend({

	initial: function(){
		this.chart = this.abSpMetricAvpCatChart;
	},

	addRestriction: function(obj, restriction){
		this.addCategoryClauses(obj, restriction);
	},

	setSqlParameters: function(){
	}
})