
View.createController('abEqLocate_controller', {

    afterViewLoad: function(){
        this.abEqLocate_drawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle'));
    },
    
    abEqLocate_console_onShow: function(){
    	var restriction = this.abEqLocate_console.getFieldRestriction();
    	var sqlRestriction = "1 = 1";
    	var clauses = restriction.clauses;
    	for (var i=0; i<clauses.length; i++){
    		sqlRestriction += " AND " + clauses[i].name + " " + clauses[i].op + " '" + clauses[i].value + "'";
    	}
   		this.abEqLocate_roomGrid.addParameter("consoleRestriction", sqlRestriction);
    	this.abEqLocate_roomGrid.refresh();
    }
});

function showFloorDrawing(){
    var roomGrid = View.panels.get('abEqLocate_roomGrid');
    var selectedRowIndex = roomGrid.selectedRowIndex;
    var rows = roomGrid.rows;
    
    var buildingId = rows[selectedRowIndex]['rm.bl_id'];
    var floorId = rows[selectedRowIndex]['rm.fl_id'];
    var roomId = rows[selectedRowIndex]['rm.rm_id'];
    var dwgname = rows[selectedRowIndex]['rm.dwgname'];
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
