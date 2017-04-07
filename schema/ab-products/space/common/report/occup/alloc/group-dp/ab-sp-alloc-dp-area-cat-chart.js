var abSpAllocDpAreaCatChartCtrl = abSpAllocCatChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpAllocDpAreaCatChart;
	},

	addRestriction: function(obj, restriction){
		this.addDepartmentClauses(obj, restriction);
		this.addRoomCategoryClauses(obj, restriction);
	}
})