var abSpAsgnUserDpToRm_Controller = View.createController('abSpAsgnUserDpToRm_Control', {

    afterViewLoad: function(){
        this.abSpAsgnUserDpToRm_drawingPanel.appendInstruction("default", "", getMessage('selectFloor'));
        //this.abSpAsgnUserDpToRm_drawingPanel.appendInstruction("ondwgload", "", getMessage('selectRm'));
        // set event handler for clicking room on the drawing 
        this.abSpAsgnUserDpToRm_drawingPanel.addEventListener('onclick', onDrawingRoomClicked);
        this.abSpAsgnUserDpToRm_drawingPanel.addEventListener('ondwgload', this.onDwgLoaded.createDelegate(this));
        dvId = View.user.employee.organization.divisionId;
        dpId = View.user.employee.organization.departmentId;
    },
    
    abSpAsgnUserDpToRm_filterConsole_onShowFlTree: function(){
        var blId = this.abSpAsgnUserDpToRm_filterConsole.getFieldValue("rm.bl_id");
        var flId = this.abSpAsgnUserDpToRm_filterConsole.getFieldValue("rm.fl_id");
        var blRes = "bl.bl_id IS NOT NULL";
        var flRes = "fl.fl_id IS NOT NULL";
        if (blId && flId) {
            blRes = "bl.bl_id ='" + blId + "' AND EXISTS (SELECT 1 FROM fl WHERE fl.bl_id = bl.bl_id AND fl.fl_id ='" + flId + "')";
            flRes = "fl.fl_id ='" + flId + "'";
        }
        if (blId && !flId) {
            blRes = "bl.bl_id ='" + blId + "'";
        }
        if (!blId && flId) {
            blRes = "EXISTS (SELECT 1 FROM fl WHERE fl.bl_id = bl.bl_id AND fl.fl_id ='" + flId + "')";
            flRes = "fl.fl_id ='" + flId + "'";
        }
        this.abSpAsgnUserDpToRm_blTree.addParameter('blRes', blRes);
        this.abSpAsgnUserDpToRm_blTree.addParameter('flRes', flRes);
        this.abSpAsgnUserDpToRm_blTree.refresh();
        this.abSpAsgnUserDpToRm_drawingPanel.clear();
        this.abSpAsgnUserDpToRm_drawingPanel.processInstruction("default", '');
        this.abSpAsgnUserDpToRm_dpAssignGrid.removeRows(0);
        this.abSpAsgnUserDpToRm_dpAssignGrid.update();
        resetAssignmentGrid();
    },
    
    /**
     * Prohibit users from clicking on the rooms which don't belong to the users.
     */
    onDwgLoaded: function() {
    	this.abSpAsgnUserDpToRm_drawingPanel.setTitleMsg(getMessage('selectRm'));
    	disableClickingOnGreyRooms();
    },
    
    abSpAsgnUserDpToRm_dpAssignGrid_onClaim: function(){
        saveChangesByActionType('claim');
    },
    
    abSpAsgnUserDpToRm_dpAssignGrid_onRelease: function(){
        saveChangesByActionType('release');
    }
});

var dvId;
var dpId;
var blId = "";
var flId = "";
var actionType = null;

/**
 * event handler when click tree node of floor level for the tree abSpAsgnUserDpToRm_blTree.
 * @param {Object} ob
 */
function onFlTreeClick(ob){
    var currentNode = View.panels.get('abSpAsgnUserDpToRm_blTree').lastNodeClicked;
    var drawingPanel = View.panels.get('abSpAsgnUserDpToRm_drawingPanel');
    var grid = View.panels.get('abSpAsgnUserDpToRm_dpAssignGrid');
    flTreeClickHandler(currentNode, drawingPanel, grid);
    blId = ob.restriction.clauses[0].value;
    flId = ob.restriction.clauses[1].value;
    resetAssignmentGrid();
    drawingPanel.setTitleMsg(getMessage('selectRm'));
}

/**
 * event handler when click rooms of the drawing panel.
 * @param {Object} pk
 * @param {boolean} selected
 */
function onDrawingRoomClicked(pk, selected) {
    var grid = View.panels.get("abSpAsgnUserDpToRm_dpAssignGrid");
    var releaseAction = grid.actions.get('release');
    var claimAction = grid.actions.get('claim');
    if (selected && !actionType) {
        var ds = View.dataSources.get('ds_ab-sp-asgn-user-dp-to-rm_drawing_rmHighlight');
        var roomDvId = getDbRoomVal(ds, pk[0], pk[1], pk[2], 'rm.dv_id');
        if (roomDvId) {
            releaseAction.show(true);
            claimAction.show(false);
            actionType = 'release';
        } else {
            releaseAction.show(false);
            claimAction.show(true);
            actionType = 'claim';
        } 
        setSelectabilityByActionType();
    }
    drawingRoomClickHandler(pk, selected, grid, 'rm.dv_id', dvId, 'rm.dp_id', dpId);
    if (actionType && grid.rows.length == 0) {
        resetAssignmentGrid();
    }
    
    View.panels.get('abSpAsgnUserDpToRm_drawingPanel').setTitleMsg(getMessage('selectRm'));
}

/**
 * reset the assignment grid panel hidden the actions.
 */
function resetAssignmentGrid(){
    var grid = View.panels.get("abSpAsgnUserDpToRm_dpAssignGrid");
    actionType = null;
    grid.actions.get('release').show(false);
    grid.actions.get('claim').show(false);
    
    setSelectabilityByActionType();
}


/**
 * set selection ability by actionType .
 */
function setSelectabilityByActionType(){
    var ds = View.dataSources.get('ds_ab-sp-asgn-user-dp-to-rm_drawing_rmHighlight');
    var res = " AND rm.bl_id='" + blId + "' AND rm.fl_id='" + flId + "'"
    var claimRecords = ds.getRecords('rm.dv_id IS NULL AND rm.dp_id IS NULL' + res);
    var releaseRecords = ds.getRecords('rm.dv_id IS NOT NULL AND rm.dp_id IS NOT NULL' + res);
    var isClaim = true;
    var isRelease = true;
    if (actionType == 'claim') {
        isRelease = false;
    }
    if (actionType == 'release') {
        isClaim = false;
    }
    setSelectability(claimRecords, isClaim);
    setSelectability(releaseRecords, isRelease);
}


/**
 * set selection ability.
 * @param {Array} records
 * @param {boolean} iSelectable
 */
function setSelectability(records, iSelectable) {
    var opts_selectable = new DwgOpts();
    for (var i = 0; i < records.length; i++) {
        var record = records[i];
        var blId = record.getValue('rm.bl_id');
        var flId = record.getValue('rm.fl_id');
        var rmId = record.getValue('rm.rm_id');
        opts_selectable.appendRec(blId + ';' + flId + ';' + rmId);
    }
    View.panels.get('abSpAsgnUserDpToRm_drawingPanel').setSelectability(opts_selectable, iSelectable);
}

/**
 * save changes according action type
 * @param {String} actionType 'claim' or 'release'
 */
function saveChangesByActionType(actionType){
    var dsChanges = View.dataSources.get("ds_ab-sp-asgn-user-dp-to-rm_drawing_rmLabel");
    var drawingPanel = View.panels.get('abSpAsgnUserDpToRm_drawingPanel');
    var grid = View.panels.get("abSpAsgnUserDpToRm_dpAssignGrid");
    if (actionType == 'release') {
        for (i = 0; i < grid.gridRows.length; i++) {
            var record = grid.gridRows.items[i];
            record.setFieldValue('rm.dv_id', '');
            record.setFieldValue('rm.dp_id', '');
        }
    }
    saveChange(drawingPanel, grid, dsChanges, ['rm.dv_id', 'rm.dp_id'], false);
    resetAssignmentGrid();
    drawingPanel.setTitleMsg(getMessage('selectRm'));
    disableClickingOnGreyRooms();
}

function disableClickingOnGreyRooms() {
	var ds = View.dataSources.get('ds_ab-sp-asgn-user-dp-to-rm_drawing_rmNotClicked');
	var cannotClicked = " rm.bl_id='" + blId + "' AND rm.fl_id='" + flId + "'";
	var cannotClickedRecords = ds.getRecords(cannotClicked);
	setSelectability(cannotClickedRecords, false);
}
