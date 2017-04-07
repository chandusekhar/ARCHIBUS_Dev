
var controller = View.createController('hlRmByStdController', {

    //----------------event handle--------------------
    afterViewLoad: function(){
        this.abWrHighltActive_DrawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
        this.abWrHighltActive_DrawingPanel.addEventListener('onclick', onClickDrawingHandler);
    }
    
});



function showDrawing(){

    var buildingId = '';
    var floorId = '';
    var drawingPanel = View.panels.get('abWrHighltActive_DrawingPanel');
    var buildingDrawing = View.panels.get('ab-wr-highlt-active-select-floor');
    buildingId = buildingDrawing.rows[buildingDrawing.selectedRowIndex]["rm.bl_id"];
    floorId = buildingDrawing.rows[buildingDrawing.selectedRowIndex]["rm.fl_id"];
    var dwgname = buildingDrawing.rows[buildingDrawing.selectedRowIndex]["rm.dwgname"];
    
    var title = String.format(getMessage('drawingPanelTitle1') + "  " + buildingId + "-" + floorId);
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause('rm.bl_id', buildingId, '=');
    restriction.addClause('rm.fl_id', floorId, '=');
    
    
    
    displayFloor(drawingPanel, buildingId,floorId,dwgname, title);
    View.panels.get('abWrHighltActive_rmGrid').refresh(restriction);
}

function displayFloor(drawingPanel, selectedBl, selectedFl,selectedDwgName, title){

    if (drawingPanel.lastLoadedBldgFloor == selectedDwgName) {
        drawingPanel.clearHighlights();
        drawingPanel.applyDS('highlight');
    }
    else {
		var dcl = new Ab.drawing.DwgCtrlLoc(selectedBl, selectedFl, null, selectedDwgName);
        drawingPanel.addDrawing(dcl);
        drawingPanel.lastLoadedBldgFloor = selectedDwgName;
    }
    
    drawingPanel.appendInstruction("default", "", title);
    drawingPanel.processInstruction("default", "");
}


//onclick  event


function onClickDrawingHandler(pk, selected){
    var blid = pk[0];
    var flid = pk[1];
    var rmid = pk[2];
    if (selected) {
        var restriction = new Ab.view.Restriction();
        
        restriction.addClause('wr.bl_id', blid, '=');
        restriction.addClause('wr.fl_id', flid, '=');
        restriction.addClause('wr.rm_id', rmid, '=');
        
        var rmDetailPanel = View.panels.get('abWrHighltActive_rmDetailPanel');
        rmDetailPanel.refresh(restriction);
        rmDetailPanel.show(true);
        rmDetailPanel.showInWindow({
            width: 1000,
            height: 500
        });
        
        var drawingPanel = View.panels.get('abWrHighltActive_DrawingPanel');
        drawingPanel.setTitleMsg(drawingPanel.instructs["default"].msg);
        
    }
}



