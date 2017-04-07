var controller = View.createController('abRrRoomArrangeDetails_Controller', {
    blId: null,
    flId: null,
    rmId: null,
	dwgname:null,
    
    //----------------event handle--------------------
    
    afterInitialDataFetch: function(){
        this.abRrRoomArrangeDetails_DrawingPanel.appendInstruction("default", "", "");
        this.abRrRoomArrangeDetails_DrawingPanel.addEventListener('ondwgload', this.onDwgLoaded);
    },
    
    onDwgLoaded: function(){
        var dwgCtrl = View.panels.get('abRrRoomArrangeDetails_DrawingPanel');
		dwgCtrl.setTitle(controller.blId + '-' + controller.flId + '-' + controller.rmId);
    },
    
    abRrRoomArrangeDetails_RoomArrange_Form_afterRefresh: function(){
        this.blId = this.abRrRoomArrangeDetails_RoomArrange_Form.getFieldValue('rm_arrange.bl_id');
        this.flId = this.abRrRoomArrangeDetails_RoomArrange_Form.getFieldValue('rm_arrange.fl_id');
        this.rmId = this.abRrRoomArrangeDetails_RoomArrange_Form.getFieldValue('rm_arrange.rm_id');
		this.dwgname = this.abRrRoomArrangeDetails_RoomArrange_Form.getFieldValue('rm.dwgname');
		
		var dcl = new Ab.drawing.DwgCtrlLoc(this.blId, this.flId, this.rmId, this.dwgname);
        this.abRrRoomArrangeDetails_DrawingPanel.findAsset(dcl,null,true);
    }
});
