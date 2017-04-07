var abSpAllocDpCountCatChartCtrl = abSpAllocCatChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpAllocDpCountCatChart;
	},

	addRestriction: function(obj, restriction){
		this.addDepartmentClauses(obj, restriction);
		this.addRoomCategoryClauses(obj, restriction);
	}

})