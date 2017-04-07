var abSpAllocDvAreaFlChartCtrl = abSpAllocFlChartCtrl.extend({

	/**
  * This function is called by base controller inside event handler afterViewLoad. 
  */
	initial: function(){
		this.chart = this.abSpAllocDvAreaFlChart;
	},

	addRestriction: function(obj, restriction){
		this.addDivisionClauses(obj, restriction);
		this.addFloorClauses(obj, restriction);
	}
})