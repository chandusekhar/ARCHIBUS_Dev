var abSpAllocAllAreaCatChartCtrl = abSpAllocAllTypeChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpAllocAllAreaCatChart;
	},

	addRestriction: function(obj, restriction){
		this.addRoomCategoryClauses(obj, restriction);
		this.addSpaceTypeClauses(obj, restriction);
	},

	setSqlParameters: function(){
		this.chart.addParameter('yAxisOption', "rm.rm_cat");
		this.setAllTypeTitleSqlParameters();
	}

})