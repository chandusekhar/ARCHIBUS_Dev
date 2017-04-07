/**
 * @author keven.xi
 */
var controller = View.createController('hlblController', {

    //----------------event handle--------------------
    afterViewLoad: function(){
        this.locateBuilding_cadPanel.appendInstruction("default", "", getMessage("falsh_headerMessage"));
    }
    
});

function highlightSelectedBuilding(){
    // Call the drawing control to highlight the selected building
    var blGrid = View.panels.get("blGrid");
    var selectedRow = blGrid.rows[blGrid.selectedRowIndex];
    
    var highDs = View.dataSources.get("ds_ab-campus-map_drawing_blHighlight");
    highDs.addParameter('blId', selectedRow['bl.bl_id']);
	var drawingPanel = View.getControl('', 'locateBuilding_cadPanel');
	
    var tempDwgname = selectedRow['bl.dwgname'];
    if (drawingPanel.lastLoadedDwgname == tempDwgname) {
        drawingPanel.clearHighlights();
        drawingPanel.applyDS('highlight');
    }
    else {
        var dcl = new Ab.drawing.DwgCtrlLoc('', '', '', selectedRow['bl.dwgname']);
        drawingPanel.addDrawing(dcl, null);
        drawingPanel.lastLoadedDwgname = tempDwgname;
    }
	
	//change the title of drawing panel
    var drawingPanelTitle = getMessage("falsh_headerMessage") + " " + selectedRow['bl.bl_id'];
    drawingPanel.appendInstruction("default", "", drawingPanelTitle);
    drawingPanel.processInstruction("default", "");
}


