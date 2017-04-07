var abSpMetricAvpBlChartCtrl = abSpAllocTrendMetricChartCommCtrl.extend({

	initial: function(){
		this.chart = this.abSpMetricAvpBlChart;
	},

	addRestriction: function(obj, restriction){
		this.addBuildingClauses(obj, restriction);
	},

	setSqlParameters: function(){
		this.chart.addParameter('yAxisOption', "rm.bl_id");
	}
})