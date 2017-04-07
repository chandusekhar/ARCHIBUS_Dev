var abSpAllocScatAreaCatChartCtrl = abSpAllocCatChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpAllocScatAreaCatChart;
	},

	addRestriction: function(obj, restriction){
		this.addSuperCategoryClauses(obj, restriction);
		this.addRoomCategoryClauses(obj, restriction);
	}
})