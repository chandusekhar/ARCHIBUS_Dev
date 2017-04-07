var abSpMetricAvsFlChartCtrl = abSpAllocTrendMetricChartCommCtrl.extend({

	initial: function(){
		this.chart = this.abSpMetricAvsFlChart;
	},

	addRestriction: function(obj, restriction){
		this.addFloorClauses(obj, restriction);
	},

	setSqlParameters: function(){
	}
})