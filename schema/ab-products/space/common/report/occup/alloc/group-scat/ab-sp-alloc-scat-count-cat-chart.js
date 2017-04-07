var abSpAllocScatCountCatChartCtrl = abSpAllocCatChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpAllocScatCountCatChart;
	},

	addRestriction: function(obj, restriction){
		this.addSuperCategoryClauses(obj, restriction);
		this.addRoomCategoryClauses(obj, restriction);
	}

})