var abSpAllocDvCountCatChartCtrl = abSpAllocTrendMetricChartCommCtrl.extend({

	initial: function(){
		this.chart =  this.abSpAllocDvCountCatChart;
	},

	addRestriction: function(obj, restriction){
		this.addDivisionClauses(obj, restriction);
		this.addRoomCategoryClauses(obj, restriction);
	}

})