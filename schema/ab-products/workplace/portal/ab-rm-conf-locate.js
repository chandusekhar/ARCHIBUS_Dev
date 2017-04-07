/**
 * @author keven.xi
 */
var controller = View.createController('hlrmController', {


    //----------------event handle--------------------
    afterInitialDataFetch: function(){
        this.locateBuilding_cadPanel.appendInstruction("default", "", getMessage("roomDrawingPanelTitle"));
    },
    
    consolePanel_onFilter: function(){
        var restriction = this.consolePanel.getFieldRestriction();
        this.rmGrid.refresh(restriction);
    }
    
});

function highlightSelectedRoom(){

    // Call the drawing control to highlight the selected building
    var drawingPanel = View.panels.get('locateBuilding_cadPanel');
    changeHighlightDs(true, drawingPanel);
    drawingPanel.clear();
    
    var opts = new DwgOpts();
    //opts.forceload = true;
    opts.selectionMode = "0";
    opts.mode = '';
    opts.setFillColor(gAcadColorMgr.getColorFromValue('oxce0b0b', true));
    
    var roomListGrid = View.panels.get("rmGrid");
    var selectedRow = roomListGrid.rows[roomListGrid.selectedRowIndex];
    drawingPanel.lastLoadedDwgname = selectedRow["rm.dwgname"];
    
    drawingPanel.highlightAssets(opts, selectedRow);
    
    
    var drawingPanelTitle = getMessage("roomDrawingPanelTitle") + " " + selectedRow["rm.bl_id"] + '-' + selectedRow["rm.fl_id"] + '-' + selectedRow["rm.rm_id"];
    drawingPanel.appendInstruction("default", "", drawingPanelTitle);
    drawingPanel.processInstruction("default", "");
}

function highlightSelectedBuilding(){
    // Call the drawing control to highlight the selected building
    var rmGrid = View.panels.get("rmGrid");
    var selectedRow = rmGrid.rows[rmGrid.selectedRowIndex];
    
    var highDs = View.dataSources.get("ds_ab-rm-conf-locate_drawing_blHighlight");
    highDs.addParameter('blId', selectedRow['rm.bl_id']);
    var drawingPanel = View.panels.get('locateBuilding_cadPanel');
    changeHighlightDs(false, drawingPanel);
    
    var tempDwgname = selectedRow['bl.dwgname'];
    if (drawingPanel.lastLoadedDwgname == tempDwgname) {
        drawingPanel.clearHighlights();
        drawingPanel.applyDS('highlight');
    }
    else {
        var dcl = new Ab.drawing.DwgCtrlLoc('', '', '', tempDwgname);
        drawingPanel.addDrawing(dcl, null);
        drawingPanel.lastLoadedDwgname = tempDwgname;
    }
    
    //change the title of drawing panel
    var drawingPanelTitle = getMessage("campusDrawingPanelTitle") + " " + selectedRow['rm.bl_id'];
    drawingPanel.appendInstruction("default", "", drawingPanelTitle);
    drawingPanel.processInstruction("default", "");
}

function changeHighlightDs(isHighlightRm, cadPanel){
    if (isHighlightRm) {
        cadPanel.lablesDataSource = 'ds_ab-rm-conf-locate_drawing_rmLabel';
        cadPanel.highlightDataSource = '';
        cadPanel.assetTypes = "";
        
    }
    else {
        cadPanel.lablesDataSource = 'ds_ab-rm-conf-locate_drawing_blLabel';
        cadPanel.highlightDataSource = 'ds_ab-rm-conf-locate_drawing_blHighlight';
        cadPanel.assetTypes = "bl";
    }
    cadPanel.config.lablesDataSource = cadPanel.lablesDataSource;
    cadPanel.config.highlightDataSource = cadPanel.highlightDataSource;
    cadPanel.config.assetTypes = cadPanel.assetTypes;
    cadPanel.currentLabelsDS = cadPanel.lablesDataSource;
    cadPanel.currentHighlightDS = cadPanel.highlightDataSource;
}

