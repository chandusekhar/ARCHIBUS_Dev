var abSpAllocAllCountBlChartCtrl = abSpAllocAllTypeChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpAllocAllCountBlChart;
	},

	addRestriction: function(obj, restriction){
		this.addBuildingClauses(obj, restriction);
		this.addSpaceTypeClauses(obj, restriction);
	},

	setSqlParameters: function(){
		this.chart.addParameter('yAxisOption', "rm.bl_id");
		this.setAllTypeTitleSqlParameters();
	}
})