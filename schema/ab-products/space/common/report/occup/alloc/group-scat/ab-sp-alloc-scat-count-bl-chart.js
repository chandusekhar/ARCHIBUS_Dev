var abSpAllocScatCountBlChartCtrl = abSpAllocBlChartCtrl.extend({

	initial: function(){
		this.chart = this.abSpAllocScatCountBlChart;
	},

	addRestriction: function(obj, restriction){
		this.addSuperCategoryClauses(obj, restriction);
		this.addBuildingClauses(obj, restriction);
	}

})