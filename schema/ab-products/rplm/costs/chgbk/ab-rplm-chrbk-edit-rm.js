var editRoomsController = View.createController('editRoomsCtrl', {
	bl_id: null,
	fl_id: null,
    afterInitialDataFetch: function(){
    },
    gridBuildings_onRefresh: function(){
        this.gridBuildings.refresh();
    },
    gridFloors_onRefresh: function(){
        this.gridFloors.refresh();
    },
    gridRooms_onAddNew: function(){
        if (this.bl_id == null) {
            View.showMessage(getMessage('err_no_building_selected'));
        }
		else if(this.fl_id == null) {
            View.showMessage(getMessage('err_no_floor_selected'));
		}
        else {
		    var restriction = new Ab.view.Restriction();
		    restriction.addClause('rm.bl_id', this.bl_id);
		    restriction.addClause('rm.fl_id', this.fl_id);
		    
		    View.openDialog('ab-rplm-chrbk-editroom.axvw', restriction, true, {});
        }
    },
    gridRooms_onRefresh: function(){
        this.gridRooms.refresh();
    }
});

function loadFloorsByBuilding(row){
	var bl_id = row['bl.bl_id'];
    editRoomsController.bl_id = bl_id;
    editRoomsController.gridFloors.addParameter('customRestriction','fl.bl_id = \'' + bl_id + '\'');
    editRoomsController.gridFloors.refresh();
    editRoomsController.gridRooms.show(false);
}

function loadRoomsByFloor(row){
	var bl_id = row['fl.bl_id'];
    var fl_id = row['fl.fl_id'];
    editRoomsController.bl_id = bl_id;
    editRoomsController.fl_id = fl_id;
    editRoomsController.gridRooms.addParameter('customRestriction',
													'rm.bl_id = \'' + bl_id + '\''
													+ ' and rm.fl_id = \'' + fl_id + '\'');
    editRoomsController.gridRooms.refresh();
}

function editRoom(row){
    var bl_id = row['rm.bl_id'];
	var fl_id = row['rm.fl_id'];
	var rm_id = row['rm.rm_id'];

    var restriction = new Ab.view.Restriction();
    restriction.addClause('rm.bl_id', bl_id);
    restriction.addClause('rm.fl_id', fl_id);
    restriction.addClause('rm.rm_id', rm_id);
    
    View.openDialog('ab-rplm-chrbk-editroom.axvw', restriction, false, {});
}
