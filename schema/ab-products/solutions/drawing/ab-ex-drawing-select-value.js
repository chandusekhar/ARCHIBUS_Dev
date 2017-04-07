
View.createController('drawingSelectValue', {
	
	exDrawingSelectValue_form_onSelectRoom: function() {
	    var buildingId = this.exDrawingSelectValue_form.getFieldValue('wr.bl_id');
	    var floorId = this.exDrawingSelectValue_form.getFieldValue('wr.fl_id');
	    var roomId = this.exDrawingSelectValue_form.getFieldValue('wr.rm_id');
	        
	    var restriction = new Ab.view.Restriction();
	    restriction.addClause('wr.bl_id', buildingId);
	    restriction.addClause('wr.fl_id', floorId);
	    restriction.addClause('wr.rm_id', roomId);
	    
        var controller = this;
        View.openDialog('ab-ex-select-room.axvw', restriction, false, {
            callback: function(res) {
                var clause = res.clauses[2];
                var value = clause.value;
                controller.exDrawingSelectValue_form.setFieldValue('wr.rm_id', value);
            }
        });
	}
	
});

