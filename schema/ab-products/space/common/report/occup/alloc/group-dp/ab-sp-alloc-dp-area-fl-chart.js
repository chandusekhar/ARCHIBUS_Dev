var abSpAllocDpAreaFlChartCtrl = abSpAllocFlChartCtrl.extend({

	/**
  * This function is called by base controller inside event handler afterViewLoad. 
  */
	initial: function(){
		this.chart =  this.abSpAllocDpAreaFlChart;
	},

	addRestriction: function(obj, restriction){
		this.addDepartmentClauses(obj, restriction);
		this.addFloorClauses(obj, restriction);
	}
})