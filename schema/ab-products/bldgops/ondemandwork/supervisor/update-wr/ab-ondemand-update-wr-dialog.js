
var controller = View.createController('abOndemandUpdateWrDialogController', {

    //----------------event handle--------------------
    afterViewLoad: function(){
    	
		var drawingPanel = View.panels.get('abOndemandUpdateWrDialog_DrawingPanel');
		
		//set the default drawing panel title
        drawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
        
        //get location information from parent controller 
		var c=View.getOpenerView().controllers.items[0];
		var blId = c.locArray[0];
		var flId = c.locArray[1];
		var rmId = c.locArray[2];
		
		//set restriction of query dwg name
		var rest = new Ab.view.Restriction();
		rest.addClause("rm.dwgname","","IS NOT NULL");
		rest.addClause("rm.bl_id", blId, "=");
		rest.addClause("rm.fl_id", flId, "=");
		//KB3037458 - only add room restriction when room code is not empty
		if(rmId){
			rest.addClause("rm.rm_id", rmId, "=");
		}
		
		//query the dwg name
		var record = this.abOndemandUpdateWrDialog_rmHighlight.getRecord(rest);
		var dwgName = record.values['rm.dwgname'];
		
		//load the dwg into drawing control
		var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, rmId, dwgName);
		drawingPanel.addDrawing(dcl);
		
		//set the drawing panel title with location information
		var title = String.format(getMessage('drawingPanelTitle1'), blId + "-" + flId+"-"+rmId+"");
		drawingPanel.appendInstruction("default", "", title);
		drawingPanel.processInstruction("default", "");
		
    }
});

