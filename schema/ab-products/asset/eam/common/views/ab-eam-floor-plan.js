var abEamFloorPlanController = View.createController('abEamFloorPlanController', {
	restriction: null,
	
	afterViewLoad: function(){
		if(valueExists(this.view.restriction)){
			this.restriction = this.view.restriction;
		}
	},

	afterInitialDataFetch: function(){
		var blId = null;
		if(this.restriction && this.restriction.findClause('fl.bl_id')){
			blId = this.restriction.findClause('fl.bl_id').value;
		}else if(this.restriction && this.restriction.findClause('rm.bl_id')){
			blId = this.restriction.findClause('rm.bl_id').value;
		}
		var flId = null;
		if(this.restriction && this.restriction.findClause('fl.fl_id')){
			flId = this.restriction.findClause('fl.fl_id').value;
		}else if(this.restriction && this.restriction.findClause('rm.fl_id')){
			flId = this.restriction.findClause('rm.fl_id').value;
		}

		var restriction = new Ab.view.Restriction();
		restriction.addClause('fl.bl_id', blId, '=');
		restriction.addClause('fl.fl_id', flId, '=');
		
		View.getControl('', 'abEamFloorPlan_cadPanel').addDrawing(restriction, null);
	}
})