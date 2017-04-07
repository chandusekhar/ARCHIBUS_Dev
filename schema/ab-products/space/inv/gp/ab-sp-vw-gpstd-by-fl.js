/**
 * @author keven.xi
 */

function refreshReport(){
    var floorGrid = View.panels.get('floorGrid');
    var selectedRowIndex = floorGrid.selectedRowIndex;
    var buildingId = floorGrid.rows[selectedRowIndex]["fl.bl_id"];
    var floorId = floorGrid.rows[selectedRowIndex]["fl.fl_id"];
    var restriction = new Ab.view.Restriction();
    restriction.addClause("gp.bl_id", buildingId, "=");
    restriction.addClause("gp.fl_id", floorId, "=");
    View.panels.get('gpStdReport').refresh(restriction);
    var title = getMessage("reportPanelTitle").replace("<{0}>", buildingId + "-" + floorId);
    setPanelTitle("gpStdReport", title);
}

