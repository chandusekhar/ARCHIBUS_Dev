
View.createController('abEqLocate_controller', {

    afterViewLoad: function(){
        this.abEqLocate_drawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle'));
    }
});

function showFloorDrawing(){
    var roomGrid = View.panels.get('abEqLocate_roomGrid');
    var selectedRowIndex = roomGrid.selectedRowIndex;
    var rows = roomGrid.rows;
    
    var buildingId = rows[selectedRowIndex]['eq.bl_id'];
    var floorId = rows[selectedRowIndex]['eq.fl_id'];
    var roomId = rows[selectedRowIndex]['eq.rm_id'];
    var dwgname = rows[selectedRowIndex]['eq.dwgname'];
    var restriction = new Ab.view.Restriction();
    restriction.addClause('rm.bl_id', buildingId);
    restriction.addClause('rm.fl_id', floorId);
    restriction.addClause('rm.rm_id', roomId);
	
	var opts = new DwgOpts();
	opts.rawDwgName = dwgname;
    opts.appendRec(buildingId + ';' +floorId + ';' + roomId);
	var drawingPanel = View.panels.get('abEqLocate_drawingPanel');
	drawingPanel.clear();
    drawingPanel.highlightAssets(opts);
    
    View.panels.get('abEqLocate_buttons').refresh(restriction);
    View.panels.get('abEqLocate_emList').refresh(restriction);
    View.panels.get('abEqLocate_eqList').refresh(restriction);
    View.panels.get('abEqLocate_fpList').refresh(restriction);
    View.panels.get('abEqLocate_jkList').refresh(restriction);
    View.panels.get('abEqLocate_pbList').refresh(restriction);
    View.panels.get('abEqLocate_pnList').refresh(restriction);
}
