/**
 * Example for floor plans with Enterprise BIM Viewer
 * To display other published 3D models, delete the dataSource restriction in ab-ex-bim-3d-rm-example.axvw for selecting floors.
 */
var abExBimCtrl = View.createController('abExRecurringFormEditCtrl', {
	 afterInitialDataFetch: function() {
		 this.withLegendFloorSelector_floors.enableSelectAll(false);
		 this.withLegendFloorSelector_floors.setFilterValue('rm.bl_id', 'NB');
		 this.withLegendFloorSelector_floors.refresh();
	 },
	afterViewLoad: function(){
		 this.on('app:bim:rooms:example:openSelectRoomPanel', this.openSelectRoomPanel);
	},
	
	selectRoom: function(){
		var row = this.withLegendFloorSelector_legendGrid.rows[this.withLegendFloorSelector_legendGrid.selectedRowIndex];
		this.trigger('app:bim:example:selectRoom', row, this.withLegendFloorSelector_legendGrid.rows);
	},
	
	openSelectRoomPanel: function(restriction){
		this.withLegendFloorSelector_legendGrid.refresh(restriction);
	},
	
    hideSelectRoomPanel: function(){
    	this.withLegendFloorSelector_legendGrid.show(false);
    },
    
    withLegendFloorSelector_floors_onMultipleSelectionChange: function(row) {
    	this.trigger('app:bim:example:addFloorPlan', row, this.withLegendFloorSelector_floors);
    }
    
})