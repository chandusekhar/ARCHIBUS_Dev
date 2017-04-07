/**
 * Show eq by fl selected
 */
function showEqByLocFl(){
    var grid = View.panels.get('abBldgopsReportdEqInfoByLocFlTree');
    
    var selectedRow = grid.rows[grid.selectedRowIndex];
     var blId = selectedRow["fl.bl_id"];
	 var flId = selectedRow["fl.fl_id"];
    var eqReport = View.panels.get('abBldgopsReportEqInfoByLocFlReport');
	
	var restriction = new Ab.view.Restriction();
	if (blId) {
		restriction.addClause('eq.bl_id', blId, '=');
	}
	if (flId) {
		restriction.addClause('eq.fl_id', flId, '=');
	}
    eqReport.refresh(restriction);
}
