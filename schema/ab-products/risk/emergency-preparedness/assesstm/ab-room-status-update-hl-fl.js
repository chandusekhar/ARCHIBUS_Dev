var controller = View.createController('abHazmatPlans', {

    //----------------event handle--------------------
    afterViewLoad: function () {
        //hide several panel
        this.abEgressPlans_DrawingPanel.appendInstruction("default", "", getMessage('dPTitle_rms'));
        // add event listener for drawing click
        this.abEgressPlans_DrawingPanel.addEventListener('onclick', this.onDwgPanelClicked, this);   
        // add event listener for check box click
        this.abEgressPlans_rmdetailGrid.addEventListener('onMultipleSelectionChange', this.onGridPanelClicked, this);   
        
        this.abEgressPlans_rmdetailGrid.show(false); 
        
        ABEP_appendRuleSetForRecoveryStatus("rm", this.abEgressPlans_DrawingPanel, this.abEgressPlans_drawing_rmHighlight);
    },
    
    onDwgPanelClicked: function(pk, selected) {     	      	 
    	this.abEgressPlans_rmdetailGrid.gridRows.each(function(row){
    		if (row.getFieldValue("rm.bl_id") == pk[0] && row.getFieldValue("rm.fl_id") == pk[1] && row.getFieldValue("rm.rm_id") == pk[2]) {
    			if (selected) {
    				row.select();
    			} else {
    				row.unselect();
    			} 
    		}
    	});
    },
    
    onGridPanelClicked: function(row) {    	
    	var roomArray = [];
		var room = [row.row.getFieldValue('rm.bl_id'), row.row.getFieldValue('rm.fl_id'), row.row.getFieldValue('rm.rm_id')];
		roomArray.push(room);
    	
    	if (row.row.isSelected()) {
    		this.abEgressPlans_DrawingPanel.selectAssets(roomArray);
    	} else {
    		this.abEgressPlans_DrawingPanel.unselectAssets(roomArray);
    	} 
    	
    },
    
    afterInitialDataFetch: function () {
        this.abEgressPlans_select_flooring.refresh("fl.bl_id=''");
        var objSetRecoveryStatus = Ext.get('setRecStatus');
        if (valueExists(objSetRecoveryStatus)) {
            objSetRecoveryStatus.on('click', this.showRoomDetailStatusMenu, this, null);
        }
    },
    
    showRoomDetailStatusMenu: function (e, item) {
        var index = this.abEgressPlans_grid_rmdetail.fieldDefs.indexOfKey('rm.recovery_status');
        var enumValues = this.abEgressPlans_grid_rmdetail.fieldDefs.items[index].enumValues;

        var menuItems = [];
        for (var name in enumValues) {
            menuItems.push({
                text: enumValues[name],
                handler: this.onChangeRoomStatus.createDelegate(this, [name])
            });
        }
        var menu = new Ext.menu.Menu({
            items: menuItems
        });
        menu.showAt(e.getXY());
    },
    
    onChangeRoomStatus: function (menuItemId) {
        var selectedRecords = this.abEgressPlans_rmdetailGrid.getSelectedRecords();
        if (selectedRecords.length < 1) {
            View.showMessage(getMessage('noRecordsSelected'));
            return;
        }
        for (var i = 0; i < selectedRecords.length; i++) {
            selectedRecords[i].setValue("rm.recovery_status", menuItemId);
        }
        try {
            var result = Workflow.callMethod("AbRiskEmergencyPreparedness-EPCommonService-updateRoomRecoveryStatus", selectedRecords, menuItemId);
            if (result.code == "executed") {
                this.abEgressPlans_rmdetailGrid.refresh();
                this.abEgressPlans_DrawingPanel.refresh();
                View.showMessage(getMessage("recordsSuccessfullyUpdated"));                
            }
        } catch (e) {
            Workflow.handleError(e);
        }
    }
});

var buildingId = null;
var floorId = null;
var dwgname = null;

//if the first building has the floor ,display them
function blPanelAfterRefresh() {
    var blPanel = View.panels.get('abEgressPlans-select-building');

    var rows = blPanel.rows;
    if (rows.length > 0) {
        var blId = rows[0]['bl.bl_id'];
        var blRes = new Ab.view.Restriction();
        blRes.addClause('fl.bl_id', blId, '=');
        View.panels.get('abEgressPlans_select_flooring').refresh(blRes);
    }
}
function showDrawing() {
    var buildingDrawing = View.panels.get('abEgressPlans_select_flooring');
    var selectedIndex = buildingDrawing.selectedRowIndex;
    buildingId = buildingDrawing.rows[selectedIndex]["fl.bl_id"];
    floorId = buildingDrawing.rows[selectedIndex]["fl.fl_id"];
    dwgname = buildingDrawing.rows[selectedIndex]["fl.dwgname"];
    disPlayDrawing();
}
/**
 * button for the select layer and assettype of the zone and recompliance
 */
function disPlayDrawing() {
    if (!buildingId || !floorId) {
        return;
    }
    var drawingPanel = View.panels.get('abEgressPlans_DrawingPanel');
    drawingPanel.clear();

    var title = String.format(getMessage('dPTitle_rms') + " : " + buildingId + "-" + floorId);
    addDrawingByType(null, 'rm', null, 'abEgressPlans_drawing_rmHighlight', 'abEgressPlans_drawing_rmLabel', 'abEgressPlans_rmdetailGrid')

    View.panels.get('abEgressPlans_rmdetailGrid').show(true);

    drawingPanel.appendInstruction("default", "", title);
    drawingPanel.processInstruction("default", "");
}
/**
 set the asset ,currentHighlightDS ,currentLabelsDS  and locate it to the json and swf file
 */
function addDrawingByType(assetTypesSuffix, tablename, backgroundSuffix, currentHighlightDS, currentLabelsDS, detailgrid, resValue) {
    var drawingPanel = View.panels.get('abEgressPlans_DrawingPanel');
    var opts = new DwgOpts();
    var restriction = new Ab.view.Restriction();
    var assetType = tablename;

    restriction.addClause(tablename + '.bl_id', buildingId, '=');
    restriction.addClause(tablename + '.fl_id', floorId, '=');
    drawingPanel.clear();

    drawingPanel.assetTypes = assetType; //tablename;
    drawingPanel.currentHighlightDS = currentHighlightDS;
    drawingPanel.currentLabelsDS = currentLabelsDS;

    var dcl = new Ab.drawing.DwgCtrlLoc(buildingId, floorId, null, dwgname);
    drawingPanel.addDrawing.defer(200, drawingPanel, [dcl, opts]);

    if (tablename == "zone") {
        restriction.addClause('zone.layer_name', resValue, '=');
    }
    if (tablename == "regcompliance") {
        restriction.addClause('regcompliance.regulation', resValue, '=');
    }
    View.panels.get(detailgrid).refresh(restriction);
}
