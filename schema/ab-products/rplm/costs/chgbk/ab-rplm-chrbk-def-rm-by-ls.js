var defineRoomsController = View.createController('defineRoomsCtrl', {
    ls_id: null,
    afterInitialDataFetch: function(){
        enableFormRoomButton(false , false, false);
    },
    gridLeases_onRefresh: function(){
        this.gridLeases.refresh();
    },
    gridRooms_onAddNew: function(){
        if (this.ls_id == null) {
            View.showMessage(getMessage('err_no_lease_selected'));
        }
        else {
            this.formRoom.refresh('', true);
            this.formRoom.setFieldValue('rm.ls_id', this.ls_id);
            enableFormRoomButton(true, false, true);
        }
    },
    gridRooms_onRefresh: function(){
        this.gridRooms.refresh();
    },
    formRoom_onSaveRoom: function(){
        if (this.ls_id == null) {
            View.showMessage(getMessage('err_save'));
        }
        else{ 
            if (this.formRoom.save()) {
                this.gridRooms.refresh();
                this.formRoom.addParameter('customRestriction', 'rm.rm_id = null');
                this.formRoom.restriction = null; 
                this.formRoom.show(false);
            }
        }
    },
    formRoom_onCancelRoom: function(){
        this.formRoom.show(false);
    },
    formRoom_onDeleteRoom: function(){
        var controller = this;
        View.confirm(getMessage('confirm_delete_room'), function(button){
            if (button == 'yes') {
                controller.formRoom.deleteRecord();
                controller.formRoom.show(false);
                controller.gridRooms.refresh();
            }
            else 
                this.close();
        })
    }
});

function loadRoomsByLeases(row){
    var ls_id = row['ls.ls_id'];
    defineRoomsController.ls_id = ls_id;
    defineRoomsController.gridRooms.addParameter('customRestriction', 'rm.ls_id = \'' + ls_id + '\'');
    defineRoomsController.gridRooms.refresh();
	defineRoomsController.formRoom.show(false);
}

function editRoom(row){
    var bl_id = row['rm.bl_id'];
	var fl_id = row['rm.fl_id'];
	var rm_id = row['rm.rm_id'];
    defineRoomsController.formRoom.addParameter('customRestriction',
												'rm.bl_id = \'' + bl_id + '\''
												+ ' and rm.fl_id = \'' + fl_id + '\''
												+ ' and rm.rm_id = \'' + rm_id + '\'');
    defineRoomsController.formRoom.newRecord = false;
	defineRoomsController.formRoom.refresh();
}

function enableFormRoomButton(enableSave, enableDelete, enableCancel){
    defineRoomsController.formRoom.enableButton('saveRoom', enableSave);
    defineRoomsController.formRoom.enableButton('deleteRoom', enableDelete);
    defineRoomsController.formRoom.enableButton('cancelRoom', enableCancel);
}
