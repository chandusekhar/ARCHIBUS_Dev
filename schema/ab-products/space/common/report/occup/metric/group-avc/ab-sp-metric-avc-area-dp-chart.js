var abSpMetricAvcDpChartCtrl = abSpAllocTrendMetricChartCommCtrl.extend({

	initial: function(){
		this.chart = this.abSpMetricAvcAreaDpChart;
	},

	addRestriction: function(obj, restriction){
		this.addDepartmentClauses(obj, restriction);
		this.addRoomCategoryClauses(obj, restriction);
	},

	setSqlParameters: function(){
		this.chart.addParameter('yAxisOption', "RTRIM(rm.dv_id)${sql.concat}' - '${sql.concat}RTRIM(rm.dp_id)");
	}
})