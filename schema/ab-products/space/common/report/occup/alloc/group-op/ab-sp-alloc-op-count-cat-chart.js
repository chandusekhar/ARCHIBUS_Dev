var abSpAllocOpCountCatChartCtrl = abSpAllocOpChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpAllocOpCountCatChart;
	},

	addRestriction: function(obj, restriction){
		this.addRoomCategoryClauses(obj, restriction);
		this.addOccupancyTypeClauses(obj, restriction);
	},

	setSqlParameters: function(){
		this.chart.addParameter('yAxisOption', "rm.rm_cat");
		this.setOccupancyTitleSqlParameters();
	}
})