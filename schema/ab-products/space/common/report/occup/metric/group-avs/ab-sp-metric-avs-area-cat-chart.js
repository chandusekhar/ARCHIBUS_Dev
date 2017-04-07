var abSpMetricAvsCatChartCtrl = abSpAllocTrendMetricChartCommCtrl.extend({

	initial: function(){
		this.chart = this.abSpMetricAvsCatChart;
	},

	addRestriction: function(obj, restriction){
		this.addCategoryClauses(obj, restriction);
	},

	setSqlParameters: function(){
	}
})