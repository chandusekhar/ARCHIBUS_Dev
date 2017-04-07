var abExBimCtrl = View.createController('abExRecurringFormEditCtrl', {
	afterViewLoad: function(){
		 this.on('app:bim:rooms:example:openSelectRoomPanel', this.openSelectRoomPanel);
		 this.on('app:bim:rooms:example:hideSelectRoomPanel', this.hideSelectRoomPanel);
	},
	
	openBimView: function(){
		var row = this.withLegendFloorSelector_floors.rows[this.withLegendFloorSelector_floors.selectedRowIndex];
		this.trigger('app:bim:example:addFloorPlan', row);
	},
	
	selectRoom: function(){
		var row = this.withLegendFloorSelector_legendGrid.rows[this.withLegendFloorSelector_legendGrid.selectedRowIndex];
		this.trigger('app:bim:example:selectRoom', row);
	},
	
	openSelectRoomPanel: function(selectedFloorRow){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('rm.bl_id', selectedFloorRow['rm.bl_id'], '=');
		restriction.addClause('rm.fl_id', selectedFloorRow['rm.fl_id'], '=');
		this.withLegendFloorSelector_legendGrid.refresh(restriction);
	},
	
    hideSelectRoomPanel: function(){
    	this.withLegendFloorSelector_legendGrid.show(false);
    }
    
})