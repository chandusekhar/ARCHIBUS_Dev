var controller = View.createController('abSpAsgnRmstdToRm_Control', {
    initialized: false,
    
    afterViewLoad: function(){
        this.abSpAsgnRmstdToRm_drawingPanel.appendInstruction("default", "", getMessage('selectFloor'));
        this.abSpAsgnRmstdToRm_drawingPanel.appendInstruction("ondwgload", "", getMessage('selectStd'));
        this.abSpAsgnRmstdToRm_drawingPanel.appendInstruction("abSpAsgnRmstdToRm_rmstdGrid", "onclick", getMessage('selectRm'), true);
        
        // set event handler for clicking room on the drawing 
        this.abSpAsgnRmstdToRm_drawingPanel.addEventListener('onclick', onDrawingRoomClicked);
        this.abSpAsgnRmstdToRm_rmstdAssignGrid.sortEnabled = false;
		//fix KB3025721 by Guo Jiangtao 2010-02-08
		refreshLegendGrid.defer(200);
    },
    
    abSpAsgnRmstdToRm_rmstdGrid_afterRefresh: function(){
        this.abSpAsgnRmstdToRm_rmstdGrid.setColorOpacity(this.abSpAsgnRmstdToRm_drawingPanel.getFillOpacity());
        
        // Set the default colors to use based on the ones in the grid
        // This is done so that the drawing control uses the same colors
        var rows = this.abSpAsgnRmstdToRm_rmstdGrid.rows;
        var opacity = this.abSpAsgnRmstdToRm_drawingPanel.getFillOpacity();
        for (var i = 0; i < rows.length; i++) {
            var val = rows[i]['rmstd.rm_std'];
            var color = '';
            var hpval = rows[i]['rmstd.hpattern_acad'];
            if (hpval.length) 
                color = gAcadColorMgr.getRGBFromPattern(hpval, true);
            else {
                color = gAcadColorMgr.getColorFromValue('rmstd.rm_std', val, true);
                //rows[i].row.dom.bgColor
				//fix KB3026955 by Guo Jiangtao 2010-04-19
                var cellEl = Ext.get(rows[i].row.cells.get('abSpAsgnRmstdToRm_rmstdLegend').dom.firstChild);
                cellEl.setStyle('background-color', color);
                cellEl.setOpacity(opacity);
            }
            gAcadColorMgr.setColor('rmstd.rm_std', val, color);
        }
        
        if (!this.initialized) {
            this.initialized = true;
            this.abSpAsgnRmstdToRm_rmstdGrid.update();
        }
    },
    
    abSpAsgnRmstdToRm_filterConsole_onShowTree: function(){
        var filterBlId = this.abSpAsgnRmstdToRm_filterConsole.getFieldValue('rm.bl_id');
        var filterRmStd = this.abSpAsgnRmstdToRm_filterConsole.getFieldValue('rm.rm_std');
        var blTreeRes = new Ab.view.Restriction();
        var rmStdTreeRes = new Ab.view.Restriction();
        
        if (filterBlId) {
            blTreeRes.addClause("bl.bl_id", filterBlId, "=");
        }
        
        if (filterRmStd) {
            rmStdTreeRes.addClause("rmstd.rm_std", filterRmStd, "=");
        }
        this.abSpAsgnRmstdToRm_drawingPanel.clear();
        this.abSpAsgnRmstdToRm_drawingPanel.isLoadedDrawing = false;
        this.abSpAsgnRmstdToRm_drawingPanel.processInstruction("default", '');
        
        this.abSpAsgnRmstdToRm_rmstdAssignGrid.removeRows(0);
        this.abSpAsgnRmstdToRm_rmstdAssignGrid.update();
        
        this.abSpAsgnRmstdToRm_blTree.refresh(blTreeRes);
        this.abSpAsgnRmstdToRm_rmstdGrid.refresh(rmStdTreeRes);
    }
});

var rmStdId;

/**
 * event handler when click row of the grid abSpAsgnRmstdToRm_rmstdGrid.
 * @param {Object} row
 */
function onRmStdSelected(row){
    var drawingPanel = View.panels.get('abSpAsgnRmstdToRm_drawingPanel');
    rmStdId = row['rmstd.rm_std'];
    if (drawingPanel.isLoadedDrawing) {
        drawingPanel.setToAssign("rmstd.rm_std", rmStdId);
        drawingPanel.processInstruction(row.grid.id, 'onclick', rmStdId);
    }
    else {
        View.showMessage(getMessage('noFloorSelected'));
    }
}

/**
 * event handler when click tree node of floor level for the tree abSpAsgnRmstdToRm_blTree.
 * @param {Object} ob
 */
function onFlTreeClick(ob){
	var currentNode = View.panels.get('abSpAsgnRmstdToRm_blTree').lastNodeClicked;
    var drawingPanel = View.panels.get('abSpAsgnRmstdToRm_drawingPanel');
    var grid = View.panels.get('abSpAsgnRmstdToRm_rmstdAssignGrid');
    flTreeClickHandler(currentNode, drawingPanel, grid);
    drawingPanel.isLoadedDrawing = true;
}

/**
 * event handler when click rooms of the drawing panel.
 * @param {Object} pk
 * @param {boolean} selected
 */
function onDrawingRoomClicked(pk, selected){
    var grid = View.panels.get("abSpAsgnRmstdToRm_rmstdAssignGrid");
    drawingRoomClickHandler(pk, selected, grid, 'rm.rm_std', rmStdId)
    View.panels.get('abSpAsgnRmstdToRm_drawingPanel').processInstruction("abSpAsgnRmstdToRm_rmstdGrid", 'onclick', rmStdId);
}

/**
 * event handler when click button 'revert all'.
 */
function resetAssignmentCtrls(){
    var drawingPanel = View.panels.get('abSpAsgnRmstdToRm_drawingPanel');
    var grid = View.panels.get("abSpAsgnRmstdToRm_rmstdAssignGrid");
    resetAssignment(drawingPanel, grid);
    drawingPanel.processInstruction("ondwgload", '');
}

/**
 * event handler when click button 'save'.
 */
function saveAllChanges(){
    var dsChanges = View.dataSources.get("ds_ab-sp-assgn-rmstd-to-rm_drawing_rmHighlight");
    var drawingPanel = View.panels.get('abSpAsgnRmstdToRm_drawingPanel');
    var grid = View.panels.get("abSpAsgnRmstdToRm_rmstdAssignGrid");
    saveChange(drawingPanel, grid, dsChanges, ['rm.rm_std'], true);
    drawingPanel.processInstruction("ondwgload", '');
}

/**
 * refresh legend grid.
 */
function refreshLegendGrid(){
    var grid = View.panels.get("abSpAsgnRmstdToRm_rmstdGrid");
	grid.refresh();
}
