
var controller = View.createController('hlRmByStdController', {

    //----------------event handle--------------------
    afterViewLoad: function(){
        this.abSpHlRmByRmStd_DrawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
         this.abSpHlRmByRmStd_DrawingPanel.addEventListener('onclick', onClickDrawingHandler);
     
        abSpHlRmByRequest();
    }
    
});

    
    
    function abSpHlRmByRequest(){
        var drawingPanel = View.panels.get('abSpHlRmByRmStd_DrawingPanel');
    
        var restriction = opener.drawingRestriction;
        var filterBlId = restriction.blId;
        var filterFlId = restriction.flId;
        var restriction = new Ab.view.Restriction();
        restriction.addClause('rm.bl_id', filterBlId, '=');
        restriction.addClause('rm.fl_id', filterFlId, '=');
        var ds = View.dataSources.get("ds_ab-wr-request-select-value-from-highlight-rooms_dwgname");
		var rmRecord = ds.getRecord(restriction);
		var dwgname = rmRecord.getValue("rm.dwgname");
		var dcl = new Ab.drawing.DwgCtrlLoc(filterBlId, filterFlId, null, dwgname);
       
        var title = String.format(getMessage('drawingPanelTitle1') + "  "+filterBlId + "-" + filterFlId);
        displayFloor(drawingPanel, filterBlId,filterFlId,dwgname, title);

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
   
       rmFieldElement = opener.document.getElementById('wr.rm_id');
 
        if (!rmFieldElement) {
            rmFieldElement = opener.document.getElementsByName('wr.rm_id')[0];
        }
      
    
        rmFieldElement.value = pk[2];
        
        window.close();
        rmFieldElement.focus();
    }



