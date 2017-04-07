var abSpAllocOratePctBlChartCtrl = abSpAllocOrateChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpAllocOratePctBlChart;
	},

	addRestriction: function(obj, restriction){
		this.addOccupancyRateClauses(obj, restriction);
		this.addBuildingClauses(obj, restriction);
	},

	setSqlParameters: function(){
		this.chart.addParameter('yAxisOption', "rm.bl_id");
		this.setOccupancyRateTitleSqlParameters();
	}
})