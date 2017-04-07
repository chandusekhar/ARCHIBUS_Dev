var selectFloorController = View.extendController('selectFloorController', selectLocationBaseController, {
    
    selectPanel_onClickItem: function(row) {
    	var parentPanel = this.getParentPanel();
    	var parentTable = this.getParentTable(parentPanel);
        
        parentPanel.setFieldValue(parentTable + ".bl_id", row.getFieldValue("fl.bl_id"));
        parentPanel.setFieldValue(parentTable + ".fl_id", row.getFieldValue("fl.fl_id"));
        View.closeThisDialog();
    }

});