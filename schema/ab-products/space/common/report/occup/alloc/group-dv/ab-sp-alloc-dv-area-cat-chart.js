var abSpAllocDvAreaCatChartCtrl = abSpAllocTrendMetricChartCommCtrl.extend({

	initial: function(){
		this.chart =  this.abSpAllocDvAreaCatChart;
	},

	addRestriction: function(obj, restriction){
		this.addDivisionClauses(obj, restriction);
		this.addRoomCategoryClauses(obj, restriction);
	}
})