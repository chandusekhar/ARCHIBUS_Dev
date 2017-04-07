
$(document).ready(function (){
    validate();
    $('activity_log.bl_id, activity_log.fl_id').change(validate);
});

function validate(){
    if ($('activity_log.bl_id').val().length   >   0   &&
        $('activity_log.fl_id').val().length  >   0) {
        $("input[type=button]").prop("disabled", false);
    }
    else {
        $("input[type=button]").prop("disabled", true);
    }
}

View.createController('drawingSelectValue', {
	
	wr_create_details_onSelectRoom: function() {
	    var buildingId = this.wr_create_details.getFieldValue('activity_log.bl_id');
	    var floorId = this.wr_create_details.getFieldValue('activity_log.fl_id');
	    var roomId = this.wr_create_details.getFieldValue('activity_log.rm_id');
	        
	    var restriction = new Ab.view.Restriction();
	    restriction.addClause('activity_log.bl_id', buildingId);
	    restriction.addClause('activity_log.fl_id', floorId);
	    restriction.addClause('activity_log.rm_id', roomId);
	    
		if (buildingId == '' || floorId == '') {
			
			alert('Please select Building and Floor first');
	 
	    }
		else {
			var controller = this;
			View.openDialog('uc-wr-drawing-select-room.axvw', restriction, false, {
				callback: function(res) {
					var clause = res.clauses[2];
					var value = clause.value;
					controller.wr_create_details.setFieldValue('activity_log.rm_id', value);
				}
			});
			
		}
  }
	
});

