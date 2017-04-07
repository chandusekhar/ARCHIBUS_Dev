var abSpAllocAllCountFlChartCtrl = abSpAllocAllTypeChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpAllocAllCountFlChart;
	},

	addRestriction: function(obj, restriction){
		this.addFloorClauses(obj, restriction);
		this.addSpaceTypeClauses(obj, restriction);
	},

	setSqlParameters: function(){
		this.chart.addParameter('yAxisOption', "RTRIM(rm.bl_id)${sql.concat}'-'${sql.concat}RTRIM(rm.fl_id)");
		this.setAllTypeTitleSqlParameters();
	}
})