var abSpAsgnRmCatRmTypeToRm_Controller = View.createController('abSpAsgnRmCatRmTypeToRm_Control', {

    afterViewLoad: function(){
        this.abSpAsgnRmcatRmTypeToRm_drawingPanel.appendInstruction("default", "", getMessage('selectFloor'));
        this.abSpAsgnRmcatRmTypeToRm_drawingPanel.appendInstruction("ondwgload", "", getMessage('selectType'));
        this.abSpAsgnRmcatRmTypeToRm_drawingPanel.appendInstruction("abSpAsgnRmcatRmTypeToRm_rmtypeTree", "onclick", getMessage('selectRm'), true);
        // set event handler for clicking room on the drawing 
        this.abSpAsgnRmcatRmTypeToRm_drawingPanel.addEventListener('onclick', onDrawingRoomClicked);
    },
    
    abSpAsgnRmcatRmTypeToRm_filterConsole_onShowTree: function(){
        var filterBlId = this.abSpAsgnRmcatRmTypeToRm_filterConsole.getFieldValue('rm.bl_id');
        var filterRmCat = this.abSpAsgnRmcatRmTypeToRm_filterConsole.getFieldValue('rm.rm_cat');
        var blTreeRes = new Ab.view.Restriction();
        var rmCatTreeRes = new Ab.view.Restriction();
        
        if (filterBlId) {
            blTreeRes.addClause("bl.bl_id", filterBlId, "=");
        }
        
        if (filterRmCat) {
            rmCatTreeRes.addClause("rmcat.rm_cat", filterRmCat, "=");
        }
        this.abSpAsgnRmcatRmTypeToRm_drawingPanel.clear();
        this.abSpAsgnRmcatRmTypeToRm_drawingPanel.isLoadedDrawing = false;
        this.abSpAsgnRmcatRmTypeToRm_drawingPanel.processInstruction("default", '');
        
        this.abSpAsgnRmcatRmTypeToRm_rmtypeAssignGrid.removeRows(0);
        this.abSpAsgnRmcatRmTypeToRm_rmtypeAssignGrid.update();
        
        this.abSpAsgnRmcatRmTypeToRm_blTree.refresh(blTreeRes);
        this.abSpAsgnRmcatRmTypeToRm_rmcatTree.refresh(rmCatTreeRes);
    }
});

var rmTypeId;
var rmCatId;

/**
 * event handler when click tree node of room type level for the tree abSpAsgnRmcatRmTypeToRm_rmcatTree.
 * @param {Object} ob
 */
function onRmTypeTreeClick(ob){
    var drawingPanel = View.panels.get('abSpAsgnRmcatRmTypeToRm_drawingPanel');
    var currentNode = View.panels.get('abSpAsgnRmcatRmTypeToRm_rmcatTree').lastNodeClicked;
    rmTypeId = currentNode.data['rmtype.rm_type'];
    rmCatId = currentNode.parent.data['rmcat.rm_cat'];
    var rmTypeRecord = getRmTypeRecordsForColorReseting(rmCatId, rmTypeId);
    resetAssgnColor('rmtype.hpattern_acad', rmTypeRecord, 'rmtype.rm_cat', rmCatId, 'rmtype.rm_type', rmTypeId);
    if (drawingPanel.isLoadedDrawing) {
        drawingPanel.setToAssign("rmtype.rm_type", rmTypeId);
        drawingPanel.processInstruction("abSpAsgnRmcatRmTypeToRm_rmtypeTree", 'onclick', rmCatId + "-" + rmTypeId);
    }
    else {
        View.showMessage(getMessage('noFloorSelected'));
    }
}

function getRmTypeRecordsForColorReseting(roomCategory, roomType) {
	var restriction = new Ab.view.Restriction();
	restriction.addClause("rmtype.rm_cat", roomCategory, "=");
	restriction.addClause("rmtype.rm_type", roomType, "=");
	var rmTypeRecord = View.dataSources.get('ds_ab-sp-asgn-rmcat-rmtype-to-rm_rmtype').getRecords(restriction);
	return rmTypeRecord;
}

/**
 * event handler when click tree node of floor level for the tree abSpAsgnRmcatRmTypeToRm_blTree.
 * @param {Object} ob
 */
function onFlTreeClick(ob){
	var currentNode = View.panels.get('abSpAsgnRmcatRmTypeToRm_blTree').lastNodeClicked;
    var drawingPanel = View.panels.get('abSpAsgnRmcatRmTypeToRm_drawingPanel');
    var grid = View.panels.get('abSpAsgnRmcatRmTypeToRm_rmtypeAssignGrid');
    flTreeClickHandler(currentNode, drawingPanel, grid);
    drawingPanel.isLoadedDrawing = true;
}

/**
 * event handler when click rooms of the drawing panel.
 * @param {Object} pk
 * @param {boolean} selected
 */
function onDrawingRoomClicked(pk, selected){
    var grid = View.panels.get("abSpAsgnRmcatRmTypeToRm_rmtypeAssignGrid");
    drawingRoomClickHandler(pk, selected, grid, 'rm.rm_cat', rmCatId, 'rm.rm_type', rmTypeId);
    View.panels.get('abSpAsgnRmcatRmTypeToRm_drawingPanel').processInstruction("abSpAsgnRmcatRmTypeToRm_rmtypeTree", 'onclick', rmCatId + "-" + rmTypeId);
}

/**
 * event handler when click button 'revert all'.
 */
function resetAssignmentCtrls(){
    var drawingPanel = View.panels.get('abSpAsgnRmcatRmTypeToRm_drawingPanel');
    var grid = View.panels.get("abSpAsgnRmcatRmTypeToRm_rmtypeAssignGrid");
    resetAssignment(drawingPanel, grid);
    drawingPanel.processInstruction("ondwgload", '');
}

/**
 * event handler when click button 'save'.
 */
function saveAllChanges(){
    var dsChanges = View.dataSources.get("ds_ab-sp-asgn-rmcat-rmtype-to-rm_drawing_rmLabel");
    var drawingPanel = View.panels.get('abSpAsgnRmcatRmTypeToRm_drawingPanel');
    var grid = View.panels.get("abSpAsgnRmcatRmTypeToRm_rmtypeAssignGrid");
    saveChange(drawingPanel, grid, dsChanges, ['rm.rm_cat', 'rm.rm_type'], true);
    drawingPanel.processInstruction("ondwgload", '');
}

/**
 * event handler lisenner after create the tree node lable
 */
function afterGeneratingTreeNode(treeNode){
    addLegendToTreeNode('abSpAsgnRmcatRmTypeToRm_rmcatTree', treeNode, 1, 'rmtype', 'rmtype.rm_type');
}
