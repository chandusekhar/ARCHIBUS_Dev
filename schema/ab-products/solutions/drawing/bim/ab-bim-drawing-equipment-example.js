var abExBimCtrl = View.createController('abExRecurringFormEditCtrl', {
	afterViewLoad: function(){
		
	},
	
	openBimView: function(){
		var row = this.withLegendFloorSelector_buildings.rows[this.withLegendFloorSelector_buildings.selectedRowIndex];
		this.trigger('app:bim:eq:example:loadModel', row);
	}
})