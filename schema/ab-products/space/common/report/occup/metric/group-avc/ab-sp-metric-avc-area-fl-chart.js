var abSpMetricAvcFlChartCtrl = abSpAllocTrendMetricChartCommCtrl.extend({

	initial: function(){
		this.chart = this.abSpMetricAvcAreaFlChart;
	},

	addRestriction: function(obj, restriction){
		this.addFloorClauses(obj, restriction);
		this.addRoomCategoryClauses(obj, restriction);
	},

	setSqlParameters: function(){
		this.chart.addParameter('yAxisOption', "RTRIM(rm.bl_id)${sql.concat}'-'${sql.concat}RTRIM(rm.fl_id)");
	}
})