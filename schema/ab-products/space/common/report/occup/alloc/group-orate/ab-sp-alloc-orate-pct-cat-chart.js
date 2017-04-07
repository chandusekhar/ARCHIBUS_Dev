var abSpAllocOratePctCatChartCtrl = abSpAllocOrateChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpAllocOratePctCatChart;
	},

	addRestriction: function(obj, restriction){
		this.addOccupancyRateClauses(obj, restriction);
		this.addRoomCategoryClauses(obj, restriction);
	},

	setSqlParameters: function(){
		this.chart.addParameter('yAxisOption', "rm.rm_cat");
		this.setOccupancyRateTitleSqlParameters();
	}

})