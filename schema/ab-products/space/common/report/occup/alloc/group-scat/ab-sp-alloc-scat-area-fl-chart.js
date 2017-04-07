var abSpAllocScatAreaFlChartCtrl = abSpAllocFlChartCtrl.extend({

	/**
  * This function is called by base controller inside event handler afterViewLoad. 
  */
	initial: function(){
		this.chart = this.abSpAllocScatAreaFlChart;
	},

	addRestriction: function(obj, restriction){
		this.addSuperCategoryClauses(obj, restriction);
		this.addFloorClauses(obj, restriction);
	}
})