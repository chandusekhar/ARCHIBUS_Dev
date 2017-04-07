var abSpAllocCatAreaFlChartCtrl = abSpAllocFlChartCtrl.extend({

	/**
  * This function is called by base controller inside event handler afterViewLoad. 
  */
	initial: function(){
		this.chart = this.abSpAllocCatAreaFlChart;
	},

	addRestriction: function(obj, restriction){
		this.addCategoryClauses(obj, restriction);
		this.addFloorClauses(obj, restriction);
	}
})