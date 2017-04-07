/**
 * @author keven.xi
 */
function refreshReport(){
    var buildingGrid = View.panels.get('buildingGrid');
    var buildingId = buildingGrid.rows[buildingGrid.selectedRowIndex]["bl.bl_id"];
    var restriction = new Ab.view.Restriction();
    restriction.addClause("gp.bl_id", buildingId, "=");
    View.panels.get('gpStdReport').refresh(restriction);
    var title = getMessage("reportPanelTitle").replace("<{0}>", buildingId);
    setPanelTitle("gpStdReport", title);
}

