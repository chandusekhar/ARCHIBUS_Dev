var abSpMetricOratePctDpChartCtrl = abSpAllocOrateChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpMetricOratePctDpChart;
	},

	addRestriction: function(obj, restriction){
		this.addOccupancyRateClauses(obj, restriction);
		this.addDepartmentClauses(obj, restriction);
	},

	setSqlParameters: function(){
		this.chart.addParameter('yAxisOption', "RTRIM(rm.dv_id)${sql.concat}' - '${sql.concat}RTRIM(rm.dp_id)");
		this.chart.addParameter('excludeVacant',	getMessage("vacantText"));
		this.setOccupancyRateTitleSqlParameters();
	}
})