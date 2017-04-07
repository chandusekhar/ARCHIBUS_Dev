function buildingSelect(row) {
    var restriction = new Ab.view.Restriction();
    restriction.addClause('uc_confined_spaces.bl_id', row['bl.bl_id']);
    
    var floorNavPanel = View.panels.get('floorNav');
    if(floorNavPanel)
        floorNavPanel.refresh(restriction);
}

function floorSelect(row) {
    var building = row['uc_confined_spaces.bl_id'];
    var floor = row['uc_confined_spaces.fl_id'];
    var drawingName = row['uc_confined_spaces.dwgname'];
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause('uc_confined_spaces.bl_id', building);
    restriction.addClause('uc_confined_spaces.fl_id', floor);
    
    var floorInfoPanel = View.panels.get('floorInfo');
    if(floorInfoPanel)
        floorInfoPanel.refresh(restriction);
    
    loadDrawing(building, floor, drawingName);
}

function loadDrawing(building, floor, drawingName) {
    var drawingPanel = View.panels.get('confinedSpaceDrawing');
    if(drawingPanel) {
        drawingPanel.clear();
        
        var roomFill = new DwgFill();
        roomFill.bc = 0x000000; //Border Color
        roomFill.bt = 1; //Border Thickness
        roomFill.bo = 0.0; //Border Opacity (0.0 through 1.0)
        roomFill.fc = 0xffff00; //Fill Color
        
        var drawingOpts = new DwgOpts();
        drawingOpts.mode = "none";
        drawingOpts.rawDwgName = drawingName;
        drawingOpts.persistRecFills = true;
        
        var recordParameters = {
            tableName: 'rm',
            fieldNames: toJSON(['rm.bl_id', 'rm.fl_id', 'rm.rm_id']),
            restriction: toJSON("rm.bl_id='" + building + "' AND rm.fl_id='" + floor + "' AND rm.rm_id IN (SELECT DISTINCT rm_id FROM uc_confined_spaces WHERE bl_id='" + building + "' AND fl_id='" + floor + "')")
        };
        
        var recordResult = Workflow.call('AbCommonResources-getDataRecords', recordParameters);
        if(recordResult.data.records.length > 0) {
            for(var i = 0; i < recordResult.data.records.length; i++) {
                var record = recordResult.data.records[i];
                drawingOpts.appendRec(record['rm.bl_id'] + ';' + record['rm.fl_id'] + ';' + record['rm.rm_id'], roomFill);
            }
        }
        
        drawingPanel.highlightAssets(drawingOpts);
    }
}