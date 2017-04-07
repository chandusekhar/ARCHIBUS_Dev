/**
 * @author keven.xi
 */
function refreshReport(){
    //refresh floorsGrid
    var buildingGrid = View.panels.get('buildingsGrid');
    var buildingId = buildingGrid.rows[buildingGrid.selectedRowIndex]["bl.bl_id"];
    var restriction = new Ab.view.Restriction();
    restriction.addClause("fl.bl_id", buildingId, "=");
    View.panels.get('floorsReport').refresh(restriction);
    //set panels title
    var title = getMessage("buildingDetailFormTitle").replace("<{0}>", buildingId);
    setPanelTitle("buildingForm", title);
    title = getMessage("floorPanelTitle").replace("<{0}>", buildingId);
    setPanelTitle("floorsReport", title);
}
