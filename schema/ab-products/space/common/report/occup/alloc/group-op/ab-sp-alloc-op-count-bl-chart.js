var abSpAllocOpCountBlChartCtrl = abSpAllocOpChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpAllocOpCountBlChart;
		this.chart.setSolidFillColors(this.customOccupancyFillColors);
	},

	addRestriction: function(obj, restriction){
		this.addBuildingClauses(obj, restriction);
		this.addOccupancyTypeClauses(obj, restriction);
	},

	setSqlParameters: function(){
		this.chart.addParameter('yAxisOption', "rm.bl_id");
		this.setOccupancyTitleSqlParameters();
	}
})