var abSpAllocOpCountFlChartCtrl = abSpAllocOpChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpAllocOpCountFlChart;
	},

	addRestriction: function(obj, restriction){
		this.addFloorClauses(obj, restriction);
		this.addOccupancyTypeClauses(obj, restriction);
	},

	setSqlParameters: function(){
		this.chart.addParameter('yAxisOption', "RTRIM(rm.bl_id)${sql.concat}'-'${sql.concat}RTRIM(rm.fl_id)");
		this.setOccupancyTitleSqlParameters();
	}
})