
function showEqByLocRm(){
    var grid = View.panels.get('abBldgopsReportEqInfoByLocRmTree');
    
    var selectedRow = grid.rows[grid.selectedRowIndex];
     var blId = selectedRow["rm.bl_id"];
	 var flId = selectedRow["rm.fl_id"];
	 var rlId = selectedRow["rm.rm_id"];
	 
	 
    var eqReport = View.panels.get('abBldgopsReportEqInfoByLocRmReport');
	
	var restriction = new Ab.view.Restriction();
	if (blId) {
		restriction.addClause('eq.bl_id', blId, '=');
	}
	if (flId) {
		restriction.addClause('eq.fl_id', flId, '=');
	}
	if (rlId) {
		restriction.addClause('eq.rm_id', rlId, '=');
	}
    eqReport.refresh(restriction);
}
