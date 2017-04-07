var allocatedFormController = View.createController('allocatedFormController', {

    searchRoomConsole_onSearch: function(){
        var blId = this.searchRoomConsole.getFieldValue("rm.bl_id");
        var flId = this.searchRoomConsole.getFieldValue("rm.fl_id");
        var roomsGrid = this.roomsGrid;

        if (blId) {
            roomsGrid.addParameter('blId', "='" + blId+"'");
        }
        else {
            roomsGrid.addParameter('blId', 'IS NOT NULL');
        }
        if (flId) {
            roomsGrid.addParameter('flId',  "='" + flId+"'");
        }
        else {
            roomsGrid.addParameter('flId', 'IS NOT NULL');
        }
        
        var selectedEL = document.getElementById("allocate_type");
		var allocateType = selectedEL.options[selectedEL.selectedIndex].value;
		
        if (allocateType == 'all') {
            roomsGrid.addParameter('tag', '!= ');
        }
        else 
            if (allocateType == 'over-allocated') {
             roomsGrid.addParameter('tag', '< '+' ');
            }
            else 
                if (allocateType == 'Under-allocated') {
                    roomsGrid.addParameter('tag', ' > '+' ');
                }
				roomsGrid.refresh();
				this.bookingsGrid.show(false);
				this.bookingForm.show(false);
				
    },
    searchRoomConsole_onClear: function(){
        this.searchRoomConsole.clear();
        this.roomsGrid.show(false);
		this.roomsGrid.show(false);
        this.bookingsGrid.show(false);
        this.bookingForm.show(false);
    },

    bookingForm_afterRefresh: function(){
		if(this.bookingForm.getFieldValue('rmpct.activity_log_id')){
            this.bookingForm.enableField("rmpct.date_start", false);
            this.bookingForm.enableField("rmpct.date_end", false);
            this.bookingForm.enableField("rmpct.pct_space", false);
            this.bookingForm.actions.get('save').enabled = false;
		}
		else{
            this.bookingForm.enableField("rmpct.date_start", true);
            this.bookingForm.enableField("rmpct.date_end", true);
            this.bookingForm.enableField("rmpct.pct_space", true);
            this.bookingForm.actions.get('save').enabled = true;
		}
    }
})

function roomReportOnClick(){
   //1 get pms_id 
    var roomsGrid = View.panels.get('roomsGrid');
    var selectedRow = roomsGrid.rows[roomsGrid.selectedRowIndex];
    var blId = selectedRow["rm.bl_id"];
    var flId = selectedRow["rm.fl_id"];
	var rmId = selectedRow["rm.rm_id"];
	var excludeNullArea =  $('excludeNullArea').checked;

    //2 refresh the form panels
    var restriction = new Ab.view.Restriction();
    restriction.addClause("rmpct.bl_id", blId, "=");
	restriction.addClause("rmpct.fl_id", flId, "=");
	restriction.addClause("rmpct.rm_id", rmId, "=");
	if(excludeNullArea){
		restriction.addClause("rmpct.area_rm", 0, ">");
	}
	View.panels.get('bookingsGrid').refresh(restriction);
	View.panels.get('bookingForm').show(false);
}