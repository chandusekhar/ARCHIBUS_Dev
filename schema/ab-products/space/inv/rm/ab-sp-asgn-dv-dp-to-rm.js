var abSpAsgnRmDpToRm_Controller = View.createController('abSpAsgnRmDpToRm_Controller', {
	onclickedFlObj:'',
    afterViewLoad: function(){
        this.abSpAsgnDvDpToRm_drawingPanel.appendInstruction("default", "", getMessage('selectFloor'));
        this.abSpAsgnDvDpToRm_drawingPanel.appendInstruction("ondwgload", "", getMessage('selectDp'));
        this.abSpAsgnDvDpToRm_drawingPanel.appendInstruction("abSpAsgnDvDpToRm_dpTree", "onclick", getMessage('selectRm'), true);
        // set event handler for clicking room on the drawing 
        this.abSpAsgnDvDpToRm_drawingPanel.addEventListener('onclick', onDrawingRoomClicked);
        this.abSpAsgnDvDpToRm_drawingPanel.addEventListener('ondwgload', this.onDwgLoaded.createDelegate(this));
    },
    
    abSpAsgnDvDpToRm_filterConsole_onShowTree: function() {
        var filterBlId = this.abSpAsgnDvDpToRm_filterConsole.getFieldValue('rm.bl_id');
        var filterDvId = this.abSpAsgnDvDpToRm_filterConsole.getFieldValue('rm.dv_id');
        var filterDpId = this.abSpAsgnDvDpToRm_filterConsole.getFieldValue('rm.dp_id');
        var blTreeRes = new Ab.view.Restriction();
        var dvRes = " IS NOT NULL";
        var dpRes = " IS NOT NULL";
        
        if (filterBlId) {
            blTreeRes.addClause("bl.bl_id", filterBlId, "=");
        }
        if (filterDvId) {
            dvRes = " = '" + filterDvId + "'";
        }
        if (filterDpId) {
            dpRes = " = '" + filterDpId + "'";
        }
        
        this.abSpAsgnDvDpToRm_drawingPanel.clear();
        this.abSpAsgnDvDpToRm_drawingPanel.isLoadedDrawing = false;
        this.abSpAsgnDvDpToRm_drawingPanel.processInstruction("default", '');
        
        this.abSpAsgnDvDpToRm_dpAssignGrid.removeRows(0);
        this.abSpAsgnDvDpToRm_dpAssignGrid.update();
        
        this.abSpAsgnDvDpToRm_blTree.refresh(blTreeRes);
        this.abSpAsgnDvDpToRm_dvTree.addParameter('dvRes', dvRes);
        this.abSpAsgnDvDpToRm_dvTree.addParameter('dpRes', dpRes);
        this.abSpAsgnDvDpToRm_dvTree.refresh();
    },
    
    onDwgLoaded: function() {
    	if(dvId && dpId) {
    		this.abSpAsgnDvDpToRm_drawingPanel.processInstruction("abSpAsgnDvDpToRm_dpTree", 'onclick', dvId + "-" + dpId);
    		this.abSpAsgnDvDpToRm_drawingPanel.setToAssign("dp.dp_id", dpId);
    	} else {
    		this.abSpAsgnDvDpToRm_drawingPanel.processInstruction("ondwgload", "", getMessage('selectDp'));
    	}
    }
});

var dvId;
var dpId;
var dvName;
var dpName;

/**
 * event handler when click tree node of dp level for the tree abSpAsgnDvDpToRm_dvTree.
 * @param {Object} ob
 */
function onDpTreeClick(ob){
    var drawingPanel = View.panels.get('abSpAsgnDvDpToRm_drawingPanel');
    var currentNode = View.panels.get('abSpAsgnDvDpToRm_dvTree').lastNodeClicked;
    dvId = currentNode.parent.data['dv.dv_id'];
    dpId = currentNode.data['dp.dp_id'];
    dvName = currentNode.parent.data['dv.name'];
    dpName = currentNode.data['dp.name'];
    enableColorAssignment();
    if (drawingPanel.isLoadedDrawing) {
        drawingPanel.setToAssign("dp.dp_id", dpId);
        drawingPanel.processInstruction("abSpAsgnDvDpToRm_dpTree", 'onclick', dvId + "-" + dpId);
    } else {
        View.showMessage(getMessage('noFloorSelected'));
    }
    setSelectability(abSpAsgnRmDpToRm_Controller.onclickedFlObj.restriction);
}

/**
 * Get the departments to reset color.
 * @param divisionId
 * @param departmentId
 */
function getDepartmentRecordsForColorReseting(divisionId, departmentId) {
	var dpRestriction = new Ab.view.Restriction();
	dpRestriction.addClause("dp.dv_id", divisionId, "=");
	dpRestriction.addClause("dp.dp_id", departmentId, "=");
	var dpRecords = View.dataSources.get('ds_ab-sp-asgn-dv-dp-to-rm_dp').getRecords(dpRestriction);
	return dpRecords;
}

/**
 * event handler when click tree node of floor level for the tree abSpAsgnDvDpToRm_blTree.
 * @param {Object} ob
 */
function onFlTreeClick(ob){
	abSpAsgnRmDpToRm_Controller.onclickedFlObj=ob;
    var currentNode = View.panels.get('abSpAsgnDvDpToRm_blTree').lastNodeClicked;
    var drawingPanel = View.panels.get('abSpAsgnDvDpToRm_drawingPanel');
    var grid = View.panels.get('abSpAsgnDvDpToRm_dpAssignGrid');
    setSelectability(ob.restriction);
    flTreeClickHandler(currentNode, drawingPanel, grid);
    drawingPanel.isLoadedDrawing = true;
}

/**
 * event handler when click rooms of the drawing panel.
 * @param {Object} pk
 * @param {boolean} selected
 */
function onDrawingRoomClicked(pk, selected){
	if (dvId && dpId) {
		var grid = View.panels.get("abSpAsgnDvDpToRm_dpAssignGrid");
		extendDrawingRoomClickHandler(pk, selected, grid, 'rm.dv_id', dvId, 'rm.dp_id', dpId,'rm.dv_name', dvName, 'rm.dp_name', dpName);
		View.panels.get('abSpAsgnDvDpToRm_drawingPanel').processInstruction("abSpAsgnDvDpToRm_dpTree", 'onclick', dvId + "-" + dpId);
	} else {
		if(!dpId) {
			View.panels.get('abSpAsgnDvDpToRm_drawingPanel').processInstruction("ondwgload", "", getMessage('selectDp'));
		}
	}
}

/**
 * event handler when click button 'revert all'.
 */
function resetAssignmentCtrls(){
    var drawingPanel = View.panels.get('abSpAsgnDvDpToRm_drawingPanel');
    var grid = View.panels.get("abSpAsgnDvDpToRm_dpAssignGrid");
    resetAssignment(drawingPanel, grid);
    if(dvId && dpId) {
    	drawingPanel.setToAssign("dp.dp_id", dpId);
    	drawingPanel.processInstruction("abSpAsgnDvDpToRm_dpTree", 'onclick', dvId + "-" + dpId);
    } else {
    	drawingPanel.processInstruction("ondwgload", '');
    }
}

/**
 * event handler when click button 'save'.
 */
function saveAllChanges(){
    var dsChanges = View.dataSources.get("ds_ab-sp-asgn-dv-dp-to-rm_drawing_rmLabel");
    var drawingPanel = View.panels.get('abSpAsgnDvDpToRm_drawingPanel');
    var grid = View.panels.get("abSpAsgnDvDpToRm_dpAssignGrid");
    saveChange(drawingPanel, grid, dsChanges, ['rm.dv_id', 'rm.dp_id'], false);
    if(dvId && dpId) {
    	drawingPanel.processInstruction("abSpAsgnDvDpToRm_dpTree", 'onclick', dvId + "-" + dpId);
		drawingPanel.setToAssign("dp.dp_id", dpId);
    } else {
    	drawingPanel.processInstruction("ondwgload", "", getMessage('selectDp'));
    }
}

/**
 * event handler lisenner after create the tree node lable
 */
function afterGeneratingTreeNode(treeNode){
    addLegendToTreeNode('abSpAsgnDvDpToRm_dvTree', treeNode, 1, 'dp', 'dp.dp_id');
}

/**
 * set unoccupiable room unselected.
 * @param {Object} restriction
 */
function setSelectability(restriction){
    var drawingPanel = View.panels.get('abSpAsgnDvDpToRm_drawingPanel')
    var rmRecords = View.dataSources.get('ds_ab-sp-rm_occupiable').getRecords(restriction);
    for (var i = 0; i < rmRecords.length; i++) {
        var record = rmRecords[i];
        var supercat = record.getValue('rmcat.supercat');
        var blId = record.getValue('rm.bl_id');
        var flId = record.getValue('rm.fl_id');
        var rmId = record.getValue('rm.rm_id');
        var opts_selectable = new DwgOpts();
        opts_selectable.appendRec(blId + ';' + flId + ';' + rmId);
        
        //kb:3030349,by comments (JIANBING 2012-08-09 11:16)1. In view ab-sp-asgn-dv-dp-to-rm.axvw, 
        //I am not able to assign dv-dp to service area. User should be able to assign dv-dp to sevice area. 
        
        if (supercat == 'VERT') {
            drawingPanel.setSelectability.defer(1000, this, [opts_selectable, false]);
        }else{
        	drawingPanel.setSelectability.defer(1000, this, [opts_selectable, true]);
        }
    }
}

function enableColorAssignment() {
	if(dvId && dpId) {
		var dpRecord = getDepartmentRecordsForColorReseting(dvId,dpId);
	    resetAssgnColor('dp.hpattern_acad', dpRecord, 'dp.dv_id', dvId, 'dp.dp_id', dpId);
	}
}
