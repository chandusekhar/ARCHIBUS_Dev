var abSpMetricAvpFlChartCtrl = abSpAllocTrendMetricChartCommCtrl.extend({

	initial: function(){
		this.chart = this.abSpMetricAvpFlChart;
	},

	addRestriction: function(obj, restriction){
		this.addFloorClauses(obj, restriction);
	},

	setSqlParameters: function(){
	}
})