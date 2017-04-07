
var controller = View.createController('hlRmByStdController', {

    //----------------event handle--------------------
    afterViewLoad: function(){
        this.abSpHlRmByRmStd_DrawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
        this.abSpHlRmByRmStd_DrawingPanel.addEventListener('onclick', onClickDrawingHandler);
       
    }
    
});

var  buildingId='';
var floorId='';

function showDrawing(){
    var drawingPanel = View.panels.get('abSpHlRmByRmStd_DrawingPanel');
    var buildingDrawing = View.panels.get('ab-wr-highlt-active-select-floor');
    buildingId = buildingDrawing.rows[buildingDrawing.selectedRowIndex]["su.bl_id"];
    floorId = buildingDrawing.rows[buildingDrawing.selectedRowIndex]["su.fl_id"];
    var dwgname = buildingDrawing.rows[buildingDrawing.selectedRowIndex]["su.dwgname"];
    var title = String.format(getMessage('drawingPanelTitle1') + "  " + buildingId + "-" + floorId);
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause('su.bl_id', buildingId, '=');
    restriction.addClause('su.fl_id', floorId, '=');
    
    displayFloor(drawingPanel, buildingId, floorId, dwgname, title);
    View.panels.get('abSpHlVacSu_suGrid').refresh(restriction);
}

function displayFloor(drawingPanel, blId, flId, dwgname, title){

    if (drawingPanel.lastLoadedBldgFloor == dwgname) {
        drawingPanel.clearHighlights();
        drawingPanel.applyDS('highlight');
    }
    else {
        var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, dwgname);
        drawingPanel.addDrawing(dcl);
        drawingPanel.lastLoadedBldgFloor = dwgname;
    }
    
    drawingPanel.appendInstruction("default", "", title);
    drawingPanel.processInstruction("default", "");
}


//onclick  event


 function onClickDrawingHandler(pk, selected){
    var blid=pk[0];
    
        var flid=pk[1];
        var suid=pk[2];

       if (selected) {
      
       var restriction = new Ab.view.Restriction();
       
       
      restriction.addClause('su.bl_id', blid, '=');
      restriction.addClause('su.fl_id', flid, '=');
      restriction.addClause('su.su_id', suid, '=');

     
        var suDetailPanel = View.panels.get('abSuHlvacantSu_suDetailPanel');
        suDetailPanel.refresh(restriction);
        suDetailPanel.show(true);
        suDetailPanel.showInWindow({
            width: 500,
            height: 250
        });
        
          var drawingPanel = View.panels.get('abSpHlRmByRmStd_DrawingPanel');
        drawingPanel.setTitleMsg(drawingPanel.instructs["default"].msg);
       
    }  
    }
