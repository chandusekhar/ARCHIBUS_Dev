var abSpMetricAvcBlChartCtrl = abSpAllocTrendMetricChartCommCtrl.extend({

	initial: function(){
		this.chart = this.abSpMetricAvcAreaBlChart;
	},

	addRestriction: function(obj, restriction){
		this.addBuildingClauses(obj, restriction);
		this.addRoomCategoryClauses(obj, restriction);
	},

	setSqlParameters: function(){
		this.chart.addParameter('yAxisOption', "rm.bl_id");
	}
})