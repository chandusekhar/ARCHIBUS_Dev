var abNoHotelController = View.createController('abHotelHlController', {
     afterInitialDataFetch: function(){

        var locRec = View.getOpenerView().locRecord;
		var blId = locRec.getValue("rmpct.bl_id");
		var flId = locRec.getValue("rmpct.fl_id");
		var rmId = locRec.getValue("rmpct.rm_id");
		var dwgName = locRec.getValue("rmpct.dwgname");
		if(!dwgName){
			dwgName = locRec.getValue("rm.dwgname");
		}
		var drawingPanel = View.panels.get('abHotelDrawingPanel');
        drawingPanel.appendInstruction("default", "", getMessage('drawTitle1'));
		var title = String.format(getMessage('drawTitle') + ' ' + blId + '-' + flId);
		var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, rmId, dwgName);
		drawingPanel.addDrawing(dcl);
		drawingPanel.appendInstruction("default", "", title);
		drawingPanel.processInstruction("default", "");
    }
})