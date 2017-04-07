var abSpMetricOratePctBlChartCtrl = abSpAllocOrateChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpMetricOratePctBlChart;
	},

	addRestriction: function(obj, restriction){
		this.addOccupancyRateClauses(obj, restriction);
		this.addBuildingClauses(obj, restriction);
	},

	setSqlParameters: function(){
		this.chart.addParameter('yAxisOption', "rm.bl_id");
		this.chart.addParameter('excludeVacant',	getMessage("vacantText"));
		this.setOccupancyRateTitleSqlParameters();
	}
})