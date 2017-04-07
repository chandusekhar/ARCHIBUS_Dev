var abSpMetricAvpSiteChartCtrl = abSpAllocTrendMetricChartCommCtrl.extend({

	initial: function(){
		this.chart = this.abSpMetricAvpSiteChart;
	},

	addRestriction: function(obj, restriction){
		this.addSiteClauses(obj, restriction);
	},

	setSqlParameters: function(){
	}
})