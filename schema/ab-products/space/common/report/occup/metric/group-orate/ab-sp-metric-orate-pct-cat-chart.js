var abSpMetricOratePctCatChartCtrl = abSpAllocOrateChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpMetricOratePctCatChart;
	},

	addRestriction: function(obj, restriction){
		this.addOccupancyRateClauses(obj, restriction);
		this.addRoomCategoryClauses(obj, restriction);
	},

	setSqlParameters: function(){
		this.chart.addParameter('yAxisOption', "rm.rm_cat");
		this.chart.addParameter('excludeVacant',	getMessage("vacantText"));
		this.setOccupancyRateTitleSqlParameters();
	}

})