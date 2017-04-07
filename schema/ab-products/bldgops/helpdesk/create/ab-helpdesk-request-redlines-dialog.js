
var controller = View.createController('abHelpdeskRequestRedlinesController', {

    afterViewLoad: function(){
        this.abHelpdeskRedlinesDialog_DrawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
		var drawingPanel = View.panels.get('abHelpdeskRedlinesDialog_DrawingPanel');
		
		var c=View.getOpenerView().controllers.items[0];
		if(valueExistsNotEmpty(c) && valueExistsNotEmpty(c.locArray)){
			var blId = c.locArray[0];
			var flId = c.locArray[1];
			var rmId = c.locArray[2];
			
			var rest = new Ab.view.Restriction();
			rest.addClause("rm.bl_id", blId, "=");
			rest.addClause("rm.fl_id", flId, "=");
			
			var record = null;
			if(valueExistsNotEmpty(rmId)){ //service request for specific room, so highlight room on drawing
				rest.addClause("rm.rm_id",rmId,"=");
				record = this.abHelpdeskRedlinesDialog_roomDS.getRecord(rest);
				var dwgName = record.values['rm.dwgname'];
				var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, rmId, dwgName);
				drawingPanel.highlightAssetsFromDcl(null,dcl);
			} else { //service request for floor, show floor plan
				var records = this.abHelpdeskRedlinesDialog_roomDS.getRecords(rest);
				if(records == null || records.length == 0){
					alert(getMessage("noFloorPlan"));
					View.closeThisDialog();
					return;
				} else {
					record = records[0];
					var dwgName = record.values['rm.dwgname'];
					var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgName);
					drawingPanel.addDrawing(dcl);
				}
				
				
			}			
			var title = String.format(getMessage('drawingPanelTitle1'), blId + "-" + flId);
			
			drawingPanel.redmarksEnabled = true;
			drawingPanel.appendInstruction("default", "", title);
			drawingPanel.processInstruction("default", "");

		}
	},
    
    abHelpdeskRedlinesDialog_DrawingPanel_onSave:function(){
    	var c=View.getOpenerView().controllers.items[0];
    	
    	if(this.abHelpdeskRedlinesDialog_DrawingPanel.saveRedmarksForServiceRequest(c.activityLogId)){
    		c.refreshDocsPanel();
    	}
    	
    	
    }
    
});

