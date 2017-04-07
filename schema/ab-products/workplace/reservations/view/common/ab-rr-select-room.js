var selectRoomController = View.extendController('selectRoomController', selectLocationBaseController, {
	
    selectPanel_onClickItem: function(row) {
        var parentPanel = this.getParentPanel();
        var parentTable = this.getParentTable(parentPanel);
        
        parentPanel.setFieldValue(parentTable + ".bl_id", row.getFieldValue("rm.bl_id"));
        parentPanel.setFieldValue(parentTable + ".fl_id", row.getFieldValue("rm.fl_id"));
        parentPanel.setFieldValue(parentTable + ".rm_id", row.getFieldValue("rm.rm_id"));
        View.closeThisDialog();
    }

});