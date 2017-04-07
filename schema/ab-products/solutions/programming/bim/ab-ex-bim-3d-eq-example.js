var abExBimCtrl = View.createController('abExRecurringFormEditCtrl', {
	afterInitialDataFetch: function() {
		 this.withLegendFloorSelector_buildings.setFilterValue('rm.bl_id', 'NB');
		 this.withLegendFloorSelector_buildings.refresh();
	 },
	 
	afterViewLoad: function(){
		
	},
	
	openBimView: function(){
		var row = this.withLegendFloorSelector_buildings.rows[this.withLegendFloorSelector_buildings.selectedRowIndex];
		this.trigger('app:bim:eq:example:loadModel', row);
	}
})